import { useState, useMemo } from "react";
import {
  CheckCircle2, XCircle, SkipForward, Target, Calendar,
  TrendingUp, Flame, Award, Clock, ChevronLeft, ChevronRight,
  Zap, BarChart2, Activity, Star, AlertTriangle, X
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend
} from "recharts";
import type { Season } from "./WeeklyRoutineSetup";
import type { BehavioralProfile } from "./OnboardingBehavioral";
import type { HabitLog, HabitStatus } from "./SeasonDashboard";
import type { RelapseLog } from "../App";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressTabProps {
  season: Season;
  profile: BehavioralProfile;
  logs: HabitLog[];
  relapseLogs: RelapseLog[];
  onLogHabit: (habitId: string, status: HabitStatus) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDayKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getSeasonDays(startDate: string, durationDays: number): string[] {
  const days: string[] = [];
  const start = new Date(startDate);
  const today = new Date();
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationDays);
  const limit = today < end ? today : end;
  const cur = new Date(start);
  while (cur <= limit) {
    days.push(getDayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function ProgressTab({ season, profile, logs, relapseLogs, onLogHabit }: ProgressTabProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const today = getDayKey(new Date());
  const todayDayOfWeek = new Date().getDay();

  // Hábitos de hoje (sem validação de horário — pode completar a qualquer hora)
  const todayHabits = season.habits.filter((h) => h.daysOfWeek.includes(todayDayOfWeek));
  const todayLogs = logs.filter((l) => l.date.split("T")[0] === today);

  const getHabitStatusToday = (habitId: string): HabitStatus | null => {
    const log = todayLogs.find((l) => l.habitId === habitId);
    return log ? log.status : null;
  };

  const todayDoneCount = todayLogs.filter((l) => l.status === "done").length;
  const todayTotal = todayHabits.length;
  const todayProgress = todayTotal > 0 ? Math.round((todayDoneCount / todayTotal) * 100) : 0;

  // Recaída hoje?
  const todayRelapse = relapseLogs.find((r) => r.dateKey === today);

  // ── Dias da temporada ──
  const seasonDays = useMemo(() => getSeasonDays(season.startDate, season.durationDays), [season]);

  // ── CORRECÇÃO BUG 1: Dias limpos = dias SEM recaída (não exige hábito feito) ──
  const cleanDays = useMemo(() => {
    return seasonDays.filter((day) => {
      const hasRelapse = relapseLogs.some((r) => r.dateKey === day);
      return !hasRelapse;
    }).length;
  }, [seasonDays, relapseLogs]);

  // ── Sequência limpa actual (dias consecutivos sem recaída, contando de hoje para trás) ──
  const currentCleanStreak = useMemo(() => {
    let streak = 0;
    // Percorrer dias da temporada de trás para frente (do mais recente para o mais antigo)
    const sortedDays = [...seasonDays].sort().reverse();
    for (const day of sortedDays) {
      const hasRelapse = relapseLogs.some((r) => r.dateKey === day);
      if (hasRelapse) break;
      streak++;
    }
    return streak;
  }, [seasonDays, relapseLogs]);

  // ── Maior sequência limpa (sem recaída) ──
  const maxCleanStreak = useMemo(() => {
    let streak = 0;
    let maxStreak = 0;
    const sortedDays = [...seasonDays].sort();
    for (const day of sortedDays) {
      const hasRelapse = relapseLogs.some((r) => r.dateKey === day);
      if (hasRelapse) {
        streak = 0;
      } else {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      }
    }
    return maxStreak;
  }, [seasonDays, relapseLogs]);

  // ── CORRECÇÃO BUG 5: Percentual de conclusão = hábitos feitos / hábitos programados ──
  const overallCompletionRate = useMemo(() => {
    let totalScheduled = 0;
    let totalDone = 0;
    for (const day of seasonDays) {
      const date = new Date(day + "T12:00:00");
      const dow = date.getDay();
      const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
      totalScheduled += dayHabits.length;
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === day && l.status === "done");
      totalDone += dayLogs.length;
    }
    return totalScheduled > 0 ? Math.round((totalDone / totalScheduled) * 100) : 0;
  }, [seasonDays, season.habits, logs]);

  // ── CORRECÇÃO REQ-7: Progresso da semana actual ──
  const weeklyCompletionRate = useMemo(() => {
    // Calcular início da semana actual (domingo)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let weekScheduled = 0;
    let weekDone = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dayStr = getDayKey(d);
      // Só contar dias até hoje
      if (dayStr > today) break;
      const dow = d.getDay();
      const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
      weekScheduled += dayHabits.length;
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === dayStr && l.status === "done");
      weekDone += dayLogs.length;
    }
    return { weekScheduled, weekDone, rate: weekScheduled > 0 ? Math.round((weekDone / weekScheduled) * 100) : 0 };
  }, [season.habits, logs, today]);

  // ── Dados para gráfico de dias limpos vs recaídas (período da temporada) ──
  const cleanVsRelapseData = useMemo(() => {
    const weeks: { week: string; limpos: number; recaidas: number }[] = [];
    for (let i = 0; i < seasonDays.length; i += 7) {
      const chunk = seasonDays.slice(i, i + 7);
      const weekLabel = `S${Math.floor(i / 7) + 1}`;
      let limpos = 0;
      let recaidas = 0;
      for (const day of chunk) {
        const hasRelapse = relapseLogs.some((r) => r.dateKey === day);
        if (hasRelapse) {
          recaidas++;
        } else {
          limpos++;
        }
      }
      weeks.push({ week: weekLabel, limpos, recaidas });
    }
    return weeks;
  }, [seasonDays, relapseLogs]);

  // ── Dados para gráfico de evolução (últimos 14 dias) ──
  const areaData = useMemo(() => {
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(getDayKey(d));
    }
    return days.map((dateStr) => {
      const date = new Date(dateStr + "T12:00:00");
      const dow = date.getDay();
      const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === dateStr);
      const done = dayLogs.filter((l) => l.status === "done").length;
      const scheduled = dayHabits.length;
      const pct = scheduled > 0 ? Math.round((done / scheduled) * 100) : 0;
      const hasRelapse = relapseLogs.some((r) => r.dateKey === dateStr) ? 1 : 0;
      return {
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        conclusao: pct,
        recaida: hasRelapse,
      };
    });
  }, [logs, relapseLogs, season.habits]);

  // ── Dados para gráfico de barras por dia da semana ──
  const weekdayData = useMemo(() => {
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (const day of seasonDays) {
      const date = new Date(day + "T12:00:00");
      const dow = date.getDay();
      const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
      totals[dow] += dayHabits.length;
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === day && l.status === "done");
      counts[dow] += dayLogs.length;
    }
    return labels.map((label, i) => ({
      label,
      taxa: totals[i] > 0 ? Math.round((counts[i] / totals[i]) * 100) : 0,
    }));
  }, [seasonDays, season.habits, logs]);

  // ── CORRECÇÃO BUG 4: Calendário com indicador "!" em recaídas e agenda de hábitos ──
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: {
      date: string | null;
      status: "clean" | "relapse" | "partial" | "complete" | "empty" | "future" | "today";
      hasRelapse: boolean;
      doneCount: number;
      scheduledCount: number;
    }[] = [];

    for (let i = 0; i < firstDay; i++) days.push({ date: null, status: "empty", hasRelapse: false, doneCount: 0, scheduledCount: 0 });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const date = new Date(dateStr + "T12:00:00");
      const dow = date.getDay();
      const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === dateStr);
      const doneCount = dayLogs.filter((l) => l.status === "done").length;
      const scheduledCount = dayHabits.length;
      const hasRelapse = relapseLogs.some((r) => r.dateKey === dateStr);
      const isFuture = dateStr > today;
      const isToday = dateStr === today;

      let status: typeof days[0]["status"] = "empty";
      if (isFuture) {
        status = "future";
      } else if (isToday) {
        status = "today";
      } else if (hasRelapse) {
        status = "relapse";
      } else if (scheduledCount > 0 && doneCount >= scheduledCount) {
        status = "complete";
      } else if (doneCount > 0) {
        status = "partial";
      } else {
        status = "clean"; // dia sem recaída
      }

      days.push({ date: dateStr, status, hasRelapse, doneCount, scheduledCount });
    }

    return days;
  }, [calendarMonth, logs, relapseLogs, today, season.habits]);

  // ── Dados do dia seleccionado no calendário ──
  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    const date = new Date(selectedDay + "T12:00:00");
    const dow = date.getDay();
    const dayHabits = season.habits.filter((h) => h.daysOfWeek.includes(dow));
    const dayLogs = logs.filter((l) => l.date.split("T")[0] === selectedDay);
    const hasRelapse = relapseLogs.some((r) => r.dateKey === selectedDay);
    return {
      date: selectedDay,
      dayHabits,
      dayLogs,
      hasRelapse,
      doneCount: dayLogs.filter((l) => l.status === "done").length,
      scheduledCount: dayHabits.length,
    };
  }, [selectedDay, season.habits, logs, relapseLogs]);

  // ── Estatísticas gerais ──
  const totalDone = logs.filter((l) => l.status === "done").length;
  const totalRelapses = relapseLogs.length;

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const WEEK_DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Hábitos de Hoje ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Hábitos de Hoje</h2>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          {todayTotal > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-500">{todayDoneCount}/{todayTotal} feitos</p>
                <p className="text-xs font-bold text-violet-600">{todayProgress}%</p>
              </div>
              <div className="w-10 h-10 relative">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="url(#prog)" strokeWidth="3"
                    strokeDasharray={`${(todayProgress / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          )}
        </div>

        {todayHabits.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Nenhum hábito para hoje</p>
            <p className="text-gray-400 text-xs mt-0.5">Aproveite para descansar!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayHabits.map((habit) => {
              const status = getHabitStatusToday(habit.id);
              const isDone = status === "done";
              const isSkipped = status === "skipped";
              const isPending = !status;

              return (
                <div
                  key={habit.id}
                  className={`px-4 py-3 flex items-center gap-3 transition-colors ${
                    isDone ? "bg-emerald-50/50" : isSkipped ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  {/* Ícone de estado */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isDone ? "bg-emerald-100" : isSkipped ? "bg-gray-100" : "bg-violet-50"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> :
                     isSkipped ? <SkipForward className="w-4 h-4 text-gray-400" /> :
                     <Target className="w-4 h-4 text-violet-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      isDone ? "text-emerald-700" : isSkipped ? "text-gray-400 line-through" : "text-gray-800"
                    }`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{habit.timeSlot} • {habit.durationMinutes} min</span>
                    </div>
                  </div>

                  {/* Acções — CORRECÇÃO BUG 2: cada hábito é marcado individualmente */}
                  {isPending ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => onLogHabit(habit.id, "done")}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
                      >
                        Feito
                      </button>
                      <button
                        onClick={() => onLogHabit(habit.id, "skipped")}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Pular
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                      isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {isDone ? "Feito" : "Pulado"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Stats Rápidas (COMPACTAS) ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: <Flame className="w-4 h-4" />, label: "Sequência Limpa", value: currentCleanStreak, unit: "dias", color: "from-orange-400 to-red-500" },
          { icon: <CheckCircle2 className="w-4 h-4" />, label: "Dias Limpos", value: cleanDays, unit: `/${seasonDays.length}`, color: "from-emerald-400 to-green-500" },
          { icon: <XCircle className="w-4 h-4" />, label: "Recaídas", value: totalRelapses, unit: "total", color: "from-red-400 to-rose-500" },
          { icon: <Star className="w-4 h-4" />, label: "Conclusão", value: `${overallCompletionRate}`, unit: "%", color: "from-violet-500 to-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-gray-900 leading-tight">{stat.value}<span className="text-xs font-medium text-gray-400 ml-0.5">{stat.unit}</span></p>
              <p className="text-[10px] text-gray-500 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Barra de Progresso Geral da Temporada ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-gray-800">Progresso da Temporada</span>
          </div>
          <span className="text-sm font-bold text-violet-600">{overallCompletionRate}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-700"
            style={{ width: `${overallCompletionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
          <span>{totalDone} hábitos feitos</span>
          <span>{cleanDays} dias limpos de {seasonDays.length}</span>
        </div>
      </div>

      {/* ── Progresso da Semana Actual ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-gray-800">Progresso da Semana</span>
          </div>
          <span className="text-sm font-bold text-emerald-600">{weeklyCompletionRate.rate}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
            style={{ width: `${weeklyCompletionRate.rate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
          <span>{weeklyCompletionRate.weekDone} hábitos feitos esta semana</span>
          <span>{weeklyCompletionRate.weekScheduled} programados</span>
        </div>
      </div>

      {/* ── Gráfico Dias Limpos vs Recaídas (por semana da temporada) ──────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Dias Limpos vs Recaídas</h3>
            <p className="text-[10px] text-gray-400">Por semana da temporada</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-700">{cleanDays} limpos</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-100">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-semibold text-red-700">{totalRelapses} recaídas</span>
          </div>
        </div>

        {cleanVsRelapseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cleanVsRelapseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
                labelStyle={{ color: "#c4b5fd" }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
                formatter={(value) => value === "limpos" ? "Dias Limpos" : "Recaídas"}
              />
              <Bar dataKey="limpos" name="limpos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="recaidas" name="recaidas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Sem dados suficientes ainda.</p>
          </div>
        )}
      </div>

      {/* ── Gráfico de Evolução (14 dias) ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Evolução (14 Dias)</h3>
            <p className="text-[10px] text-gray-400">% de conclusão diária e recaídas</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
              labelStyle={{ color: "#c4b5fd" }}
              formatter={(v: number, name: string) => [name === "conclusao" ? `${v}%` : v, name === "conclusao" ? "Conclusão" : "Recaída"]}
            />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
              formatter={(value) => value === "conclusao" ? "% Conclusão" : "Recaída (0/1)"}
            />
            <Line type="monotone" dataKey="conclusao" stroke="#7c3aed" strokeWidth={2} name="conclusao" dot={{ fill: "#7c3aed", r: 2 }} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="recaida" stroke="#ef4444" strokeWidth={2} name="recaida" dot={{ fill: "#ef4444", r: 2 }} activeDot={{ r: 4 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Taxa por Dia da Semana ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
            <BarChart2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Taxa de Sucesso por Dia</h3>
            <p className="text-[10px] text-gray-400">% de hábitos concluídos por dia da semana</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weekdayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "11px" }}
              formatter={(v: number) => [`${v}%`, "Taxa"]}
            />
            <Bar dataKey="taxa" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {weekdayData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.taxa >= 70 ? "#7c3aed" : entry.taxa >= 40 ? "#a78bfa" : "#e5e7eb"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-3 mt-2 justify-center">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-violet-700" /><span className="text-[10px] text-gray-500">70%+</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-violet-300" /><span className="text-[10px] text-gray-500">40-69%</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-gray-200" /><span className="text-[10px] text-gray-500">&lt;40%</span></div>
        </div>
      </div>

      {/* ── Calendário de Progresso (com "!" em recaídas e agenda) ────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow">
              <Calendar className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Calendário</h3>
              <p className="text-[10px] text-gray-400">{monthNames[calendarMonth.month]} {calendarMonth.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCalendarMonth((m) => {
                const d = new Date(m.year, m.month - 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setCalendarMonth((m) => {
                const d = new Date(m.year, m.month + 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEK_DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day.date) return <div key={i} />;
            const dayNum = new Date(day.date + "T12:00:00").getDate();
            const isSelected = selectedDay === day.date;
            return (
              <button
                key={day.date}
                title={day.date}
                onClick={() => setSelectedDay(isSelected ? null : day.date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all relative ${
                  isSelected
                    ? "ring-2 ring-violet-500 ring-offset-1"
                    : ""
                } ${
                  day.status === "today"
                    ? "ring-2 ring-violet-400 ring-offset-1 bg-violet-50 text-violet-700"
                    : day.status === "relapse"
                    ? "bg-red-100 text-red-600"
                    : day.status === "complete"
                    ? "bg-emerald-100 text-emerald-700"
                    : day.status === "partial"
                    ? "bg-amber-50 text-amber-700"
                    : day.status === "future"
                    ? "bg-gray-50 text-gray-300"
                    : day.status === "clean"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <span className="leading-none">{dayNum}</span>
                {/* CORRECÇÃO BUG 4: Indicador "!" em dias de recaída */}
                {day.hasRelapse && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center leading-none shadow">!</span>
                )}
                {/* Indicador de progresso de hábitos */}
                {day.status !== "future" && day.status !== "empty" && day.scheduledCount > 0 && !day.hasRelapse && (
                  <span className="text-[7px] leading-none mt-0.5 opacity-60">{day.doneCount}/{day.scheduledCount}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda do calendário */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          {[
            { color: "bg-emerald-100", label: "100% feito" },
            { color: "bg-emerald-50", label: "Dia limpo" },
            { color: "bg-amber-50", label: "Parcial" },
            { color: "bg-red-100", label: "Recaída (!)" },
            { color: "bg-gray-50 border border-gray-200", label: "Sem dados" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${l.color}`} />
              <span className="text-[10px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Agenda do dia seleccionado */}
        {selectedDayData && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-700">
                Agenda — {new Date(selectedDayData.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
              </h4>
              <button onClick={() => setSelectedDay(null)} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>

            {selectedDayData.hasRelapse && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-red-600">Recaída registada neste dia</span>
              </div>
            )}

            {selectedDayData.dayHabits.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">Nenhum hábito programado para este dia.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedDayData.dayHabits.map((habit) => {
                  const log = selectedDayData.dayLogs.find((l) => l.habitId === habit.id);
                  const isDone = log?.status === "done";
                  const isSkipped = log?.status === "skipped";
                  return (
                    <div key={habit.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDone ? "bg-emerald-50" : isSkipped ? "bg-gray-50" : "bg-gray-50"}`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-200" : isSkipped ? "bg-gray-200" : "bg-gray-200"}`}>
                        {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> :
                         isSkipped ? <SkipForward className="w-3 h-3 text-gray-400" /> :
                         <Target className="w-3 h-3 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isDone ? "text-emerald-700" : isSkipped ? "text-gray-400 line-through" : "text-gray-600"}`}>{habit.name}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">{habit.timeSlot} • {habit.durationMinutes}min</span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDayData.scheduledCount > 0 && (
              <div className="mt-2 text-center">
                <span className="text-[10px] text-gray-400">
                  {selectedDayData.doneCount}/{selectedDayData.scheduledCount} concluídos
                  ({selectedDayData.scheduledCount > 0 ? Math.round((selectedDayData.doneCount / selectedDayData.scheduledCount) * 100) : 0}%)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desempenho por Hábito ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Desempenho por Hábito</h3>
            <p className="text-[10px] text-gray-400">Feito vs programado na temporada</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {season.habits.map((habit) => {
            // Calcular total programado vs feito para este hábito
            let scheduled = 0;
            let done = 0;
            for (const day of seasonDays) {
              const date = new Date(day + "T12:00:00");
              const dow = date.getDay();
              if (habit.daysOfWeek.includes(dow)) {
                scheduled++;
                const dayLog = logs.find((l) => l.habitId === habit.id && l.date.split("T")[0] === day && l.status === "done");
                if (dayLog) done++;
              }
            }
            const rate = scheduled > 0 ? Math.round((done / scheduled) * 100) : 0;
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[55%]">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Feito em {done} de {scheduled} dias</span>
                    <span className={`text-[10px] font-bold ${rate >= 70 ? "text-emerald-600" : rate >= 40 ? "text-amber-600" : "text-red-500"}`}>{rate}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      rate >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-500" :
                      rate >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-400" :
                      "bg-gradient-to-r from-red-400 to-rose-500"
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
