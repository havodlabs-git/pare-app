import { Trophy, Target, Flame, TrendingUp, Calendar } from "lucide-react";
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
      <Card className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="text-center space-y-4">
          <h2 className="text-sm uppercase tracking-wider opacity-90">Dias Limpo</h2>
          <div className="text-7xl font-bold">{dayCount}</div>
          <p className="text-lg opacity-90">Continue firme na sua jornada!</p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nível</p>
              <p className="text-2xl font-bold">{level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pontos</p>
              <p className="text-2xl font-bold">{points}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sequência Atual</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Recorde</p>
              <p className="text-2xl font-bold">{longestStreak}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Progresso para Nível {level + 1}</h3>
            <span className="text-sm text-gray-500">
              {points % 100}/{pointsToNextLevel} pontos
            </span>
          </div>
          <Progress value={pointsProgress} className="h-3" />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={onRelapse} variant="outline" className="h-14 text-red-600 border-red-200 hover:bg-red-50">
          <Calendar className="w-5 h-5 mr-2" />
          Registrar Recaída
        </Button>
        <Button onClick={onReset} variant="outline" className="h-14">
          Resetar Progresso
        </Button>
      </div>
    </div>
  );
}
