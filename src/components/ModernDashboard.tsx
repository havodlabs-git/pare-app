import { Trophy, Flame, TrendingUp, Zap, Check, AlertTriangle, Star, Shield, Crown, ChevronRight } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface ModernDashboardProps {
  dayCount: number;
  level: number;
  points: number;
  longestStreak: number;
  currentStreak: number;
  moduleName: string;
  moduleColor: string;
  onCheckIn?: () => void;
  onRelapse: () => void;
  onReset?: () => void;
}

const LEVEL_NAMES = ["", "Iniciante", "Persistente", "Disciplinado", "Evolutivo", "Inspirador"];
const LEVEL_COLORS = [
  "",
  "from-slate-400 to-slate-600",
  "from-emerald-400 to-green-600",
  "from-blue-400 to-cyan-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
];

const MILESTONES = [1, 3, 7, 14, 21, 30, 60, 90, 180, 365];

function getNextMilestone(days: number) {
  return MILESTONES.find((m) => m > days) || 365;
}

function getMilestoneProgress(days: number) {
  const prev = [...MILESTONES].reverse().find((m) => m <= days) || 0;
  const next = getNextMilestone(days);
  return { prev, next, progress: next === prev ? 100 : Math.round(((days - prev) / (next - prev)) * 100) };
}

export function ModernDashboard({
  dayCount,
  level,
  points,
  longestStreak,
  currentStreak,
  moduleName,
  moduleColor,
  onCheckIn,
  onRelapse,
}: ModernDashboardProps) {
  const pointsInLevel = points % 100;
  const levelProgress = pointsInLevel;
  const levelName = LEVEL_NAMES[Math.min(level, 5)] || "Iniciante";
  const levelColor = LEVEL_COLORS[Math.min(level, 5)] || LEVEL_COLORS[1];
  const { prev, next, progress: milestoneProgress } = getMilestoneProgress(dayCount);

  // Chart data — últimos 14 dias simulados
  const chartData = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    dias: Math.min(dayCount, i + 1),
  }));

  // Radar data
  const radarData = [
    { metric: "Energia", value: Math.min(100, dayCount * 2) },
    { metric: "Foco", value: Math.min(100, dayCount * 2.5) },
    { metric: "Confiança", value: Math.min(100, dayCount * 1.8) },
    { metric: "Disciplina", value: Math.min(100, dayCount * 2.2) },
    { metric: "Bem-estar", value: Math.min(100, dayCount * 1.5) },
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero Card ──────────────────────────────────────────────────────────── */}
      <div
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${moduleColor} shadow-2xl`}
        style={{ minHeight: 220 }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 p-7 flex flex-col md:flex-row md:items-center gap-6">
          {/* Days counter */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-widest">{moduleName}</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-8xl md:text-9xl font-black text-white leading-none tracking-tighter" style={{ textShadow: "0 4px 32px rgba(0,0,0,0.25)" }}>
                {dayCount}
              </span>
              <span className="text-white/80 text-2xl font-semibold mb-3">dias</span>
            </div>
            <p className="text-white/60 text-sm">sem {moduleName.toLowerCase()}</p>
          </div>

          {/* Circular level progress */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28">
              <CircularProgressbar
                value={levelProgress}
                text={`Nv.${level}`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: "rgba(255,255,255,0.95)",
                  textColor: "#ffffff",
                  trailColor: "rgba(255,255,255,0.15)",
                  pathTransitionDuration: 0.8,
                })}
              />
            </div>
            <div className={`px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1`}>
              <Star className="w-3 h-3" />
              {levelName}
            </div>
          </div>
        </div>

        {/* Milestone progress bar */}
        <div className="relative z-10 px-7 pb-5">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
            <span>{prev} dias</span>
            <span className="font-semibold text-white/80">Meta: {next} dias</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/80 transition-all duration-700"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-1">{milestoneProgress}% até o próximo marco</p>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Sequência Atual",
            value: currentStreak,
            icon: <Flame className="w-5 h-5 text-white" />,
            bg: "from-orange-500 to-red-500",
            light: "from-orange-50 to-red-50",
            border: "border-orange-200",
            text: "text-orange-700",
          },
          {
            label: "Recorde",
            value: longestStreak,
            icon: <Trophy className="w-5 h-5 text-white" />,
            bg: "from-amber-500 to-yellow-500",
            light: "from-amber-50 to-yellow-50",
            border: "border-amber-200",
            text: "text-amber-700",
          },
          {
            label: "Pontos",
            value: points,
            icon: <Zap className="w-5 h-5 text-white" />,
            bg: "from-violet-500 to-purple-600",
            light: "from-violet-50 to-purple-50",
            border: "border-violet-200",
            text: "text-violet-700",
          },
          {
            label: "Nível",
            value: level,
            icon: <Crown className="w-5 h-5 text-white" />,
            bg: "from-blue-500 to-cyan-500",
            light: "from-blue-50 to-cyan-50",
            border: "border-blue-200",
            text: "text-blue-700",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-4 bg-gradient-to-br ${s.light} border ${s.border} flex items-center gap-3`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-none mb-0.5">{s.label}</p>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Area chart */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Evolução da Sequência</p>
              <p className="text-xs text-gray-400">Últimos 14 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradDias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#d1d5db" fontSize={10} tick={{ fill: "#9ca3af" }} />
              <YAxis stroke="#d1d5db" fontSize={10} tick={{ fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  background: "#1e1b4b",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="dias"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#gradDias)"
                dot={{ fill: "#8b5cf6", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Métricas de Bem-Estar</p>
              <p className="text-xs text-gray-400">Baseado nos seus dias limpos</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Progresso" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Relapse button */}
        <button
          onClick={onRelapse}
          className="group relative flex items-center justify-center gap-3 h-16 rounded-2xl border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-semibold text-red-600 hover:text-red-700 shadow-sm hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-base">Registrar Recaída</span>
          <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Check-in button */}
        <button
          onClick={onCheckIn}
          className="group relative flex items-center justify-center gap-3 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-emerald-200 hover:shadow-xl transition-all duration-200"
          style={{ boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <span className="text-base">Hoje Estou Limpo ✓</span>
          <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-colors" />
        </button>
      </div>
    </div>
  );
}
