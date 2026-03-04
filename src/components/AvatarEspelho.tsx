import { useState, useEffect, useMemo } from "react";
import {
  Heart, Shield, Zap, Star, Lock, Unlock, TrendingUp,
  ChevronRight, Sparkles, Flame, Crown, Eye, Moon,
  Sun, CloudRain, Wind, Snowflake, ArrowUp, Info
} from "lucide-react";
import type { HabitLog } from "./SeasonDashboard";
import type { RelapseLog } from "../App";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarEspelhoProps {
  habitLogs: HabitLog[];
  relapseLogs: RelapseLog[];
  seasonStartDate: string;
  seasonDurationDays: number;
  userAvatar?: string;
  userName: string;
  onOpenForum?: () => void;
}

interface AvatarState {
  level: number;
  totalPoints: number;
  phase: "fragilizado" | "estavel" | "evoluindo" | "forte";
  mood: "triste" | "neutro" | "feliz" | "radiante";
  energy: number; // 0-100
  streak: number;
  weeklyScore: number; // 0-100
  communityUnlocked: boolean;
}

// ─── Constantes de Níveis do Avatar ──────────────────────────────────────────

const AVATAR_LEVELS = [
  { level: 1,  name: "Semente",       minPts: 0,    phase: "fragilizado" as const },
  { level: 2,  name: "Broto",         minPts: 50,   phase: "fragilizado" as const },
  { level: 3,  name: "Raiz",          minPts: 120,  phase: "fragilizado" as const },
  { level: 4,  name: "Caule",         minPts: 200,  phase: "estavel" as const },
  { level: 5,  name: "Folha",         minPts: 300,  phase: "estavel" as const },
  { level: 6,  name: "Flor",          minPts: 420,  phase: "estavel" as const },
  { level: 7,  name: "Fruto",         minPts: 560,  phase: "evoluindo" as const },
  { level: 8,  name: "Árvore",        minPts: 720,  phase: "evoluindo" as const },
  { level: 9,  name: "Floresta",      minPts: 900,  phase: "evoluindo" as const },
  { level: 10, name: "Montanha",      minPts: 1100, phase: "forte" as const },
  { level: 11, name: "Estrela",       minPts: 1350, phase: "forte" as const },
  { level: 12, name: "Sol",           minPts: 1650, phase: "forte" as const },
  { level: 13, name: "Universo",      minPts: 2000, phase: "forte" as const },
];

const COMMUNITY_UNLOCK_LEVEL = 12;

// ─── Fases visuais ───────────────────────────────────────────────────────────

const PHASE_CONFIG = {
  fragilizado: {
    gradient: "from-slate-600 via-slate-700 to-gray-800",
    bgGlow: "bg-slate-500/10",
    borderColor: "border-slate-600/30",
    particleColor: "#94a3b8",
    label: "Fragilizado",
    labelColor: "text-slate-400",
    bodyColor: "#64748b",
    eyeColor: "#94a3b8",
    cheekColor: "transparent",
    aura: false,
  },
  estavel: {
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    particleColor: "#34d399",
    label: "Estável",
    labelColor: "text-emerald-400",
    bodyColor: "#10b981",
    eyeColor: "#065f46",
    cheekColor: "rgba(251,191,36,0.3)",
    aura: false,
  },
  evoluindo: {
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    bgGlow: "bg-violet-500/15",
    borderColor: "border-violet-500/25",
    particleColor: "#a78bfa",
    label: "Evoluindo",
    labelColor: "text-violet-400",
    bodyColor: "#8b5cf6",
    eyeColor: "#4c1d95",
    cheekColor: "rgba(251,146,60,0.3)",
    aura: true,
  },
  forte: {
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    bgGlow: "bg-amber-500/15",
    borderColor: "border-amber-500/25",
    particleColor: "#fbbf24",
    label: "Forte",
    labelColor: "text-amber-400",
    bodyColor: "#f59e0b",
    eyeColor: "#78350f",
    cheekColor: "rgba(239,68,68,0.25)",
    aura: true,
  },
};

// ─── Cálculo do Estado do Avatar ─────────────────────────────────────────────

