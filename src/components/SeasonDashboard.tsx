import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Flame, Trophy, Star, Calendar, CheckCircle2, XCircle,
  SkipForward, TrendingUp, Award, Zap, Target, Clock,
  ChevronRight, AlertTriangle, Shield, BarChart2
} from "lucide-react";
import type { Season, ScheduledHabit } from "./WeeklyRoutineSetup";
import type { BehavioralProfile } from "./OnboardingBehavioral";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HabitStatus = "done" | "skipped" | "relapse" | "pending";

export interface HabitLog {
  id: string;
  habitId: string;
  habitName: string;
  date: string; // ISO date string
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
  points: UserPoints;
  achievements: Achievement[];
  onLogHabit: (habitId: string, status: HabitStatus) => void;
  onRegisterRelapse: (habitId: string) => void;
  onViewForum: () => void;
  onViewStats: () => void;
}

// ─── Constantes de Gamificação (conforme documentos) ─────────────────────────

export const LEVELS = [
  { level: 1, name: "Iniciante", minPoints: 0, maxPoints: 200, color: "from-gray-400 to-gray-600" },
  { level: 2, name: "Persistente", minPoints: 200, maxPoints: 500, color: "from-green-400 to-green-600" },
  { level: 3, name: "Disciplinado", minPoints: 500, maxPoints: 1000, color: "from-blue-400 to-blue-600" },
  { level: 4, name: "Evolutivo", minPoints: 1000, maxPoints: 2000, color: "from-purple-400 to-purple-600" },
  { level: 5, name: "Inspirador", minPoints: 2000, maxPoints: 999999, color: "from-amber-400 to-orange-600" },
];

export const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
  {
    id: "first_week",
    name: "Primeira Semana Limpa",
    description: "Complete uma semana inteira sem recaídas",
    icon: "🌱",
    unlocked: false,
    requiredDays: 7,
  },
  {
    id: "seven_days",
    name: "7 Dias Consecutivos",
    description: "Mantenha 7 dias seguidos de hábitos cumpridos",
    icon: "🔥",
    unlocked: false,
    requiredDays: 7,
  },
  {
    id: "thirty_days",
    name: "30 Dias Consecutivos",
    description: "Mantenha 30 dias seguidos de hábitos cumpridos",
    icon: "💎",
    unlocked: false,
    requiredDays: 30,
  },
  {
    id: "first_season",
    name: "Primeira Temporada Finalizada",
    description: "Complete sua primeira temporada com sucesso",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "three_seasons",
    name: "3 Temporadas Finalizadas",
    description: "Complete três temporadas com sucesso",
    icon: "👑",
    unlocked: false,
  },
  {
    id: "perfect_week",
    name: "Semana Perfeita",
    description: "Complete todos os hábitos em uma semana",
    icon: "⭐",
    unlocked: false,
  },
];

