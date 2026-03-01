import { Trophy, Lock, CheckCircle2, Award, Star, Zap, Target, Crown, Rocket, Shield, Flame, Diamond } from "lucide-react";
import type { Achievement } from "./SeasonDashboard";

// ─── Definição canónica de conquistas (única fonte de verdade) ────────────────
// Esta lista é exportada e usada tanto aqui como no SeasonDashboard e no App.tsx

export const ALL_ACHIEVEMENTS: Omit<Achievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "first_day",
    name: "Primeiro Passo",
    description: "Complete o seu primeiro dia de hábito",
    icon: "⭐",
    requiredDays: 1,
  },
  {
    id: "three_days",
    name: "Três Dias Seguidos",
    description: "Mantenha 3 dias consecutivos de hábitos cumpridos",
    icon: "🌱",
    requiredDays: 3,
  },
  {
    id: "first_week",
    name: "Primeira Semana Limpa",
    description: "Complete uma semana inteira sem recaídas",
    icon: "🔥",
    requiredDays: 7,
  },
  {
    id: "perfect_week",
    name: "Semana Perfeita",
    description: "Complete todos os hábitos programados em uma semana",
    icon: "💫",
  },
  {
    id: "two_weeks",
    name: "Duas Semanas",
    description: "14 dias de determinação e consistência",
    icon: "🎯",
    requiredDays: 14,
  },
  {
    id: "thirty_days",
    name: "30 Dias Consecutivos",
    description: "Mantenha 30 dias seguidos de hábitos cumpridos",
    icon: "💎",
    requiredDays: 30,
  },
  {
    id: "first_season",
    name: "Primeira Temporada Finalizada",
    description: "Complete a sua primeira temporada com sucesso",
    icon: "🏆",
  },
  {
    id: "ninety_days",
    name: "Guerreiro",
    description: "Complete 90 dias consecutivos sem recaídas",
    icon: "🚀",
    requiredDays: 90,
  },
  {
    id: "three_seasons",
    name: "3 Temporadas Finalizadas",
    description: "Complete três temporadas com sucesso",
    icon: "👑",
  },
  {
    id: "half_year",
    name: "Mestre",
    description: "Complete 180 dias consecutivos",
    icon: "🌟",
    requiredDays: 180,
  },
  {
    id: "year_legend",
    name: "Lenda",
    description: "Complete 365 dias consecutivos",
    icon: "🏅",
    requiredDays: 365,
  },
];

// Mapa de ícones Lucide por id (para renderização visual)
const ACHIEVEMENT_ICONS: Record<string, React.ReactNode> = {
  first_day:      <Star className="w-6 h-6" />,
  three_days:     <Flame className="w-6 h-6" />,
  first_week:     <Shield className="w-6 h-6" />,
  perfect_week:   <Zap className="w-6 h-6" />,
  two_weeks:      <Target className="w-6 h-6" />,
  thirty_days:    <Diamond className="w-6 h-6" />,
  first_season:   <Award className="w-6 h-6" />,
  ninety_days:    <Rocket className="w-6 h-6" />,
  three_seasons:  <Crown className="w-6 h-6" />,
  half_year:      <Star className="w-6 h-6" />,
  year_legend:    <Trophy className="w-6 h-6" />,
};

// Pontos por conquista
const ACHIEVEMENT_POINTS: Record<string, number> = {
  first_day:      10,
  three_days:     25,
  first_week:     50,
  perfect_week:   75,
  two_weeks:      100,
  thirty_days:    200,
  first_season:   150,
  ninety_days:    500,
  three_seasons:  400,
  half_year:      1000,
  year_legend:    2000,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AchievementsProps {
  // Modo comportamental (SeasonDashboard) — conquistas já calculadas
  achievements?: Achievement[];
  // Modo legado (ModernDashboard) — baseado em dias
  dayCount?: number;
  longestStreak?: number;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Achievements({ achievements, dayCount = 0, longestStreak = 0 }: AchievementsProps) {
  // Se recebeu conquistas calculadas (modo comportamental), usa-as directamente
  // Caso contrário, calcula a partir de dayCount/longestStreak (modo legado)
  const resolvedAchievements: Achievement[] = achievements
    ? achievements
    : ALL_ACHIEVEMENTS.map((a) => {
        let unlocked = false;
        if (a.id === "first_day"     && dayCount >= 1)         unlocked = true;
        if (a.id === "three_days"    && dayCount >= 3)         unlocked = true;
        if (a.id === "first_week"    && dayCount >= 7)         unlocked = true;
        if (a.id === "two_weeks"     && dayCount >= 14)        unlocked = true;
        if (a.id === "thirty_days"   && dayCount >= 30)        unlocked = true;
        if (a.id === "ninety_days"   && dayCount >= 90)        unlocked = true;
        if (a.id === "half_year"     && dayCount >= 180)       unlocked = true;
        if (a.id === "year_legend"   && dayCount >= 365)       unlocked = true;
        if (a.id === "perfect_week"  && longestStreak >= 7)    unlocked = true;
        return { ...a, unlocked };
      });

  const unlockedCount = resolvedAchievements.filter((a) => a.unlocked).length;
  const totalPoints = resolvedAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (ACHIEVEMENT_POINTS[a.id] || 0), 0);
  const progressPercent = Math.round((unlockedCount / resolvedAchievements.length) * 100);

  return (
    <div className="space-y-5">

      {/* ── Header Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 text-center">
          <p className="text-2xl font-black text-amber-700">{unlockedCount}</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Desbloqueadas</p>
        </div>
        <div className="rounded-2xl p-4 bg-violet-50 border border-violet-200 text-center">
          <p className="text-2xl font-black text-violet-700">{resolvedAchievements.length}</p>
          <p className="text-xs text-violet-600 font-medium mt-0.5">Total</p>
        </div>
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-2xl font-black text-emerald-700">{totalPoints}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Pontos Ganhos</p>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Progresso Geral</p>
          <p className="text-sm font-bold text-gray-800">{progressPercent}%</p>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{unlockedCount} de {resolvedAchievements.length} conquistas desbloqueadas</p>
      </div>

      {/* ── Achievements Grid ─────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-3">
        {resolvedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-2xl p-4 border transition-all duration-200 ${
              achievement.unlocked
                ? "bg-amber-50 border-amber-200 shadow-sm"
                : "bg-gray-50 border-gray-100 opacity-60"
            }`}
          >
            <div className="flex gap-4 items-start">
              {/* Ícone */}
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  achievement.unlocked
                    ? "bg-amber-100"
                    : "bg-gray-100 grayscale"
                }`}
              >
                {achievement.icon}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <h3 className={`font-semibold text-sm leading-tight ${
                    achievement.unlocked ? "text-gray-800" : "text-gray-400"
                  }`}>
                    {achievement.name}
                  </h3>
                  {achievement.unlocked
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <Lock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  }
                </div>

                <p className={`text-xs leading-relaxed ${
                  achievement.unlocked ? "text-gray-500" : "text-gray-400"
                }`}>
                  {achievement.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-bold ${
                    achievement.unlocked ? "text-amber-600" : "text-gray-400"
                  }`}>
                    +{ACHIEVEMENT_POINTS[achievement.id] || 0} pts
                  </span>
                  {achievement.unlockedAt && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(achievement.unlockedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {!achievement.unlocked && achievement.requiredDays && (
                    <span className="text-[10px] text-gray-400">
                      Requer {achievement.requiredDays} dias
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
