import { useState, useMemo } from "react";
import {
  CheckCircle2, XCircle, SkipForward, Target, Calendar,
  TrendingUp, Flame, Award, Clock, ChevronLeft, ChevronRight,
  Zap, BarChart2, Activity, Star, AlertTriangle
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import type { Season } from "./WeeklyRoutineSetup";
import type { BehavioralProfile } from "./OnboardingBehavioral";
import type { HabitLog, HabitStatus } from "./SeasonDashboard";
import { getMaxCleanStreak } from "./SeasonDashboard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressTabProps {
  season: Season;
  profile: BehavioralProfile;
  logs: HabitLog[];
  onLogHabit: (habitId: string, status: HabitStatus) => void;
  onRegisterRelapse: (habitId: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getDayKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }
  return days;
}

function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }
  return days;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function ProgressTab({ season, profile, logs, onLogHabit, onRegisterRelapse }: ProgressTabProps) {
  const [showRelapseConfirm, setShowRelapseConfirm] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = getDayKey(new Date());
  const todayDayOfWeek = new Date().getDay();

  // Hábitos de hoje
  const todayHabits = season.habits.filter((h) => h.daysOfWeek.includes(todayDayOfWeek));
  const todayLogs = logs.filter((l) => l.date.split("T")[0] === today);

  const getHabitStatusToday = (habitId: string): HabitStatus | null => {
    const log = todayLogs.find((l) => l.habitId === habitId);
    return log ? log.status : null;
  };

  const todayDoneCount = todayLogs.filter((l) => l.status === "done").length;
  const todayTotal = todayHabits.length;
  const todayProgress = todayTotal > 0 ? Math.round((todayDoneCount / todayTotal) * 100) : 0;

  // ── Dados para gráfico de área (últimos 14 dias) ──────────────────────────
  const areaData = useMemo(() => {
    return getLast14Days().map((dateStr) => {
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === dateStr);
      const done = dayLogs.filter((l) => l.status === "done").length;
      const relapses = dayLogs.filter((l) => l.status === "relapse").length;
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        feitos: done,
        recaidas: relapses,
      };
    });
  }, [logs]);

  // ── Dados para gráfico de barras por dia da semana ────────────────────────
  const weekdayData = useMemo(() => {
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (const log of logs) {
      const d = new Date(log.date);
      const dow = d.getDay();
      totals[dow]++;
      if (log.status === "done") counts[dow]++;
    }
    return labels.map((label, i) => ({
      label,
      taxa: totals[i] > 0 ? Math.round((counts[i] / totals[i]) * 100) : 0,
    }));
  }, [logs]);

  // ── Calendário ────────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { date: string | null; status: "done" | "relapse" | "mixed" | "empty" | "future" | "today" }[] = [];

    // Preencher dias vazios antes
    for (let i = 0; i < firstDay; i++) days.push({ date: null, status: "empty" });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayLogs = logs.filter((l) => l.date.split("T")[0] === dateStr);
      const hasRelapse = dayLogs.some((l) => l.status === "relapse");
      const hasDone = dayLogs.some((l) => l.status === "done");
      const isFuture = dateStr > today;
      const isToday = dateStr === today;

      let status: typeof days[0]["status"] = "empty";
      if (isFuture) status = "future";
      else if (isToday) status = "today";
      else if (hasRelapse && hasDone) status = "mixed";
      else if (hasRelapse) status = "relapse";
      else if (hasDone) status = "done";

      days.push({ date: dateStr, status });
    }

    return days;
  }, [calendarMonth, logs, today]);

  // ── Estatísticas gerais ───────────────────────────────────────────────────
  const totalDone = logs.filter((l) => l.status === "done").length;
  const totalRelapses = logs.filter((l) => l.status === "relapse").length;
  const totalLogs = logs.length;
  const successRate = totalLogs > 0 ? Math.round((totalDone / totalLogs) * 100) : 0;
  const cleanStreak = getMaxCleanStreak(logs);

  const last30 = getLast30Days();
  const last30Done = logs.filter((l) => last30.includes(l.date.split("T")[0]) && l.status === "done").length;

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const WEEK_DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Hábitos de Hoje ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
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
          <div className="px-5 py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Nenhum hábito para hoje</p>
            <p className="text-gray-400 text-xs mt-1">Aproveite para descansar!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayHabits.map((habit) => {
              const status = getHabitStatusToday(habit.id);
              const isDone = status === "done";
              const isRelapse = status === "relapse";
              const isSkipped = status === "skipped";
              const isPending = !status;

              return (
                <div
                  key={habit.id}
                  className={`px-5 py-4 flex items-center gap-4 transition-colors ${
                    isDone ? "bg-emerald-50/50" : isRelapse ? "bg-red-50/50" : isSkipped ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  {/* Ícone de estado */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isDone ? "bg-emerald-100" : isRelapse ? "bg-red-100" : isSkipped ? "bg-gray-100" : "bg-violet-50"
                  }`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
                     isRelapse ? <XCircle className="w-5 h-5 text-red-500" /> :
                     isSkipped ? <SkipForward className="w-5 h-5 text-gray-400" /> :
                     <Target className="w-5 h-5 text-violet-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      isDone ? "text-emerald-700" : isRelapse ? "text-red-600" : isSkipped ? "text-gray-400 line-through" : "text-gray-800"
                    }`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{habit.time} • {habit.duration} min</span>
                    </div>
                  </div>

                  {/* Acções */}
                  {isPending ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onLogHabit(habit.id, "done")}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
                      >
                        ✓ Feito
                      </button>
                      <button
                        onClick={() => onLogHabit(habit.id, "skipped")}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Pular
                      </button>
                      <button
                        onClick={() => setShowRelapseConfirm(habit.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Registrar recaída"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                      isDone ? "bg-emerald-100 text-emerald-700" :
                      isRelapse ? "bg-red-100 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {isDone ? "✓ Feito" : isRelapse ? "✗ Recaída" : "→ Pulado"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Stats Rápidas ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Flame className="w-5 h-5" />, label: "Sequência Limpa", value: cleanStreak, unit: "dias", color: "from-orange-400 to-red-500", bg: "bg-orange-50" },
          { icon: <CheckCircle2 className="w-5 h-5" />, label: "Hábitos Feitos", value: totalDone, unit: "total", color: "from-emerald-400 to-green-500", bg: "bg-emerald-50" },
          { icon: <TrendingUp className="w-5 h-5" />, label: "Taxa de Sucesso", value: successRate, unit: "%", color: "from-blue-400 to-cyan-500", bg: "bg-blue-50" },
          { icon: <Star className="w-5 h-5" />, label: "Últimos 30 dias", value: last30Done, unit: "feitos", color: "from-violet-500 to-purple-600", bg: "bg-violet-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}<span className="text-sm font-medium text-gray-400 ml-1">{stat.unit}</span></p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Gráfico de Evolução (14 dias) ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Evolução dos Últimos 14 Dias</h3>
            <p className="text-xs text-gray-400">Hábitos feitos vs recaídas por dia</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradFeitos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRecaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
              labelStyle={{ color: "#c4b5fd" }}
            />
            <Area type="monotone" dataKey="feitos" stroke="#7c3aed" strokeWidth={2} fill="url(#gradFeitos)" name="Feitos" dot={{ fill: "#7c3aed", r: 3 }} />
            <Area type="monotone" dataKey="recaidas" stroke="#ef4444" strokeWidth={2} fill="url(#gradRecaidas)" name="Recaídas" dot={{ fill: "#ef4444", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Taxa por Dia da Semana ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Taxa de Sucesso por Dia da Semana</h3>
            <p className="text-xs text-gray-400">Percentagem de hábitos feitos por dia</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekdayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#1e1b4b", border: "none", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
              formatter={(v: number) => [`${v}%`, "Taxa"]}
            />
            <Bar dataKey="taxa" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {weekdayData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.taxa >= 70 ? "#7c3aed" : entry.taxa >= 40 ? "#a78bfa" : "#e5e7eb"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-violet-700" /><span className="text-xs text-gray-500">≥70%</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-violet-300" /><span className="text-xs text-gray-500">40–69%</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200" /><span className="text-xs text-gray-500">&lt;40%</span></div>
        </div>
      </div>

      {/* ── Calendário de Hábitos ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Calendário de Progresso</h3>
              <p className="text-xs text-gray-400">{monthNames[calendarMonth.month]} {calendarMonth.year}</p>
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

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS_SHORT.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day.date) return <div key={i} />;
            const dayNum = new Date(day.date).getDate();
            return (
              <div
                key={day.date}
                title={day.date}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                  day.status === "today"
                    ? "ring-2 ring-violet-500 ring-offset-1 bg-violet-50 text-violet-700"
                    : day.status === "done"
                    ? "bg-emerald-100 text-emerald-700"
                    : day.status === "relapse"
                    ? "bg-red-100 text-red-600"
                    : day.status === "mixed"
                    ? "bg-amber-100 text-amber-700"
                    : day.status === "future"
                    ? "bg-gray-50 text-gray-300"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-50">
          {[
            { color: "bg-emerald-100", label: "Feito" },
            { color: "bg-red-100", label: "Recaída" },
            { color: "bg-amber-100", label: "Misto" },
            { color: "bg-gray-50 border border-gray-200", label: "Sem registo" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded ${l.color}`} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hábitos com Melhor e Pior Desempenho ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Desempenho por Hábito</h3>
            <p className="text-xs text-gray-400">Taxa de conclusão de cada hábito</p>
          </div>
        </div>
        <div className="space-y-3">
          {season.habits.map((habit) => {
            const habitLogs = logs.filter((l) => l.habitId === habit.id);
            const done = habitLogs.filter((l) => l.status === "done").length;
            const total = habitLogs.length;
            const rate = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={habit.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{done}/{total}</span>
                    <span className={`text-xs font-bold ${rate >= 70 ? "text-emerald-600" : rate >= 40 ? "text-amber-600" : "text-red-500"}`}>{rate}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
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

      {/* ── Modal de Confirmação de Recaída ──────────────────────────────────── */}
      {showRelapseConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Registrar Recaída?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Isso ficará registado no seu histórico. Recaídas fazem parte do processo — o importante é continuar!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRelapseConfirm(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onRegisterRelapse(showRelapseConfirm); setShowRelapseConfirm(null); }}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