function calculateAvatarState(
  habitLogs: HabitLog[],
  relapseLogs: RelapseLog[],
  seasonStartDate: string,
  seasonDurationDays: number
): AvatarState {
  const today = new Date();
  const start = new Date(seasonStartDate);
  const relapseDateSet = new Set(relapseLogs.map((r) => r.dateKey));

  // Calcular pontos: +10 por hábito feito, +5 por dia sem recaída, -15 por recaída
  let totalPoints = 0;
  const doneLogs = habitLogs.filter((l) => l.status === "done");
  totalPoints += doneLogs.length * 10;

  // Dias da temporada até hoje
  const seasonDays: string[] = [];
  const end = new Date(seasonStartDate);
  end.setDate(end.getDate() + seasonDurationDays);
  const limit = today < end ? today : end;
  for (let d = new Date(start); d <= limit; d.setDate(d.getDate() + 1)) {
    seasonDays.push(d.toISOString().split("T")[0]);
  }

  let cleanDays = 0;
  let currentStreak = 0;
  let relapseCount = 0;

  for (const day of seasonDays) {
    if (relapseDateSet.has(day)) {
      totalPoints -= 15;
      currentStreak = 0;
      relapseCount++;
    } else {
      totalPoints += 5;
      cleanDays++;
      currentStreak++;
    }
  }

  totalPoints = Math.max(0, totalPoints);

  // Determinar nível
  let currentLevel = AVATAR_LEVELS[0];
  for (const lvl of AVATAR_LEVELS) {
    if (totalPoints >= lvl.minPts) currentLevel = lvl;
  }

  // Energia (0-100) baseada na semana actual
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekKey = weekStart.toISOString().split("T")[0];
  const weekLogs = doneLogs.filter((l) => {
    const logWeekStart = new Date(l.date);
    logWeekStart.setDate(logWeekStart.getDate() - logWeekStart.getDay());
    return logWeekStart.toISOString().split("T")[0] === weekKey;
  });
  const weekRelapses = relapseLogs.filter((r) => {
    const d = new Date(r.dateKey);
    const ws = new Date(d);
    ws.setDate(d.getDate() - d.getDay());
    return ws.toISOString().split("T")[0] === weekKey;
  });
  const weeklyScore = Math.min(100, Math.max(0,
    (weekLogs.length * 15) - (weekRelapses.length * 25)
  ));

  // Mood
  let mood: AvatarState["mood"] = "neutro";
  if (weeklyScore >= 80 && currentStreak >= 5) mood = "radiante";
  else if (weeklyScore >= 50) mood = "feliz";
  else if (weeklyScore < 20 || relapseCount > seasonDays.length * 0.3) mood = "triste";

  return {
    level: currentLevel.level,
    totalPoints,
    phase: currentLevel.phase,
    mood,
    energy: weeklyScore,
    streak: currentStreak,
    weeklyScore,
    communityUnlocked: currentLevel.level >= COMMUNITY_UNLOCK_LEVEL,
  };
}

// ─── SVG do Bichinho ─────────────────────────────────────────────────────────

