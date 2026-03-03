import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, Clock, ChevronRight, AlertCircle, Check, Flame } from "lucide-react";
import type { SuggestedHabit } from "./HabitSuggestions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScheduledHabit {
  habitId: string;
  habitName: string;
  daysOfWeek: number[]; // 0=Dom, 1=Seg, ..., 6=Sáb
  timeSlot: string; // "HH:MM"
  durationMinutes: number;
  category: string;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  status: "active" | "completed" | "upcoming";
  habits: ScheduledHabit[];
}

interface WeeklyRoutineSetupProps {
  habits: SuggestedHabit[];
  onComplete: (schedule: ScheduledHabit[], season: Season) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const SEASON_DURATIONS = [
  { days: 21, label: "21 dias", description: "Ciclo padrão de formação de hábito" },
  { days: 30, label: "1 mês", description: "Ciclo mensal de evolução" },
  { days: 60, label: "2 meses", description: "Ciclo de consolidação" },
  { days: 90, label: "3 meses", description: "Ciclo de transformação profunda" },
];

const DEFAULT_TIMES: Record<string, string> = {
  Manhã: "07:00",
  Tarde: "15:00",
  Noite: "20:00",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toggle = (arr: number[], val: number): number[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const hasConflict = (schedules: ScheduledHabit[], habitId: string, days: number[], time: string): boolean => {
  return schedules.some(
    (s) =>
      s.habitId !== habitId &&
      s.timeSlot === time &&
      s.daysOfWeek.some((d) => days.includes(d))
  );
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function WeeklyRoutineSetup({ habits, onComplete }: WeeklyRoutineSetupProps) {
  const [schedules, setSchedules] = useState<ScheduledHabit[]>(() =>
    habits.map((h) => ({
      habitId: h.id,
      habitName: h.name,
      daysOfWeek: getDefaultDays(h.frequencyPerWeek),
      timeSlot: DEFAULT_TIMES[h.suggestedPeriod] || "20:00",
      durationMinutes: h.durationMinutes,
      category: h.category,
    }))
  );

  const [seasonDuration, setSeasonDuration] = useState(21);
  const [step, setStep] = useState<"routine" | "season">("routine");

  function getDefaultDays(freq: number): number[] {
    const options: Record<number, number[]> = {
      1: [1],
      2: [1, 4],
      3: [1, 3, 5],
      4: [1, 2, 4, 5],
      5: [1, 2, 3, 4, 5],
      6: [1, 2, 3, 4, 5, 6],
      7: [0, 1, 2, 3, 4, 5, 6],
    };
    return options[Math.min(freq, 7)] || [1, 3, 5];
  }

  const updateSchedule = (habitId: string, field: keyof ScheduledHabit, value: any) => {
    setSchedules((prev) =>
      prev.map((s) => (s.habitId === habitId ? { ...s, [field]: value } : s))
    );
  };

  const toggleDay = (habitId: string, day: number) => {
    const current = schedules.find((s) => s.habitId === habitId);
    if (!current) return;
    const newDays = toggle(current.daysOfWeek, day);
    if (newDays.length === 0) return; // mínimo 1 dia
    updateSchedule(habitId, "daysOfWeek", newDays);
  };

  const conflictCheck = (habitId: string): boolean => {
    const s = schedules.find((x) => x.habitId === habitId);
    if (!s) return false;
    return hasConflict(schedules, habitId, s.daysOfWeek, s.timeSlot);
  };

  const allValid = schedules.every((s) => s.daysOfWeek.length > 0 && s.timeSlot);

  const handleConfirmRoutine = () => {
    setStep("season");
  };

  const handleConfirmSeason = () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + seasonDuration);

    const season: Season = {
      id: `season_${Date.now()}`,
      name: `Temporada 1 — ${seasonDuration} dias`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      durationDays: seasonDuration,
      status: "active",
      habits: schedules,
    };

    onComplete(schedules, season);
  };

  if (step === "season") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Defina sua Temporada</h1>
            <p className="text-gray-300">
              Uma temporada é um ciclo evolutivo com duração definida. Ao final, você celebra
              sua conquista e inicia um novo ciclo ainda mais forte.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SEASON_DURATIONS.map((s) => (
              <button
                key={s.days}
                onClick={() => setSeasonDuration(s.days)}
                className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 text-left transition-all ${
                  seasonDuration === s.days
                    ? "border-amber-400 bg-amber-500/20 text-white"
                    : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                }`}
              >
                <div>
                  <p className="font-bold text-lg">{s.label}</p>
                  <p className="text-sm text-gray-400">{s.description}</p>
                </div>
                {seasonDuration === s.days && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <Card className="bg-white/5 border-white/10 p-4">
            <p className="text-sm text-gray-300 text-center">
              Sua temporada começa <strong className="text-white">hoje</strong> e termina em{" "}
              <strong className="text-amber-300">
                {new Date(Date.now() + seasonDuration * 86400000).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </p>
          </Card>

          <Button
            onClick={handleConfirmSeason}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
          >
            Iniciar Temporada
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Monte sua rotina semanal</h1>
          <p className="text-gray-300">
            Defina os dias e horários de cada hábito. Sua jornada começa com estrutura.
          </p>
        </div>

        {/* Schedules */}
        <div className="space-y-4">
          {schedules.map((s) => {
            const conflict = conflictCheck(s.habitId);
            return (
              <Card
                key={s.habitId}
                className={`p-5 border transition-all ${
                  conflict
                    ? "bg-red-500/10 border-red-500/40"
                    : "bg-white/10 border-white/20"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{s.habitName}</h3>
                    <p className="text-xs text-gray-400">{s.durationMinutes} min por sessão</p>
                  </div>
                  {conflict && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 border text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Conflito de horário
                    </Badge>
                  )}
                </div>

                {/* Days */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Dias da semana</p>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_NAMES.map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleDay(s.habitId, idx)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all ${
                          s.daysOfWeek.includes(idx)
                            ? "border-purple-400 bg-purple-500/30 text-white"
                            : "border-white/20 bg-white/5 text-gray-400 hover:border-white/40"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {s.daysOfWeek
                      .sort()
                      .map((d) => DAY_FULL[d])
                      .join(", ")}
                  </p>
                </div>

                {/* Time */}
                <div>
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horário
                  </p>
                  <input
                    type="time"
                    value={s.timeSlot}
                    onChange={(e) => updateSchedule(s.habitId, "timeSlot", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        <Card className="bg-white/5 border-white/10 p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Resumo da sua semana</h4>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((name, idx) => {
              const dayHabits = schedules.filter((s) => s.daysOfWeek.includes(idx));
              return (
                <div key={idx} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{name}</p>
                  <div
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      dayHabits.length > 0
                        ? "bg-purple-500/30 text-purple-300"
                        : "bg-white/5 text-gray-600"
                    }`}
                  >
                    {dayHabits.length > 0 ? dayHabits.length : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Button
          onClick={handleConfirmRoutine}
          disabled={!allValid}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 disabled:opacity-40"
        >
          Confirmar Rotina e Definir Temporada
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
