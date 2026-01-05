import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Flame, BarChart3 } from "lucide-react";

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
  const totalDaysSinceStart = dayCount + (totalRelapses * 2);
  const successRate = totalDaysSinceStart > 0 
    ? ((dayCount / totalDaysSinceStart) * 100).toFixed(0)
    : 100;

  // Recent relapses for display
  const recentRelapses = relapseHistory.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center mb-3">
            <div className="p-2.5 bg-[#ECFDF5] rounded-xl">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{dayCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Dias de sucesso</p>
        </Card>

        <Card className="p-6 bg-card border border-border">
          <div className="flex items-center mb-3">
            <div className="p-2.5 bg-accent rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{successRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">Taxa de sucesso</p>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyData.length > 0 && (
        <Card className="p-6 bg-card border border-border">
          <h3 className="font-semibold text-foreground mb-6">Progresso Semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 7]} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)', 
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="days" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Detailed Stats */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Detalhes</h3>
        
        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FEF3C7] rounded-xl">
              <Flame className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Maior sequência</p>
              <p className="text-lg font-semibold text-foreground">{longestStreak} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ECFDF5] rounded-xl">
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Sequência atual</p>
              <p className="text-lg font-semibold text-foreground">{currentStreak} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Total de dias limpos</p>
              <p className="text-lg font-semibold text-foreground">{dayCount} dias</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F3E8FF] rounded-xl">
              <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Média semanal</p>
              <p className="text-lg font-semibold text-foreground">
                {weeklyData.length > 0 
                  ? (weeklyData.reduce((sum, w) => sum + w.days, 0) / weeklyData.length).toFixed(1) 
                  : 0} dias
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Relapse History */}
      {recentRelapses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Histórico Recente</h3>
          {recentRelapses.map((relapse, index) => (
            <Card
              key={index}
              className="p-4 bg-card border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(relapse.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {relapse.daysSinceLast} dias desde a última
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
