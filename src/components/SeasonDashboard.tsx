import { useState } from "react";
import {
  Flame, Trophy, Star, Calendar, CheckCircle2, XCircle,
  SkipForward, TrendingUp, Award, Zap, Target, Clock,
  ChevronRight, AlertTriangle, Shield, BarChart2, Sparkles,
  Heart, Brain, Crown
} from "lucide-react";
import { useState } from "react";
import type { Season, ScheduledHabit } from "./WeeklyRoutineSetup";
import type { BehavioralProfile } from "./OnboardingBehavioral";
import { ALL_ACHIEVEMENTS } from "./Achievements";
import { CustomHabitModal } from "./CustomHabitModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HabitStatus = "done" | "skipped" | "relapse" | "pending";

export interface HabitLog {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  status: HabitStatus;
}

export interface UserPoints {
  totalPoints: number;
  currentLevel: number;
  levelName: string;
  pointsToNextLevel: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  unlocked: boolean;
  requiredPoints?: number;
  requiredDays?: number;
}

interface SeasonDashboardProps {
  season: Season;
  profile: BehavioralProfile;
  logs: HabitLog[];
  relapseLogs?: import("../App").RelapseLog[];
  points: UserPoints;
  achievements: Achievement[];
  onLogHabit: (habitId: string, status: HabitStatus) => void;
  onRegisterRelapse: (habitId?: string) => void;
  onViewForum: () => void;
  onViewStats: () => void;
  onAddCustomHabit: (habit: ScheduledHabit & { isCustom: true; sharedWithCommunity: boolean }) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: "Iniciante",    minPoints: 0,    maxPoints: 200,    color: "from-slate-400 to-slate-500" },
  { level: 2, name: "Persistente",  minPoints: 200,  maxPoints: 500,    color: "from-emerald-400 to-green-500" },
  { level: 3, name: "Disciplinado", minPoints: 500,  maxPoints: 1000,   color: "from-blue-400 to-cyan-500" },
  { level: 4, name: "Evolutivo",    minPoints: 1000, maxPoints: 2000,   color: "from-violet-500 to-purple-600" },
  { level: 5, name: "Inspirador",   minPoints: 2000, maxPoints: 999999, color: "from-amber-400 to-orange-500" },
];

// Conquistas definidas em Achievements.tsx (ALL_ACHIEVEMENTS) — fonte única de verdade
export const ACHIEVEMENTS_DEFINITIONS: Achievement[] = ALL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));

export function calculatePoints(logs: HabitLog[]): UserPoints {
  let total = 0;
  const done = logs.filter((l) => l.status === "done").length;
  total += done * 10;
  const weekGroups = groupByWeek(logs);
  for (const week of weekGroups) {
    const weekDone = week.filter((l) => l.status === "done").length;
    if (weekDone > 0 && weekDone === week.length) total += 50;
  }
  const cleanStreak = getMaxCleanStreak(logs);
  if (cleanStreak >= 30) total += 100;
  const level = LEVELS.find((l) => total >= l.minPoints && total < l.maxPoints) || LEVELS[LEVELS.length - 1];
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  return {
    totalPoints: total,
    currentLevel: level.level,
    levelName: level.name,
    pointsToNextLevel: nextLevel ? nextLevel.minPoints - total : 0,
  };
}

function groupByWeek(logs: HabitLog[]): HabitLog[][] {
  const weeks: Record<string, HabitLog[]> = {};
  for (const log of logs) {
    const date = new Date(log.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(log);
  }
  return Object.values(weeks);
}

export function getMaxCleanStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;
  const doneDates = new Set(logs.filter((l) => l.status === "done").map((l) => l.date.split("T")[0]));
  const relapseDates = new Set(logs.filter((l) => l.status === "relapse").map((l) => l.date.split("T")[0]));
  let streak = 0, maxStreak = 0;
  for (const date of Array.from(doneDates).sort()) {
    if (relapseDates.has(date)) { streak = 0; } else { streak++; maxStreak = Math.max(maxStreak, streak); }
  }
  return maxStreak;
}