function TamagotchiSVG({ state, phase }: { state: AvatarState; phase: typeof PHASE_CONFIG.fragilizado }) {
  const moodEyes = {
    triste: { cy: 42, rx: 4, ry: 5, brow: "M38,30 Q42,34 46,30 M54,30 Q58,34 62,30" },
    neutro: { cy: 40, rx: 4, ry: 4, brow: "" },
    feliz: { cy: 39, rx: 4.5, ry: 4.5, brow: "" },
    radiante: { cy: 38, rx: 5, ry: 3, brow: "" },
  };
  const moodMouth = {
    triste: "M42,58 Q50,52 58,58",
    neutro: "M42,56 L58,56",
    feliz: "M40,54 Q50,62 60,54",
    radiante: "M38,52 Q50,64 62,52",
  };

  const eyes = moodEyes[state.mood];
  const mouth = moodMouth[state.mood];
  const bounce = state.mood === "radiante" ? "animate-bounce" : state.mood === "feliz" ? "animate-pulse" : "";

  // Tamanho baseado no nível (cresce com o tempo)
  const scale = 0.8 + (state.level / 13) * 0.4;

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${bounce}`} style={{ filter: phase.aura ? `drop-shadow(0 0 12px ${phase.particleColor})` : "none" }}>
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={phase.bodyColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={phase.bodyColor} stopOpacity="1" />
        </radialGradient>
        <radialGradient id="shineGrad" cx="35%" cy="30%" r="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {phase.aura && (
          <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={phase.particleColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={phase.particleColor} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Aura para fases avançadas */}
      {phase.aura && (
        <circle cx="50" cy="50" r="48" fill="url(#auraGrad)" className="animate-pulse" />
      )}

      {/* Sombra */}
      <ellipse cx="50" cy="88" rx={22 * scale} ry={4} fill="black" opacity="0.15" />

      {/* Corpo principal */}
      <g transform={`translate(50,50) scale(${scale}) translate(-50,-50)`}>
        {/* Corpo - forma arredondada de bichinho */}
        <ellipse cx="50" cy="52" rx="28" ry="30" fill="url(#bodyGrad)" />
        <ellipse cx="50" cy="52" rx="28" ry="30" fill="url(#shineGrad)" />

        {/* Orelhinhas */}
        <ellipse cx="30" cy="28" rx="8" ry="10" fill={phase.bodyColor} transform="rotate(-15,30,28)" />
        <ellipse cx="70" cy="28" rx="8" ry="10" fill={phase.bodyColor} transform="rotate(15,70,28)" />
        <ellipse cx="30" cy="27" rx="5" ry="7" fill={`${phase.bodyColor}88`} transform="rotate(-15,30,27)" />
        <ellipse cx="70" cy="27" rx="5" ry="7" fill={`${phase.bodyColor}88`} transform="rotate(15,70,27)" />

        {/* Sobrancelhas (triste) */}
        {eyes.brow && (
          <path d={eyes.brow} stroke={phase.eyeColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* Olhos */}
        {state.mood === "radiante" ? (
          <>
            {/* Olhos felizes em arco */}
            <path d="M38,38 Q42,34 46,38" stroke={phase.eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M54,38 Q58,34 62,38" stroke={phase.eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="42" cy={eyes.cy} rx={eyes.rx} ry={eyes.ry} fill={phase.eyeColor} />
            <ellipse cx="58" cy={eyes.cy} rx={eyes.rx} ry={eyes.ry} fill={phase.eyeColor} />
            {/* Brilho nos olhos */}
            <circle cx="40" cy={eyes.cy - 1.5} r="1.5" fill="white" opacity="0.8" />
            <circle cx="56" cy={eyes.cy - 1.5} r="1.5" fill="white" opacity="0.8" />
          </>
        )}

        {/* Bochechas */}
        <ellipse cx="33" cy="50" rx="5" ry="3" fill={phase.cheekColor} />
        <ellipse cx="67" cy="50" rx="5" ry="3" fill={phase.cheekColor} />

        {/* Boca */}
        <path d={mouth} stroke={phase.eyeColor} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Patinhas */}
        <ellipse cx="38" cy="78" rx="7" ry="4" fill={phase.bodyColor} />
        <ellipse cx="62" cy="78" rx="7" ry="4" fill={phase.bodyColor} />

        {/* Coroa para nível forte */}
        {state.phase === "forte" && (
          <g transform="translate(50,12)">
            <polygon points="0,-8 -10,2 -6,2 -4,6 4,6 6,2 10,2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
            <circle cx="-5" cy="-2" r="1.5" fill="#ef4444" />
            <circle cx="0" cy="-5" r="1.5" fill="#3b82f6" />
            <circle cx="5" cy="-2" r="1.5" fill="#10b981" />
          </g>
        )}

        {/* Estrelinhas para evoluindo */}
        {state.phase === "evoluindo" && (
          <>
            <text x="18" y="25" fontSize="6" className="animate-pulse">✦</text>
            <text x="76" y="30" fontSize="5" className="animate-pulse" style={{ animationDelay: "0.5s" }}>✦</text>
            <text x="22" y="70" fontSize="4" className="animate-pulse" style={{ animationDelay: "1s" }}>✦</text>
          </>
        )}
      </g>
    </svg>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function AvatarEspelho({
  habitLogs,
  relapseLogs,
  seasonStartDate,
  seasonDurationDays,
  userAvatar,
  userName,
  onOpenForum,
}: AvatarEspelhoProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [animateLevel, setAnimateLevel] = useState(false);

  const state = useMemo(
    () => calculateAvatarState(habitLogs, relapseLogs, seasonStartDate, seasonDurationDays),
    [habitLogs, relapseLogs, seasonStartDate, seasonDurationDays]
  );

  const phaseConfig = PHASE_CONFIG[state.phase];
  const currentLevelData = AVATAR_LEVELS.find((l) => l.level === state.level) || AVATAR_LEVELS[0];
  const nextLevelData = AVATAR_LEVELS.find((l) => l.level === state.level + 1);
  const progressToNext = nextLevelData
    ? ((state.totalPoints - currentLevelData.minPts) / (nextLevelData.minPts - currentLevelData.minPts)) * 100
    : 100;

  useEffect(() => {
    setAnimateLevel(true);
    const t = setTimeout(() => setAnimateLevel(false), 600);
    return () => clearTimeout(t);
  }, [state.level]);

  return (
    <div className="w-full">
      {/* Container principal com gradiente */}
      <div className={`relative rounded-3xl overflow-hidden border ${phaseConfig.borderColor} ${phaseConfig.bgGlow}`}>
        {/* Background gradiente */}
        <div className={`absolute inset-0 bg-gradient-to-br ${phaseConfig.gradient} opacity-10`} />

        <div className="relative p-5 sm:p-6">
          {/* Header: Título + Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className={`w-4 h-4 ${phaseConfig.labelColor}`} />
              <h3 className="text-sm font-bold text-white">Avatar Espelho</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${phaseConfig.bgGlow} ${phaseConfig.labelColor} border ${phaseConfig.borderColor}`}>
                {phaseConfig.label}
              </span>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Info tooltip */}
          {showInfo && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 leading-relaxed">
              Seu avatar reflete seu comportamento. Faça hábitos para evoluir, evite recaídas para manter a energia.
              Ao atingir o <strong className="text-amber-300">Nível {COMMUNITY_UNLOCK_LEVEL}</strong>, a porta da comunidade será desbloqueada.
            </div>
          )}

          {/* Layout: Avatar + Stats */}
          <div className="flex gap-5 items-center">
            {/* Avatar SVG */}
            <div className="relative flex-shrink-0">
              <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br ${phaseConfig.gradient} p-0.5`}>
                <div className="w-full h-full rounded-[14px] bg-slate-900/80 flex items-center justify-center overflow-hidden">
                  <TamagotchiSVG state={state} phase={phaseConfig} />
                </div>
              </div>
              {/* Badge de nível */}
              <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br ${phaseConfig.gradient} flex items-center justify-center shadow-lg border-2 border-slate-900 ${animateLevel ? "scale-125" : "scale-100"} transition-transform duration-300`}>
                <span className="text-white font-extrabold text-sm">{state.level}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Nome do nível */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nível {state.level}</p>
                <p className="text-lg font-extrabold text-white leading-tight">{currentLevelData.name}</p>
              </div>

              {/* Barra de XP */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500 font-medium">{state.totalPoints} pts</span>
                  {nextLevelData && (
                    <span className="text-[11px] text-gray-500 font-medium">{nextLevelData.minPts} pts</span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${phaseConfig.gradient} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(100, progressToNext)}%` }}
                  />
                </div>
                {nextLevelData && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    Faltam <strong className={phaseConfig.labelColor}>{nextLevelData.minPts - state.totalPoints}</strong> pts para {nextLevelData.name}
                  </p>
                )}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Flame className="w-3.5 h-3.5 text-orange-400 mx-auto mb-0.5" />
                  <p className="text-xs font-bold text-white">{state.streak}</p>
                  <p className="text-[9px] text-gray-500">Sequência</p>
                </div>
                <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-0.5" />
                  <p className="text-xs font-bold text-white">{state.energy}%</p>
                  <p className="text-[9px] text-gray-500">Energia</p>
                </div>
                <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <Heart className="w-3.5 h-3.5 text-pink-400 mx-auto mb-0.5" />
                  <p className="text-xs font-bold text-white capitalize">{state.mood === "radiante" ? "😊" : state.mood === "feliz" ? "🙂" : state.mood === "neutro" ? "😐" : "😔"}</p>
                  <p className="text-[9px] text-gray-500">Humor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Porta da Comunidade */}
          <div className="mt-5">
            <div className={`
              flex items-center gap-3 p-3.5 rounded-2xl border transition-all
              ${state.communityUnlocked
                ? "bg-amber-500/10 border-amber-500/20 cursor-pointer hover:bg-amber-500/15"
                : "bg-white/[0.02] border-white/[0.06] opacity-60"
              }
            `}
              onClick={state.communityUnlocked ? onOpenForum : undefined}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${state.communityUnlocked
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 border border-white/10"
                }
              `}>
                {state.communityUnlocked ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${state.communityUnlocked ? "text-amber-300" : "text-gray-500"}`}>
                  Porta da Comunidade
                </p>
                <p className="text-[11px] text-gray-500">
                  {state.communityUnlocked
                    ? "Desbloqueada! Toque para entrar"
                    : `Desbloqueada no Nível ${COMMUNITY_UNLOCK_LEVEL} — faltam ${Math.max(0, COMMUNITY_UNLOCK_LEVEL - state.level)} níveis`
                  }
                </p>
              </div>
              {state.communityUnlocked && (
                <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
              )}
              {!state.communityUnlocked && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">{state.level}/{COMMUNITY_UNLOCK_LEVEL}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline de evolução (últimos 7 dias) */}
          <div className="mt-4">
            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Últimos 7 dias</p>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const key = d.toISOString().split("T")[0];
                const hasHabit = habitLogs.some((l) => l.date.split("T")[0] === key && l.status === "done");
                const hasRelapse = relapseLogs.some((r) => r.dateKey === key);
                const isToday = i === 6;

                let bg = "bg-white/[0.04]";
                let border = "border-white/[0.06]";
                let dot = "bg-gray-700";
                if (hasRelapse) { bg = "bg-red-500/10"; border = "border-red-500/20"; dot = "bg-red-500"; }
                else if (hasHabit) { bg = "bg-emerald-500/10"; border = "border-emerald-500/20"; dot = "bg-emerald-500"; }

                return (
                  <div
                    key={key}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border ${bg} ${border} ${isToday ? "ring-1 ring-white/20" : ""}`}
                  >
                    <span className="text-[9px] text-gray-600 font-medium">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()]}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                    <span className="text-[9px] text-gray-500">{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Hábito feito
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Recaída
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-700" /> Sem registro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarEspelho;
