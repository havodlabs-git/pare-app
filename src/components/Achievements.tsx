import { Trophy, Lock, CheckCircle2, Award, Star, Zap, Target, Crown, Rocket, Shield } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  points: number;
  unlocked: boolean;
}

interface AchievementsProps {
  dayCount: number;
  longestStreak: number;
}

export function Achievements({ dayCount, longestStreak }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first_day",
      title: "Primeiro Passo",
      description: "Complete seu primeiro dia",
      icon: <Star className="w-6 h-6" />,
      requirement: 1,
      points: 10,
      unlocked: dayCount >= 1,
    },
    {
      id: "week_warrior",
      title: "Guerreiro de Uma Semana",
      description: "Mantenha-se limpo por 7 dias",
      icon: <Shield className="w-6 h-6" />,
      requirement: 7,
      points: 50,
      unlocked: dayCount >= 7,
    },
    {
      id: "two_weeks",
      title: "Fortaleza de Duas Semanas",
      description: "14 dias de determinação",
      icon: <Target className="w-6 h-6" />,
      requirement: 14,
      points: 100,
      unlocked: dayCount >= 14,
    },
    {
      id: "month_master",
      title: "Mestre do Mês",
      description: "Um mês completo de sucesso",
      icon: <Award className="w-6 h-6" />,
      requirement: 30,
      points: 200,
      unlocked: dayCount >= 30,
    },
    {
      id: "streak_10",
      title: "Sequência de Ouro",
      description: "Sequência de 10 dias",
      icon: <Zap className="w-6 h-6" />,
      requirement: 10,
      points: 75,
      unlocked: longestStreak >= 10,
    },
    {
      id: "ninety_days",
      title: "Transformação 90 Dias",
      description: "90 dias de mudança real",
      icon: <Rocket className="w-6 h-6" />,
      requirement: 90,
      points: 500,
      unlocked: dayCount >= 90,
    },
    {
      id: "half_year",
      title: "Guardião do Semestre",
      description: "6 meses de autodisciplina",
      icon: <Crown className="w-6 h-6" />,
      requirement: 180,
      points: 1000,
      unlocked: dayCount >= 180,
    },
    {
      id: "year_legend",
      title: "Lenda do Ano",
      description: "1 ano completo - você é inspiração!",
      icon: <Trophy className="w-6 h-6" />,
      requirement: 365,
      points: 5000,
      unlocked: dayCount >= 365,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Conquistas</h2>
            <p className="opacity-90">
              {unlockedCount} de {achievements.length} desbloqueadas
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <p className="text-sm opacity-90">Pontos de Conquistas</p>
          </div>
        </div>
      </Card>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-5 transition-all ${
              achievement.unlocked
                ? "border-green-200 bg-green-50"
                : "border-gray-200 opacity-60"
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center ${
                  achievement.unlocked
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  {achievement.unlocked && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                    {achievement.requirement} dias
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    +{achievement.points} pts
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
