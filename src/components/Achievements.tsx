import { Trophy, Lock, CheckCircle2, Award, Star, Zap, Target, Crown, Rocket, Shield } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

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
      title: "Uma Semana Forte",
      description: "Complete 7 dias consecutivos",
      icon: <Shield className="w-6 h-6" />,
      requirement: 7,
      points: 50,
      unlocked: dayCount >= 7,
    },
    {
      id: "two_weeks",
      title: "Duas Semanas",
      description: "14 dias de determinação",
      icon: <Target className="w-6 h-6" />,
      requirement: 14,
      points: 100,
      unlocked: dayCount >= 14,
    },
    {
      id: "month_master",
      title: "Mês de Vitória",
      description: "Complete 30 dias consecutivos",
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
      title: "Guerreiro",
      description: "Complete 90 dias consecutivos",
      icon: <Rocket className="w-6 h-6" />,
      requirement: 90,
      points: 500,
      unlocked: dayCount >= 90,
    },
    {
      id: "half_year",
      title: "Mestre",
      description: "Complete 180 dias consecutivos",
      icon: <Crown className="w-6 h-6" />,
      requirement: 180,
      points: 1000,
      unlocked: dayCount >= 180,
    },
    {
      id: "year_legend",
      title: "Lenda",
      description: "Complete 365 dias consecutivos",
      icon: <Trophy className="w-6 h-6" />,
      requirement: 365,
      points: 2000,
      unlocked: dayCount >= 365,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 bg-card border border-border">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Desbloqueadas</p>
          <p className="text-3xl font-bold text-foreground">{unlockedCount}/{achievements.length}</p>
        </Card>
        <Card className="p-6 bg-card border border-border">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">Pontos Ganhos</p>
          <p className="text-3xl font-bold text-foreground">{totalPoints}</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 bg-card border border-border">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-muted-foreground">Progresso Geral</p>
          <p className="text-sm font-semibold text-foreground">{progressPercent}%</p>
        </div>
        <Progress value={progressPercent} className="h-2 bg-secondary" />
      </Card>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={`p-5 transition-all bg-card border ${
              achievement.unlocked
                ? "border-primary"
                : "border-border opacity-50"
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                  achievement.unlocked
                    ? "bg-accent text-primary"
                    : "bg-secondary text-muted-foreground"
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
                  <h3 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.title}
                  </h3>
                  {achievement.unlocked && (
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">
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
