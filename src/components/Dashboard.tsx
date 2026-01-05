import { Trophy, Target, Flame, TrendingUp, Calendar, Check } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface DashboardProps {
  dayCount: number;
  level: number;
  points: number;
  longestStreak: number;
  currentStreak: number;
  onReset: () => void;
  onRelapse: () => void;
}

export function Dashboard({
  dayCount,
  level,
  points,
  longestStreak,
  currentStreak,
  onReset,
  onRelapse,
}: DashboardProps) {
  const pointsToNextLevel = (level + 1) * 100;
  const pointsProgress = (points % 100) / pointsToNextLevel * 100;

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <Card className="p-8 bg-card border border-border">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">Dias Limpo</p>
          <div className="text-7xl font-bold text-foreground tracking-tight">{dayCount}</div>
          <p className="text-muted-foreground">Continue firme na sua jornada!</p>
          
          {/* Check-in Button */}
          <Button 
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
            size="lg"
          >
            <Check className="w-5 h-5 mr-2" />
            Fazer Check-in
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent rounded-xl">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nível</p>
              <p className="text-2xl font-bold text-foreground">{level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent rounded-xl">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos</p>
              <p className="text-2xl font-bold text-foreground">{points}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FEF3C7] rounded-xl">
              <Flame className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequência</p>
              <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ECFDF5] rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recorde</p>
              <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="p-6 bg-card border border-border">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Progresso para Nível {level + 1}</h3>
            <span className="text-sm text-muted-foreground">
              {points % 100}/{pointsToNextLevel} pontos
            </span>
          </div>
          <Progress value={pointsProgress} className="h-2 bg-secondary" />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={onRelapse} 
          variant="outline" 
          className="h-14 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Registrar Recaída
        </Button>
        <Button 
          onClick={onReset} 
          className="h-14 bg-[#10B981] hover:bg-[#059669] text-white"
        >
          <Check className="w-5 h-5 mr-2" />
          Hoje Estou Limpo
        </Button>
      </div>
    </div>
  );
}
