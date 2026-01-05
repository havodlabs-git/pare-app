import { Trophy, Target, Flame, TrendingUp, Calendar, Award, Zap, Eye, Check } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface ModernDashboardProps {
  dayCount: number;
  level: number;
  points: number;
  longestStreak: number;
  currentStreak: number;
  moduleName: string;
  moduleColor: string;
  onReset: () => void;
  onRelapse: () => void;
}

export function ModernDashboard({
  dayCount,
  level,
  points,
  longestStreak,
  currentStreak,
  moduleName,
  moduleColor,
  onReset,
  onRelapse,
}: ModernDashboardProps) {
  const pointsToNextLevel = (level + 1) * 100;
  const pointsProgress = (points % 100);
  const circularProgress = (pointsProgress / pointsToNextLevel) * 100;

  // Generate streak data for chart
  const streakData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    streak: Math.min(dayCount, i + 1),
    goal: 30,
  }));

  // Health metrics data
  const healthData = [
    { metric: 'Energia', value: Math.min(100, dayCount * 2) },
    { metric: 'Foco', value: Math.min(100, dayCount * 2.5) },
    { metric: 'Confiança', value: Math.min(100, dayCount * 1.8) },
    { metric: 'Disciplina', value: Math.min(100, dayCount * 2.2) },
    { metric: 'Bem-estar', value: Math.min(100, dayCount * 1.5) },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section with Circular Progress */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={`md:col-span-2 p-8 bg-gradient-to-br ${moduleColor} text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                {moduleName}
              </span>
            </div>
            <h2 className="text-7xl md:text-8xl font-bold mb-2">{dayCount}</h2>
            <p className="text-2xl opacity-90">dias limpo</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm opacity-75">Sequência Atual</p>
                <p className="text-2xl font-bold">{currentStreak}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Recorde</p>
                <p className="text-2xl font-bold">{longestStreak}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Nível</p>
                <p className="text-2xl font-bold">{level}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-4 text-center">Nível {level}</h3>
          <div className="w-40 h-40 mb-4">
            <CircularProgressbar
              value={circularProgress}
              text={`${Math.round(circularProgress)}%`}
              styles={buildStyles({
                textSize: '16px',
                pathColor: '#8b5cf6',
                textColor: '#8b5cf6',
                trailColor: '#e5e7eb',
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {pointsProgress} / {pointsToNextLevel} pontos
          </p>
          <p className="text-xs text-gray-400 mt-1">para o próximo nível</p>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Nível</p>
              <p className="text-3xl font-bold text-yellow-700">{level}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Pontos</p>
              <p className="text-3xl font-bold text-blue-700">{points}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Sequência</p>
              <p className="text-3xl font-bold text-orange-700">{currentStreak}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Recorde</p>
              <p className="text-3xl font-bold text-green-700">{longestStreak}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Evolução da Sequência (30 dias)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={streakData}>
              <defs>
                <linearGradient id="colorStreak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#888"
                fontSize={12}
              />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="streak" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorStreak)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Health Metrics Radar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Métricas de Bem-Estar
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={healthData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar 
                name="Progresso" 
                dataKey="value" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6} 
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Button 
          onClick={onRelapse} 
          variant="outline" 
          className="h-16 text-red-600 border-red-200 hover:bg-red-50 font-semibold"
          size="lg"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Registrar Recaída
        </Button>
        <Button 
          onClick={onReset} 
          className="h-16 font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Hoje Estou Limpo
        </Button>
      </div>
    </div>
  );
}