export function calculatePoints(logs: HabitLog[]): UserPoints {
  let total = 0;

  // +10 por hábito concluído
  const done = logs.filter((l) => l.status === "done").length;
  total += done * 10;

  // +50 por semana perfeita (todos os hábitos de uma semana feitos)
  // Simplificado: verificar grupos de 7 dias
  const weekGroups = groupByWeek(logs);
  for (const week of weekGroups) {
    const weekDone = week.filter((l) => l.status === "done").length;
    const weekTotal = week.length;
    if (weekTotal > 0 && weekDone === weekTotal) total += 50;
  }

  // +100 por 30 dias limpos
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
  const doneDates = new Set(
    logs.filter((l) => l.status === "done").map((l) => l.date.split("T")[0])
  );
  const relapseDates = new Set(
    logs.filter((l) => l.status === "relapse").map((l) => l.date.split("T")[0])
  );

  let streak = 0;
  let maxStreak = 0;
  const sorted = Array.from(doneDates).sort();

  for (const date of sorted) {
    if (relapseDates.has(date)) {
      streak = 0;
    } else {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    }
  }
  return maxStreak;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function SeasonDashboard({
  season,
  profile,
  logs,
  points,
  achievements,
  onLogHabit,
  onRegisterRelapse,
  onViewForum,
  onViewStats,
}: SeasonDashboardProps) {
  const [activeTab, setActiveTab] = useState<"home" | "achievements" | "stats">("home");
  const [showRelapseConfirm, setShowRelapseConfirm] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const todayDayOfWeek = new Date().getDay();

  // Hábitos de hoje
  const todayHabits = season.habits.filter((h) => h.daysOfWeek.includes(todayDayOfWeek));

  // Logs de hoje
  const todayLogs = logs.filter((l) => l.date.split("T")[0] === today);

  const getHabitStatusToday = (habitId: string): HabitStatus | null => {
    const log = todayLogs.find((l) => l.habitId === habitId);
    return log ? log.status : null;
  };

  // Progresso da temporada
  const seasonStart = new Date(season.startDate);
  const seasonEnd = new Date(season.endDate);
  const now = new Date();
  const totalDays = Math.ceil((seasonEnd.getTime() - seasonStart.getTime()) / 86400000);
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - seasonStart.getTime()) / 86400000));
  const seasonProgress = Math.min(100, (elapsedDays / totalDays) * 100);

  // Estatísticas
  const totalDone = logs.filter((l) => l.status === "done").length;
  const totalRelapses = logs.filter((l) => l.status === "relapse").length;
  const cleanStreak = getMaxCleanStreak(logs);

  // Nível atual
  const currentLevelData = LEVELS.find((l) => l.level === points.currentLevel) || LEVELS[0];
  const nextLevelData = LEVELS.find((l) => l.level === points.currentLevel + 1);
  const levelProgress = nextLevelData
    ? ((points.totalPoints - currentLevelData.minPoints) /
        (nextLevelData.minPoints - currentLevelData.minPoints)) *
      100
    : 100;

  const tabs = [
    { id: "home", label: "Início", icon: <Target className="w-4 h-4" /> },
    { id: "achievements", label: "Conquistas", icon: <Trophy className="w-4 h-4" /> },
    { id: "stats", label: "Status", icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Olá, {profile.nickname} 👋</p>
            <h1 className="text-xl font-bold text-white">{season.name}</h1>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentLevelData.color} text-white text-sm font-bold`}>
              <Star className="w-3.5 h-3.5" />
              {points.levelName}
            </div>
            <p className="text-xs text-gray-400 mt-1">{points.totalPoints} pts</p>
          </div>
        </div>

        {/* Season Progress */}
        <Card className="bg-white/10 border-white/20 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              Progresso da Temporada
            </span>
            <span className="text-sm font-bold text-white">
              {elapsedDays}/{totalDays} dias
            </span>
          </div>
          <Progress value={seasonProgress} className="h-2 bg-white/10" />
          <p className="text-xs text-gray-400 mt-1">
            Termina em{" "}
            {seasonEnd.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{totalDone}</p>
            <p className="text-xs text-gray-400">Hábitos feitos</p>
          </Card>
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{cleanStreak}</p>
            <p className="text-xs text-gray-400">Dias limpos</p>
          </Card>
          <Card className="bg-white/10 border-white/20 p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{totalRelapses}</p>
            <p className="text-xs text-gray-400">Recaídas</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-white/20 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-8">
        {/* ── Início ─────────────────────────────────────────────────────────── */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Level Progress */}
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentLevelData.color} flex items-center justify-center`}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Nível {points.currentLevel} — {points.levelName}</p>
                    {nextLevelData && (
                      <p className="text-xs text-gray-400">
                        {points.pointsToNextLevel} pts para {nextLevelData.name}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{points.totalPoints} pts</span>
              </div>
              <Progress value={levelProgress} className="h-1.5 bg-white/10" />
            </Card>

            {/* Today's Habits */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Hábitos de Hoje
              </h2>

              {todayHabits.length === 0 ? (
                <Card className="bg-white/5 border-white/10 p-6 text-center">
                  <p className="text-gray-400">Nenhum hábito programado para hoje.</p>
                  <p className="text-gray-500 text-sm mt-1">Aproveite para descansar! 🌿</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {todayHabits.map((habit) => {
                    const status = getHabitStatusToday(habit.habitId);
                    return (
                      <Card
                        key={habit.habitId}
                        className={`p-4 border transition-all ${
                          status === "done"
                            ? "bg-green-500/10 border-green-500/30"
                            : status === "relapse"
                            ? "bg-red-500/10 border-red-500/30"
                            : status === "skipped"
                            ? "bg-gray-500/10 border-gray-500/30"
                            : "bg-white/10 border-white/20"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{habit.habitName}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {habit.timeSlot} • {habit.durationMinutes} min
                            </p>
                          </div>
                          {status ? (
                            <Badge
                              className={`text-xs border ${
                                status === "done"
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : status === "relapse"
                                  ? "bg-red-500/20 text-red-300 border-red-500/30"
                                  : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                              }`}
                            >
                              {status === "done" ? "✓ Feito" : status === "relapse" ? "⚠ Recaída" : "— Pulado"}
                            </Badge>
                          ) : null}
                        </div>

                        {!status && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => onLogHabit(habit.habitId, "done")}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 text-xs h-8"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Concluído
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onLogHabit(habit.habitId, "skipped")}
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white border-0 text-xs h-8"
                            >
                              <SkipForward className="w-3.5 h-3.5 mr-1" />
                              Pular
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setShowRelapseConfirm(habit.habitId)}
                              className="bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/30 text-xs h-8 px-2"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Weekly Overview */}
            <Card className="bg-white/10 border-white/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Visão da Semana
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => {
                  const isToday = i === todayDayOfWeek;
                  const hasHabits = season.habits.some((h) => h.daysOfWeek.includes(i));
                  return (
                    <div key={i} className="text-center">
                      <p className={`text-xs mb-1 ${isToday ? "text-purple-300 font-bold" : "text-gray-500"}`}>{d}</p>
                      <div
                        className={`h-8 rounded-lg flex items-center justify-center text-xs ${
                          isToday
                            ? "bg-purple-500/40 border border-purple-400/50 text-white"
                            : hasHabits
                            ? "bg-white/10 text-gray-400"
                            : "bg-white/5 text-gray-600"
                        }`}
                      >
                        {hasHabits ? "●" : "·"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Forum CTA */}
            <Card
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4 cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
              onClick={onViewForum}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Comunidade</h3>
                  <p className="text-xs text-gray-300">Conecte-se com quem está na mesma jornada</p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-300" />
              </div>
            </Card>
          </div>
        )}

        {/* ── Conquistas ──────────────────────────────────────────────────────── */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-gray-400 text-sm">
                {achievements.filter((a) => a.unlocked).length} de {achievements.length} conquistas desbloqueadas
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {achievements.map((a) => (
                <Card
                  key={a.id}
                  className={`p-4 border transition-all ${
                    a.unlocked
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-white/5 border-white/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        a.unlocked ? "bg-amber-500/20" : "bg-white/10 grayscale"
                      }`}
                    >
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-white text-sm">{a.name}</h3>
                        {a.unlocked && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border text-xs">
                            Desbloqueada
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{a.description}</p>
                      {a.unlockedAt && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          {new Date(a.unlockedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    {a.unlocked ? (
                      <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Shield className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Status ──────────────────────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 border-white/20 p-4">
                <p className="text-3xl font-bold text-green-400">{totalDone}</p>
                <p className="text-sm text-gray-400">Total de hábitos feitos</p>
              </Card>
              <Card className="bg-white/10 border-white/20 p-4">
                <p className="text-3xl font-bold text-red-400">{totalRelapses}</p>
                <p className="text-sm text-gray-400">Total de recaídas</p>
              </Card>
              <Card className="bg-white/10 border-white/20 p-4">
                <p className="text-3xl font-bold text-orange-400">{cleanStreak}</p>
                <p className="text-sm text-gray-400">Maior sequência limpa</p>
              </Card>
              <Card className="bg-white/10 border-white/20 p-4">
                <p className="text-3xl font-bold text-purple-400">{points.totalPoints}</p>
                <p className="text-sm text-gray-400">Pontos totais</p>
              </Card>
            </div>

            {/* Comparativo */}
            {(totalDone + totalRelapses) > 0 && (
              <Card className="bg-white/10 border-white/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-3">Dias limpos vs Recaídas</h3>
                <div className="flex gap-2 items-center mb-2">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{ width: `${(totalDone / (totalDone + totalRelapses)) * 100}%`, minWidth: "4px" }}
                  />
                  <span className="text-xs text-green-400 font-bold">
                    {Math.round((totalDone / (totalDone + totalRelapses)) * 100)}% limpo
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div
                    className="h-4 rounded-full bg-red-500"
                    style={{ width: `${(totalRelapses / (totalDone + totalRelapses)) * 100}%`, minWidth: "4px" }}
                  />
                  <span className="text-xs text-red-400 font-bold">
                    {Math.round((totalRelapses / (totalDone + totalRelapses)) * 100)}% recaídas
                  </span>
                </div>
              </Card>
            )}

            {/* Perfil Comportamental */}
            <Card className="bg-white/10 border-white/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Seu Perfil Comportamental</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{profile.behaviorProfile}</p>
                  <p className="text-xs text-gray-400">Score de risco: {profile.riskScore}/100</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.triggers.slice(0, 3).map((t) => (
                  <Badge key={t} className="bg-white/10 text-gray-300 border-white/20 border text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Visão de futuro */}
            {profile.futureVision && (
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4">
                <h3 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Sua Visão de Futuro
                </h3>
                <p className="text-sm text-gray-300 italic">"{profile.futureVision}"</p>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Relapse Confirm Modal */}
      {showRelapseConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="bg-slate-900 border-red-500/30 p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">Registrar Recaída?</h3>
              <p className="text-gray-400 text-sm mt-2">
                Reconhecer uma recaída é um ato de coragem. Isso não apaga seu progresso — faz parte da jornada.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRelapseConfirm(null)}
                className="flex-1 border-white/30 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onRegisterRelapse(showRelapseConfirm);
                  setShowRelapseConfirm(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
              >
                Registrar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