// Helper para calcular dias da temporada
function getSeasonDays(startDate: string, durationDays: number): string[] {
  const days: string[] = [];
  const start = new Date(startDate);
  const today = new Date();
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationDays);
  const limit = today < end ? today : end;
  const cur = new Date(start);
  while (cur <= limit) {
    days.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function SeasonDashboard({
  season,
  profile,
  logs,
  relapseLogs = [],
  points,
  achievements,
  onLogHabit,
  onRegisterRelapse,
  onViewForum,
  onAddCustomHabit,
}: SeasonDashboardProps) {
  const [activeTab, setActiveTab] = useState<"home" | "achievements" | "stats">("home");
  const [showRelapseConfirm, setShowRelapseConfirm] = useState<string | null>(null);
  const [showCustomHabitModal, setShowCustomHabitModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = new Date().getDay();

  const todayHabits = season.habits.filter((h) => h.daysOfWeek.includes(todayDayOfWeek));
  const todayLogs = logs.filter((l) => l.date.split("T")[0] === today);

  const getHabitStatusToday = (habitId: string): HabitStatus | null => {
    const log = todayLogs.find((l) => l.habitId === habitId);
    return log ? log.status : null;
  };

  const seasonStart = new Date(season.startDate);
  const seasonEnd = new Date(season.endDate);
  const now = new Date();
  const totalDays = Math.ceil((seasonEnd.getTime() - seasonStart.getTime()) / 86400000);
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - seasonStart.getTime()) / 86400000));
  const seasonProgress = Math.min(100, (elapsedDays / totalDays) * 100);
  const daysRemaining = Math.max(0, totalDays - elapsedDays);

  const totalDone = logs.filter((l) => l.status === "done").length;
  const totalRelapses = relapseLogs.length;

  // CORRECÇÃO: Dias limpos = dias SEM recaída (não exige hábito feito)
  const seasonDays = getSeasonDays(season.startDate, season.durationDays);
  const cleanDaysCount = seasonDays.filter((day) => {
    return !relapseLogs.some((r) => r.dateKey === day);
  }).length;

  // Sequência limpa actual (dias consecutivos sem recaída, de hoje para trás)
  const cleanStreak = (() => {
    let streak = 0;
    const sortedDays = [...seasonDays].sort().reverse();
    for (const day of sortedDays) {
      const hasRelapse = relapseLogs.some((r) => r.dateKey === day);
      if (hasRelapse) break;
      streak++;
    }
    return streak;
  })();

  const currentLevelData = LEVELS.find((l) => l.level === points.currentLevel) || LEVELS[0];
  const nextLevelData = LEVELS.find((l) => l.level === points.currentLevel + 1);
  const levelProgress = nextLevelData
    ? ((points.totalPoints - currentLevelData.minPoints) / (nextLevelData.minPoints - currentLevelData.minPoints)) * 100
    : 100;

  // Contar apenas logs "done" cujo habitId corresponde a um hábito programado para hoje (evita duplicados/órfãos)
  const todayHabitIds = new Set(todayHabits.map((h) => h.habitId));
  const todayDoneCount = todayLogs.filter(
    (l) => l.status === "done" && todayHabitIds.has(l.habitId)
  ).reduce((acc, l) => {
    acc.add(l.habitId);
    return acc;
  }, new Set<string>()).size;
  const todayTotal = todayHabits.length;
  const todayProgress = todayTotal > 0 ? Math.min(100, Math.round((todayDoneCount / todayTotal) * 100)) : 0;


  return (
    <div className="space-y-4">

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Olá, {profile.nickname}</p>
          <h1 className="text-xl font-bold text-gray-900">{season.name}</h1>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentLevelData.color} shadow-md`}>
          <Crown className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-sm font-bold">{points.levelName}</span>
        </div>
      </div>

      {/* ── Season Hero Card ────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.25)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fff, transparent)", transform: "translate(30%, -30%)" }} />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-200" />
            </div>
            <span className="text-white/80 text-sm font-medium">Temporada em Progresso</span>
          </div>
          <span className="text-white font-bold text-sm">{elapsedDays}/{totalDays} dias</span>
        </div>

        <div className="h-2 rounded-full mb-2 overflow-hidden bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${seasonProgress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/60 mb-4">
          <span>{Math.round(seasonProgress)}% concluído</span>
          <span>{daysRemaining} dias restantes</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: totalDone, label: "Hábitos feitos", bg: "bg-white/15" },
            { value: cleanDaysCount, label: "Dias limpos", bg: "bg-white/15" },
            { value: totalRelapses, label: "Recaídas", bg: "bg-white/15" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center backdrop-blur-sm`}>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-white/70 text-[11px] mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Level Progress ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center shadow`}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-gray-800 text-sm font-bold">Nível {points.currentLevel} — {points.levelName}</p>
              {nextLevelData && <p className="text-gray-400 text-xs">{points.pointsToNextLevel} pts para {nextLevelData.name}</p>}
            </div>
          </div>
          <span className="text-gray-700 font-bold text-sm">{points.totalPoints} pts</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${currentLevelData.color} transition-all duration-700`}
            style={{ width: `${Math.min(100, levelProgress)}%` }}
          />
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-2xl p-1 bg-gray-100 border border-gray-200">
        {[
          { id: "home",         label: "Início",     icon: <Target className="w-4 h-4" /> },
          { id: "achievements", label: "Conquistas", icon: <Trophy className="w-4 h-4" /> },
          { id: "stats",        label: "Status",     icon: <BarChart2 className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === t.id
                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Início ─────────────────────────────────────────────────────── */}
      {activeTab === "home" && (
        <div className="space-y-4">

          {/* Quick today summary */}
          {todayTotal > 0 && (
            <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-gray-800 text-sm font-semibold">Hoje — {todayDoneCount}/{todayTotal} hábitos concluídos</span>
                </div>
                <span className="text-violet-600 text-sm font-bold">{todayProgress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">Aceda à aba <strong>Progresso</strong> para registar os seus hábitos de hoje.</p>
            </div>
          )}

          {/* Relapse Button */}
          {(() => {
            const todayRelapse = relapseLogs.find((r) => r.dateKey === today);
            return (
              <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-gray-800 text-sm font-semibold">Registar Recaída</span>
                  </div>
                  {todayRelapse && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">1 recaída hoje</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mb-3">Se hoje houve uma recaída, registe aqui. Apenas 1 por dia.</p>
                {todayRelapse ? (
                  <div className="flex items-center gap-2 rounded-xl p-3 bg-red-50 border border-red-100">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-600 text-sm font-medium">Recaída já registada hoje — amanhã é um novo começo.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onRegisterRelapse()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 active:scale-95 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Tive uma recaída hoje
                  </button>
                )}
              </div>
            );
          })()}


          {/* Visão de Futuro */}
          {profile.futureVision && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-bold text-amber-800 text-sm">Sua Visão de Futuro</h3>
              </div>
              <p className="text-amber-700 text-sm italic leading-relaxed">"{profile.futureVision}"</p>
            </div>
          )}

          {/* Adicionar Hábito Customizado */}
          <button
            onClick={() => setShowCustomHabitModal(true)}
            className="w-full rounded-2xl p-4 flex items-center justify-between group transition-all hover:scale-[1.01] active:scale-[0.99] bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 shadow-sm hover:border-violet-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-violet-800 font-semibold text-sm">Adicionar Hábito Personalizado</p>
                <p className="text-violet-500 text-xs">Crie um hábito à medida para esta temporada</p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold leading-none">+</span>
            </div>
          </button>

          {/* Community CTA */}
          <button
            onClick={onViewForum}
            className="w-full rounded-2xl p-4 flex items-center justify-between group transition-all hover:scale-[1.01] active:scale-[0.99] bg-white border border-violet-100 shadow-sm hover:border-violet-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <p className="text-gray-800 font-semibold text-sm">Comunidade</p>
                <p className="text-gray-400 text-xs">Conecte-se com quem está na mesma jornada</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* ── Modal de Hábito Customizado ─────────────────────────────────────── */}
      {showCustomHabitModal && (
        <CustomHabitModal
          onClose={() => setShowCustomHabitModal(false)}
          onSave={(habit) => {
            onAddCustomHabit(habit);
            setShowCustomHabitModal(false);
          }}
        />
      )}

      {/* ── Tab: Conquistas ─────────────────────────────────────────────────── */}
      {activeTab === "achievements" && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 text-center bg-white border border-gray-100 shadow-sm mb-2">
            <p className="text-4xl font-black text-gray-800 mb-1">
              {achievements.filter((a) => a.unlocked).length}
              <span className="text-gray-300 text-2xl">/{achievements.length}</span>
            </p>
            <p className="text-gray-400 text-sm">conquistas desbloqueadas</p>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden mx-8 bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                style={{ width: `${(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}%` }}
              />
            </div>
          </div>

          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl p-4 flex items-center gap-4 border transition-all ${
                a.unlocked
                  ? "bg-amber-50 border-amber-200"
                  : "bg-gray-50 border-gray-100 opacity-60"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${a.unlocked ? "bg-amber-100" : "bg-gray-100 grayscale"}`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-gray-800 font-semibold text-sm">{a.name}</h3>
                  {a.unlocked && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-700">
                      Desbloqueada
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{a.description}</p>
                {a.unlockedAt && (
                  <p className="text-amber-500 text-xs mt-0.5">
                    {new Date(a.unlockedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
              {a.unlocked
                ? <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                : <Shield className="w-5 h-5 text-gray-300 flex-shrink-0" />
              }
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Status ─────────────────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: totalDone,     label: "Hábitos feitos",   color: "from-emerald-400 to-green-500",  icon: <CheckCircle2 className="w-4 h-4 text-white" />, bg: "bg-emerald-50 border-emerald-100" },
              { value: totalRelapses, label: "Recaídas",         color: "from-red-400 to-rose-500",       icon: <XCircle className="w-4 h-4 text-white" />,      bg: "bg-red-50 border-red-100" },
              { value: cleanStreak,   label: "Sequência limpa",  color: "from-orange-400 to-amber-500",   icon: <Flame className="w-4 h-4 text-white" />,        bg: "bg-orange-50 border-orange-100" },
              { value: points.totalPoints, label: "Pontos totais", color: "from-violet-500 to-purple-600", icon: <Zap className="w-4 h-4 text-white" />,         bg: "bg-violet-50 border-violet-100" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-3 border ${s.bg} flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow flex-shrink-0`}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-black text-gray-800 leading-tight">{s.value}</p>
                  <p className="text-gray-400 text-[10px] truncate">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Taxa de sucesso corrigida */}
          {seasonDays.length > 0 && (
            <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
              <h3 className="text-gray-800 text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                Taxa de Sucesso
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-emerald-600 font-semibold">Dias limpos</span>
                    <span className="text-gray-500">{Math.round((cleanDaysCount / seasonDays.length) * 100)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" style={{ width: `${(cleanDaysCount / seasonDays.length) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-red-500 font-semibold">Recaídas</span>
                    <span className="text-gray-500">{seasonDays.length > 0 ? Math.round((totalRelapses / seasonDays.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500" style={{ width: `${seasonDays.length > 0 ? (totalRelapses / seasonDays.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
            <h3 className="text-gray-800 text-sm font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" />
              Perfil Comportamental
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-gray-800 font-semibold text-sm">{profile.behaviorProfile}</p>
                <p className="text-gray-400 text-xs">Score de risco: {profile.riskScore}/100</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.triggers.slice(0, 4).map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {profile.futureVision && (
            <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200">
              <h3 className="text-amber-700 text-sm font-semibold mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Sua Visão de Futuro
              </h3>
              <p className="text-gray-600 text-sm italic leading-relaxed">"{profile.futureVision}"</p>
            </div>
          )}
        </div>
      )}

      {/* ── Relapse Confirm Modal ────────────────────────────────────────────── */}
      {showRelapseConfirm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40 backdrop-blur-sm">
          <div className="rounded-3xl p-6 max-w-sm w-full space-y-5 bg-white shadow-2xl border border-red-100">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Registrar Recaída?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Reconhecer uma recaída é um ato de coragem. Isso não apaga seu progresso — faz parte da jornada.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRelapseConfirm(null)}
                className="flex-1 h-12 rounded-2xl font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onRegisterRelapse(showRelapseConfirm); setShowRelapseConfirm(null); }}
                className="flex-1 h-12 rounded-2xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", boxShadow: "0 4px 16px rgba(220,38,38,0.25)" }}
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
