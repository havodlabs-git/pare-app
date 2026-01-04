import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface StatsProps {
  dayCount: number;
  startDate: string;
  relapseHistory: { date: string; daysSinceLast: number }[];
  longestStreak: number;
  currentStreak: number;
  totalRelapses: number;
}

export function Stats({
  dayCount,
  startDate,
  relapseHistory,
  longestStreak,
  currentStreak,
  totalRelapses,
}: StatsProps) {
  // Calculate weekly progress
  const weeklyData = Array.from({ length: 12 }, (_, i) => {
    const weekNumber = i + 1;
    return {
      week: `S${weekNumber}`,
      days: Math.min(dayCount - (i * 7), 7),
    };
  }).filter(d => d.days > 0);

  // Calculate success rate
  const totalDaysSinceStart = dayCount + (totalRelapses * 2); // Approximate
  const successRate = totalDaysSinceStart > 0 
    ? ((dayCount / totalDaysSinceStart) * 100).toFixed(1)
    : 100;

  // Recent relapses for display
  const recentRelapses = relapseHistory.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Data de Início</h3>
          </div>
          <p className="text-2xl font-bold">
            {new Date(startDate).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} dias atrás
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Taxa de Sucesso</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{successRate}%</p>
          <p className="text-sm text-gray-500 mt-1">
            Baseado no histórico total
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold">Total de Recaídas</h3>
          </div>
          <p className="text-2xl font-bold">{totalRelapses}</p>
          <p className="text-sm text-gray-500 mt-1">
            Aprendizado e crescimento
          </p>
        </Card>
      </div>

      {/* Streak Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Comparação de Sequências</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Sequência Atual</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-600">{currentStreak}</span>
              <span className="text-lg text-gray-500 mb-1">dias</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">Melhor Sequência</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-600">{longestStreak}</span>
              <span className="text-lg text-gray-500 mb-1">dias</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Progress Chart */}
      {weeklyData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Progresso Semanal</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 7]} />
              <Tooltip />
              <Bar dataKey="days" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Relapse History */}
      {recentRelapses.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Histórico de Recaídas Recentes</h3>
          <div className="space-y-3">
            {recentRelapses.map((relapse, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">
                      {new Date(relapse.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {relapse.daysSinceLast} dias desde a última
                    </p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-gray-300" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h3 className="font-semibold mb-2">Continue Avançando!</h3>
        <p className="opacity-90">
          Cada dia é uma vitória. Mesmo as recaídas fazem parte da jornada de crescimento.
          O importante é nunca desistir!
        </p>
      </Card>
    </div>
  );
}
