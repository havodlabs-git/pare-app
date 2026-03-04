import { useState, useEffect, useMemo, useRef } from "react";
import {
  Heart, Zap, Lock, Unlock,
  ChevronRight, Flame, Eye, Info,
  Shield, TrendingUp, Sparkles, Star
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
  energy: number;
  streak: number;
  weeklyScore: number;
  communityUnlocked: boolean;
}

// ─── Constantes de Níveis do Avatar ──────────────────────────────────────────

const AVATAR_LEVELS = [
  { level: 1,  name: "Semente",   minPts: 0,    phase: "fragilizado" as const },
  { level: 2,  name: "Broto",     minPts: 50,   phase: "fragilizado" as const },
  { level: 3,  name: "Raiz",      minPts: 120,  phase: "fragilizado" as const },
  { level: 4,  name: "Caule",     minPts: 200,  phase: "estavel" as const },
  { level: 5,  name: "Folha",     minPts: 300,  phase: "estavel" as const },
  { level: 6,  name: "Flor",      minPts: 420,  phase: "estavel" as const },
  { level: 7,  name: "Fruto",     minPts: 560,  phase: "evoluindo" as const },
  { level: 8,  name: "Árvore",    minPts: 720,  phase: "evoluindo" as const },
  { level: 9,  name: "Floresta",  minPts: 900,  phase: "evoluindo" as const },
  { level: 10, name: "Montanha",  minPts: 1100, phase: "forte" as const },
  { level: 11, name: "Estrela",   minPts: 1350, phase: "forte" as const },
  { level: 12, name: "Sol",       minPts: 1650, phase: "forte" as const },
  { level: 13, name: "Universo",  minPts: 2000, phase: "forte" as const },
];

const COMMUNITY_UNLOCK_LEVEL = 12;

// ─── Mood labels ─────────────────────────────────────────────────────────────

const MOOD_LABELS: Record<AvatarState["mood"], string> = {
  triste: "Abatido",
  neutro: "Neutro",
  feliz: "Bem",
  radiante: "Radiante",
};

// ─── Fases visuais ───────────────────────────────────────────────────────────

const PHASE_CONFIG = {
  fragilizado: {
    gradient: "from-slate-600 via-slate-700 to-gray-800",
    cardBg: "from-slate-900/90 via-slate-800/80 to-gray-900/90",
    accentGradient: "from-slate-400 to-slate-600",
    bgGlow: "bg-slate-500/10",
    borderColor: "border-slate-600/30",
    particleColor: "#94a3b8",
    label: "Fragilizado",
    labelColor: "text-slate-400",
    labelBg: "bg-slate-500/15",
    bodyMain: "#7c8da4",
    bodyLight: "#a0b1c5",
    bodyDark: "#4a5568",
    eyeColor: "#2d3748",
    pupilColor: "#1a202c",
    cheekColor: "transparent",
    mouthColor: "#4a5568",
    aura: false,
    bgScene: "#1a1e2e",
    ringColor: "ring-slate-500/30",
    statBg: "bg-slate-800/40",
    statBorder: "border-slate-700/30",
  },
  estavel: {
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    cardBg: "from-emerald-950/90 via-teal-900/80 to-cyan-950/90",
    accentGradient: "from-emerald-400 to-teal-500",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    particleColor: "#34d399",
    label: "Estável",
    labelColor: "text-emerald-400",
    labelBg: "bg-emerald-500/15",
    bodyMain: "#34d399",
    bodyLight: "#6ee7b7",
    bodyDark: "#059669",
    eyeColor: "#065f46",
    pupilColor: "#022c22",
    cheekColor: "rgba(251,191,36,0.35)",
    mouthColor: "#065f46",
    aura: false,
    bgScene: "#0f2922",
    ringColor: "ring-emerald-500/30",
    statBg: "bg-emerald-900/30",
    statBorder: "border-emerald-700/20",
  },
  evoluindo: {
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    cardBg: "from-violet-950/90 via-purple-900/80 to-fuchsia-950/90",
    accentGradient: "from-violet-400 to-purple-500",
    bgGlow: "bg-violet-500/15",
    borderColor: "border-violet-500/25",
    particleColor: "#a78bfa",
    label: "Evoluindo",
    labelColor: "text-violet-400",
    labelBg: "bg-violet-500/15",
    bodyMain: "#a78bfa",
    bodyLight: "#c4b5fd",
    bodyDark: "#7c3aed",
    eyeColor: "#4c1d95",
    pupilColor: "#2e1065",
    cheekColor: "rgba(251,146,60,0.3)",
    mouthColor: "#4c1d95",
    aura: true,
    bgScene: "#1a1033",
    ringColor: "ring-violet-500/30",
    statBg: "bg-violet-900/30",
    statBorder: "border-violet-700/20",
  },
  forte: {
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    cardBg: "from-amber-950/90 via-orange-950/80 to-rose-950/90",
    accentGradient: "from-amber-400 to-orange-500",
    bgGlow: "bg-amber-500/15",
    borderColor: "border-amber-500/25",
    particleColor: "#fbbf24",
    label: "Forte",
    labelColor: "text-amber-400",
    labelBg: "bg-amber-500/15",
    bodyMain: "#fbbf24",
    bodyLight: "#fde68a",
    bodyDark: "#d97706",
    eyeColor: "#78350f",
    pupilColor: "#451a03",
    cheekColor: "rgba(239,68,68,0.25)",
    mouthColor: "#78350f",
    aura: true,
    bgScene: "#2a1a0a",
    ringColor: "ring-amber-500/30",
    statBg: "bg-amber-900/30",
    statBorder: "border-amber-700/20",
  },
};

type PhaseConfig = typeof PHASE_CONFIG.fragilizado;

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

  let totalPoints = 0;
  const doneLogs = habitLogs.filter((l) => l.status === "done");
  totalPoints += doneLogs.length * 10;

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

  let currentLevel = AVATAR_LEVELS[0];
  for (const lvl of AVATAR_LEVELS) {
    if (totalPoints >= lvl.minPts) currentLevel = lvl;
  }

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

// ─── CSS Animations ─────────────────────────────────────────────────────────

const ANIM_STYLE_ID = "avatar-espelho-anims-v2";

function injectAnimations() {
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = ANIM_STYLE_ID;
  style.textContent = `
    @keyframes av-breathe {
      0%, 100% { transform: scaleY(1) translateY(0); }
      50% { transform: scaleY(1.035) translateY(-0.8px); }
    }
    .av-breathe { animation: av-breathe 3.2s ease-in-out infinite; transform-origin: center bottom; }

    @keyframes av-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .av-float { animation: av-float 4s ease-in-out infinite; }

    @keyframes av-blink {
      0%, 42%, 44%, 100% { transform: scaleY(1); }
      43% { transform: scaleY(0.08); }
    }
    .av-blink { animation: av-blink 4.5s ease-in-out infinite; transform-origin: center; }
    .av-blink-delay { animation: av-blink 4.5s ease-in-out infinite 0.6s; transform-origin: center; }

    @keyframes av-ear-l {
      0%, 85%, 100% { transform: rotate(-12deg); }
      90% { transform: rotate(-20deg); }
      95% { transform: rotate(-8deg); }
    }
    @keyframes av-ear-r {
      0%, 85%, 100% { transform: rotate(12deg); }
      90% { transform: rotate(20deg); }
      95% { transform: rotate(8deg); }
    }
    .av-ear-l { animation: av-ear-l 6s ease-in-out infinite; transform-origin: 60% 90%; }
    .av-ear-r { animation: av-ear-r 6s ease-in-out infinite 0.15s; transform-origin: 40% 90%; }

    @keyframes av-tail {
      0%, 100% { transform: rotate(-15deg); }
      25% { transform: rotate(10deg); }
      50% { transform: rotate(-10deg); }
      75% { transform: rotate(8deg); }
    }
    .av-tail { animation: av-tail 2s ease-in-out infinite; transform-origin: 20% 80%; }

    @keyframes av-hop {
      0%, 100% { transform: translateY(0) scaleY(1); }
      15% { transform: translateY(0) scaleY(0.92); }
      30% { transform: translateY(-8px) scaleY(1.05); }
      50% { transform: translateY(0) scaleY(0.95); }
      65% { transform: translateY(-4px) scaleY(1.02); }
      80% { transform: translateY(0) scaleY(0.98); }
    }
    .av-hop { animation: av-hop 3s ease-in-out infinite; transform-origin: center bottom; }

    @keyframes av-droop {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(2px) rotate(-1.5deg); }
    }
    .av-droop { animation: av-droop 4s ease-in-out infinite; transform-origin: center bottom; }

    @keyframes av-aura {
      0%, 100% { opacity: 0.12; transform: scale(1); }
      50% { opacity: 0.25; transform: scale(1.06); }
    }
    .av-aura { animation: av-aura 3s ease-in-out infinite; transform-origin: center; }

    @keyframes av-sparkle {
      0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
      20% { opacity: 1; transform: scale(1) rotate(30deg); }
      80% { opacity: 1; transform: scale(1) rotate(150deg); }
    }
    .av-sparkle-1 { animation: av-sparkle 2.5s ease-in-out infinite; }
    .av-sparkle-2 { animation: av-sparkle 2.5s ease-in-out infinite 0.8s; }
    .av-sparkle-3 { animation: av-sparkle 2.5s ease-in-out infinite 1.6s; }

    @keyframes av-crown {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.3)); }
      50% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.7)); }
    }
    .av-crown { animation: av-crown 2.5s ease-in-out infinite; }

    @keyframes av-shadow {
      0%, 100% { rx: 20; opacity: 0.12; }
      50% { rx: 22; opacity: 0.08; }
    }
    .av-shadow { animation: av-shadow 3.2s ease-in-out infinite; }

    @keyframes av-blush {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
    .av-blush { animation: av-blush 3s ease-in-out infinite; }

    @keyframes av-heart-float {
      0% { opacity: 0; transform: translateY(0) scale(0.5); }
      30% { opacity: 1; transform: translateY(-6px) scale(1); }
      100% { opacity: 0; transform: translateY(-18px) scale(0.6); }
    }
    .av-heart-1 { animation: av-heart-float 3s ease-out infinite; }
    .av-heart-2 { animation: av-heart-float 3s ease-out infinite 1s; }
    .av-heart-3 { animation: av-heart-float 3s ease-out infinite 2s; }

    @keyframes av-tear {
      0%, 60% { opacity: 0; transform: translateY(0); }
      65% { opacity: 0.7; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(10px); }
    }
    .av-tear { animation: av-tear 5s ease-in infinite; }
    .av-tear-delay { animation: av-tear 5s ease-in infinite 2.5s; }

    @keyframes av-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .av-shimmer::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: av-shimmer 2.5s ease-in-out infinite;
    }

    @keyframes av-orbit {
      0% { transform: rotate(0deg) translateX(58px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(58px) rotate(-360deg); }
    }
    .av-orbit-1 { animation: av-orbit 12s linear infinite; }
    .av-orbit-2 { animation: av-orbit 12s linear infinite 4s; }
    .av-orbit-3 { animation: av-orbit 12s linear infinite 8s; }

    @keyframes av-glow-pulse {
      0%, 100% { opacity: 0.15; }
      50% { opacity: 0.35; }
    }
    .av-glow-pulse { animation: av-glow-pulse 4s ease-in-out infinite; }

    @keyframes av-level-pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .av-level-pop { animation: av-level-pop 0.5s ease-out; }

    @keyframes av-slide-up {
      0% { opacity: 0; transform: translateY(12px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .av-slide-up { animation: av-slide-up 0.6s ease-out forwards; }

    @keyframes av-ring-rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes av-bg-float {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.04; }
      50% { transform: translateY(-8px) scale(1.05); opacity: 0.08; }
    }
  `;
  document.head.appendChild(style);
}

// ─── SVG Tamagotchi ──────────────────────────────────────────────────────────

function TamagotchiSVG({ state, phase }: { state: AvatarState; phase: PhaseConfig }) {
  const uid = useRef(`av-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => { injectAnimations(); }, []);

  const scale = 0.82 + (state.level / 13) * 0.38;

  const bodyAnim =
    state.mood === "radiante" ? "av-hop" :
    state.mood === "feliz" ? "av-float" :
    state.mood === "triste" ? "av-droop" :
    "av-breathe";

  const mouths: Record<AvatarState["mood"], string> = {
    triste:   "M43,57 Q50,52 57,57",
    neutro:   "M44,55 Q50,56 56,55",
    feliz:    "M41,53 Q50,60 59,53",
    radiante: "M39,51 Q50,63 61,51",
  };

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${uid}-body`} cx="45%" cy="38%" r="55%">
          <stop offset="0%" stopColor={phase.bodyLight} />
          <stop offset="70%" stopColor={phase.bodyMain} />
          <stop offset="100%" stopColor={phase.bodyDark} />
        </radialGradient>
        <radialGradient id={`${uid}-shine`} cx="38%" cy="28%" r="32%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {phase.aura && (
          <radialGradient id={`${uid}-aura`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={phase.particleColor} stopOpacity="0.2" />
            <stop offset="60%" stopColor={phase.particleColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={phase.particleColor} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {phase.aura && (
        <ellipse cx="60" cy="62" rx="52" ry="48" fill={`url(#${uid}-aura)`} className="av-aura" />
      )}

      <ellipse cx="60" cy="108" rx={20 * scale} ry="3.5" fill="black" className="av-shadow" />

      <g className={bodyAnim}>
        <g transform={`translate(60,62) scale(${scale}) translate(-60,-62)`}>
          <path d="M84,72 Q96,65 92,55 Q90,50 86,52" stroke={phase.bodyDark} strokeWidth="4.5" strokeLinecap="round" fill="none" className="av-tail" />
          <g className="av-ear-l">
            <ellipse cx="36" cy="28" rx="10" ry="14" fill={phase.bodyMain} />
            <ellipse cx="36" cy="28" rx="6" ry="10" fill={phase.bodyLight} opacity="0.5" />
          </g>
          <g className="av-ear-r">
            <ellipse cx="84" cy="28" rx="10" ry="14" fill={phase.bodyMain} />
            <ellipse cx="84" cy="28" rx="6" ry="10" fill={phase.bodyLight} opacity="0.5" />
          </g>
          <ellipse cx="60" cy="60" rx="30" ry="33" fill={`url(#${uid}-body)`} />
          <ellipse cx="60" cy="60" rx="30" ry="33" fill={`url(#${uid}-shine)`} />
          <ellipse cx="60" cy="68" rx="16" ry="14" fill={`url(#${uid}-belly)`} />
          <ellipse cx="45" cy="90" rx="9" ry="5" fill={phase.bodyDark} />
          <ellipse cx="75" cy="90" rx="9" ry="5" fill={phase.bodyDark} />
          <ellipse cx="44" cy="89" rx="5" ry="2.5" fill={phase.bodyMain} opacity="0.4" />
          <ellipse cx="74" cy="89" rx="5" ry="2.5" fill={phase.bodyMain} opacity="0.4" />
          <ellipse cx="33" cy="65" rx="6" ry="8" fill={phase.bodyMain} transform="rotate(15,33,65)" />
          <ellipse cx="87" cy="65" rx="6" ry="8" fill={phase.bodyMain} transform="rotate(-15,87,65)" />

          {state.mood === "radiante" ? (
            <>
              <g className="av-blink">
                <path d="M47,44 Q51,38 55,44" stroke={phase.eyeColor} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              </g>
              <g className="av-blink-delay">
                <path d="M65,44 Q69,38 73,44" stroke={phase.eyeColor} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              </g>
            </>
          ) : state.mood === "triste" ? (
            <>
              <g className="av-blink">
                <ellipse cx="51" cy="46" rx="5" ry="5.5" fill={phase.eyeColor} />
                <circle cx="49.5" cy="44.5" r="2" fill="white" opacity="0.7" />
                <path d="M44,38 Q51,42 56,39" stroke={phase.eyeColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
              <g className="av-blink-delay">
                <ellipse cx="69" cy="46" rx="5" ry="5.5" fill={phase.eyeColor} />
                <circle cx="67.5" cy="44.5" r="2" fill="white" opacity="0.7" />
                <path d="M64,39 Q69,42 76,38" stroke={phase.eyeColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
            </>
          ) : (
            <>
              <g className="av-blink">
                <ellipse cx="51" cy="44" rx="5" ry={state.mood === "feliz" ? 5 : 4.5} fill={phase.eyeColor} />
                <ellipse cx="51" cy="44" rx="3" ry={state.mood === "feliz" ? 3 : 2.5} fill={phase.pupilColor} />
                <circle cx="49" cy="42.5" r="2" fill="white" opacity="0.85" />
                <circle cx="53" cy="45" r="1" fill="white" opacity="0.4" />
              </g>
              <g className="av-blink-delay">
                <ellipse cx="69" cy="44" rx="5" ry={state.mood === "feliz" ? 5 : 4.5} fill={phase.eyeColor} />
                <ellipse cx="69" cy="44" rx="3" ry={state.mood === "feliz" ? 3 : 2.5} fill={phase.pupilColor} />
                <circle cx="67" cy="42.5" r="2" fill="white" opacity="0.85" />
                <circle cx="71" cy="45" r="1" fill="white" opacity="0.4" />
              </g>
            </>
          )}

          {phase.cheekColor !== "transparent" && (
            <>
              <ellipse cx="40" cy="54" rx="6" ry="3.5" fill={phase.cheekColor} className="av-blush" />
              <ellipse cx="80" cy="54" rx="6" ry="3.5" fill={phase.cheekColor} className="av-blush" />
            </>
          )}

          <ellipse cx="60" cy="50" rx="2.5" ry="2" fill={phase.eyeColor} opacity="0.6" />

          <path
            d={mouths[state.mood]}
            stroke={phase.mouthColor}
            strokeWidth="2.2"
            fill={state.mood === "radiante" ? phase.mouthColor : "none"}
            fillOpacity={state.mood === "radiante" ? 0.15 : 0}
            strokeLinecap="round"
          />

          {state.mood === "triste" && (
            <>
              <ellipse cx="46" cy="52" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.6" className="av-tear" />
              <ellipse cx="74" cy="52" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.6" className="av-tear-delay" />
            </>
          )}

          {state.mood === "radiante" && (
            <>
              <g className="av-heart-1">
                <path d="M28,30 C28,27 32,25 34,28 C36,25 40,27 40,30 C40,35 34,38 34,38 C34,38 28,35 28,30Z" fill="#f87171" opacity="0.7" />
              </g>
              <g className="av-heart-2">
                <path d="M82,25 C82,23 85,21 86,23 C87,21 90,23 90,25 C90,28 86,30 86,30 C86,30 82,28 82,25Z" fill="#fb923c" opacity="0.6" />
              </g>
              <g className="av-heart-3">
                <path d="M55,18 C55,16 57,15 58,16.5 C59,15 61,16 61,18 C61,20 58,22 58,22 C58,22 55,20 55,18Z" fill="#a78bfa" opacity="0.5" />
              </g>
            </>
          )}

          {state.phase === "forte" && (
            <g transform="translate(60,14)" className="av-crown">
              <polygon points="0,-10 -3,-4 -12,0 -8,0 -5,4 5,4 8,0 12,0 3,-4" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
              <circle cx="-6" cy="-1" r="2" fill="#ef4444" />
              <circle cx="0" cy="-6" r="2" fill="#3b82f6" />
              <circle cx="6" cy="-1" r="2" fill="#10b981" />
            </g>
          )}

          {state.phase === "evoluindo" && (
            <>
              <g className="av-sparkle-1" style={{ transformOrigin: "24px 22px" }}>
                <path d="M24,18 L25,21 L28,22 L25,23 L24,26 L23,23 L20,22 L23,21Z" fill={phase.particleColor} opacity="0.8" />
              </g>
              <g className="av-sparkle-2" style={{ transformOrigin: "96px 30px" }}>
                <path d="M96,27 L97,29 L99,30 L97,31 L96,33 L95,31 L93,30 L95,29Z" fill={phase.particleColor} opacity="0.7" />
              </g>
              <g className="av-sparkle-3" style={{ transformOrigin: "30px 78px" }}>
                <path d="M30,76 L30.5,77.5 L32,78 L30.5,78.5 L30,80 L29.5,78.5 L28,78 L29.5,77.5Z" fill={phase.particleColor} opacity="0.6" />
              </g>
            </>
          )}
        </g>
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

  // 7-day data
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0];
      const hasHabit = habitLogs.some((l) => l.date.split("T")[0] === key && l.status === "done");
      const hasRelapse = relapseLogs.some((r) => r.dateKey === key);
      const isToday = i === 6;
      return { d, key, hasHabit, hasRelapse, isToday };
    });
  }, [habitLogs, relapseLogs]);

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <div className="w-full av-slide-up">
      {/* ── Main Card ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: "#0c0e1a" }}>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl av-glow-pulse"
            style={{ background: `radial-gradient(circle, ${phaseConfig.particleColor}22, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl av-glow-pulse"
            style={{ background: `radial-gradient(circle, ${phaseConfig.particleColor}15, transparent 70%)`, animationDelay: "2s" }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(${phaseConfig.particleColor}40 1px, transparent 1px), linear-gradient(90deg, ${phaseConfig.particleColor}40 1px, transparent 1px)`,
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative">
          {/* ── Header Bar ──────────────────────────────────────────────────── */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${phaseConfig.accentGradient} flex items-center justify-center shadow-lg`}
                style={{ boxShadow: `0 4px 14px ${phaseConfig.particleColor}30` }}>
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Avatar Espelho</h3>
                <p className="text-[10px] text-gray-500 -mt-0.5">Seu reflexo comportamental</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${phaseConfig.labelBg} ${phaseConfig.labelColor} border ${phaseConfig.borderColor} uppercase tracking-wider`}>
                {phaseConfig.label}
              </span>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${showInfo ? "bg-white/10 text-white" : "bg-white/5 text-gray-600 hover:text-white hover:bg-white/10"}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showInfo && (
            <div className="mx-5 mb-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <p className="text-xs text-gray-400 leading-relaxed">
                Seu avatar reflete seu comportamento real. Faça hábitos para evoluir (+10 pts), mantenha dias limpos (+5 pts) e evite recaídas (-15 pts).
                Ao atingir o <strong className={phaseConfig.labelColor}>Nível {COMMUNITY_UNLOCK_LEVEL}</strong>, a porta da comunidade será desbloqueada.
              </p>
            </div>
          )}

          {/* ── Avatar Showcase ─────────────────────────────────────────────── */}
          <div className="px-5 pb-4">
            <div className="flex gap-5 items-stretch">

              {/* Avatar Container — premium frame */}
              <div className="relative flex-shrink-0">
                {/* Outer glow ring */}
                <div
                  className="absolute -inset-1 rounded-[22px] av-glow-pulse"
                  style={{ background: `linear-gradient(135deg, ${phaseConfig.bodyLight}40, transparent, ${phaseConfig.bodyDark}40)` }}
                />
                <div
                  className="relative w-[148px] h-[148px] sm:w-[164px] sm:h-[164px] rounded-[20px] p-[2px]"
                  style={{ background: `linear-gradient(135deg, ${phaseConfig.bodyLight}, ${phaseConfig.bodyMain}80, ${phaseConfig.bodyDark})` }}
                >
                  <div
                    className="w-full h-full rounded-[18px] flex items-center justify-center overflow-hidden relative"
                    style={{ backgroundColor: phaseConfig.bgScene }}
                  >
                    {/* Scene particles */}
                    {phaseConfig.aura && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="av-orbit-1 absolute" style={{ top: "50%", left: "50%", width: "4px", height: "4px" }}>
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: phaseConfig.particleColor, opacity: 0.5 }} />
                        </div>
                        <div className="av-orbit-2 absolute" style={{ top: "50%", left: "50%", width: "3px", height: "3px" }}>
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: phaseConfig.particleColor, opacity: 0.3 }} />
                        </div>
                        <div className="av-orbit-3 absolute" style={{ top: "50%", left: "50%", width: "3px", height: "3px" }}>
                          <div className="w-0.5 h-0.5 rounded-full" style={{ backgroundColor: phaseConfig.particleColor, opacity: 0.4 }} />
                        </div>
                      </div>
                    )}
                    <TamagotchiSVG state={state} phase={phaseConfig} />
                  </div>
                </div>

                {/* Level badge — floating */}
                <div
                  className={`absolute -bottom-2.5 -right-2.5 w-11 h-11 rounded-xl flex items-center justify-center shadow-xl border-[2.5px] transition-transform duration-500 ${animateLevel ? "av-level-pop" : ""}`}
                  style={{
                    background: `linear-gradient(135deg, ${phaseConfig.bodyLight}, ${phaseConfig.bodyDark})`,
                    borderColor: "#0c0e1a",
                    boxShadow: `0 4px 16px ${phaseConfig.particleColor}40`,
                  }}
                >
                  <span className="text-white font-black text-sm drop-shadow">{state.level}</span>
                </div>

                {/* Mood indicator — floating top-left */}
                <div
                  className="absolute -top-1.5 -left-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border-[2px]"
                  style={{
                    background: state.mood === "radiante" ? "#10b981" : state.mood === "feliz" ? "#3b82f6" : state.mood === "triste" ? "#ef4444" : "#6b7280",
                    borderColor: "#0c0e1a",
                    color: "white",
                  }}
                >
                  {MOOD_LABELS[state.mood]}
                </div>
              </div>

              {/* ── Right Panel — Stats ─────────────────────────────────────── */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                {/* Level name + phase */}
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles className={`w-3 h-3 ${phaseConfig.labelColor}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${phaseConfig.labelColor}`}>
                      Nível {state.level}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-white tracking-tight leading-tight">
                    {currentLevelData.name}
                  </h4>
                </div>

                {/* XP Progress */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-gray-400">{state.totalPoints} XP</span>
                    {nextLevelData && (
                      <span className="text-[10px] font-medium text-gray-600">{nextLevelData.minPts} XP</span>
                    )}
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden relative border border-white/[0.04]">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative av-shimmer"
                      style={{
                        width: `${Math.min(100, Math.max(2, progressToNext))}%`,
                        background: `linear-gradient(90deg, ${phaseConfig.bodyDark}, ${phaseConfig.bodyMain}, ${phaseConfig.bodyLight})`,
                        boxShadow: `0 0 12px ${phaseConfig.particleColor}50`,
                      }}
                    />
                  </div>
                  {nextLevelData && (
                    <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Faltam <strong className={`${phaseConfig.labelColor} mx-0.5`}>{nextLevelData.minPts - state.totalPoints}</strong> XP para {nextLevelData.name}
                    </p>
                  )}
                </div>

                {/* Mini Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                  {[
                    { icon: <Flame className="w-3.5 h-3.5" />, value: state.streak, label: "Sequência", iconColor: "text-orange-400", glowColor: "shadow-orange-500/10" },
                    { icon: <Zap className="w-3.5 h-3.5" />, value: `${state.energy}%`, label: "Energia", iconColor: "text-yellow-400", glowColor: "shadow-yellow-500/10" },
                    { icon: <Heart className="w-3.5 h-3.5" />, value: `${state.totalPoints}`, label: "XP Total", iconColor: "text-pink-400", glowColor: "shadow-pink-500/10" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`text-center py-2 px-1 rounded-xl ${phaseConfig.statBg} border ${phaseConfig.statBorder} shadow-sm ${stat.glowColor}`}
                    >
                      <div className={`${stat.iconColor} mx-auto mb-0.5 flex justify-center`}>{stat.icon}</div>
                      <p className="text-xs font-extrabold text-white leading-tight">{stat.value}</p>
                      <p className="text-[8px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div className="mx-5">
            <div className="h-px w-full" style={{
              background: `linear-gradient(90deg, transparent, ${phaseConfig.particleColor}25, transparent)`
            }} />
          </div>

          {/* ── 7-Day Timeline ─────────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className={`w-3.5 h-3.5 ${phaseConfig.labelColor}`} />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Últimos 7 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Feito
                </span>
                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Recaída
                </span>
                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 inline-block" /> Vazio
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {last7Days.map(({ d, key, hasHabit, hasRelapse, isToday }) => {
                let dotColor = "bg-gray-700/60";
                let cardBg = "bg-white/[0.02]";
                let cardBorder = "border-white/[0.04]";
                let ringClass = "";

                if (hasRelapse) {
                  dotColor = "bg-red-500";
                  cardBg = "bg-red-500/[0.06]";
                  cardBorder = "border-red-500/15";
                } else if (hasHabit) {
                  dotColor = "bg-emerald-500";
                  cardBg = "bg-emerald-500/[0.06]";
                  cardBorder = "border-emerald-500/15";
                }

                if (isToday) {
                  ringClass = `ring-1 ${phaseConfig.ringColor}`;
                }

                return (
                  <div
                    key={key}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border ${cardBg} ${cardBorder} ${ringClass} transition-all`}
                  >
                    <span className={`text-[9px] font-semibold uppercase tracking-wider ${isToday ? "text-white" : "text-gray-600"}`}>
                      {dayNames[d.getDay()]}
                    </span>
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${dotColor} transition-colors`} />
                      {hasRelapse && (
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-30" />
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${isToday ? "text-white" : "text-gray-500"}`}>
                      {d.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div className="mx-5">
            <div className="h-px w-full" style={{
              background: `linear-gradient(90deg, transparent, ${phaseConfig.particleColor}25, transparent)`
            }} />
          </div>

          {/* ── Community Gate ──────────────────────────────────────────────── */}
          <div className="px-5 py-4">
            <div
              className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all ${
                state.communityUnlocked
                  ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  : "opacity-50"
              }`}
              style={{
                background: state.communityUnlocked
                  ? `linear-gradient(135deg, ${phaseConfig.particleColor}12, ${phaseConfig.particleColor}06)`
                  : "rgba(255,255,255,0.015)",
                borderColor: state.communityUnlocked
                  ? `${phaseConfig.particleColor}30`
                  : "rgba(255,255,255,0.04)",
              }}
              onClick={state.communityUnlocked ? onOpenForum : undefined}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                state.communityUnlocked ? "shadow-lg" : ""
              }`}
                style={{
                  background: state.communityUnlocked
                    ? `linear-gradient(135deg, ${phaseConfig.bodyLight}, ${phaseConfig.bodyDark})`
                    : "rgba(255,255,255,0.04)",
                  boxShadow: state.communityUnlocked ? `0 4px 20px ${phaseConfig.particleColor}30` : "none",
                }}
              >
                {state.communityUnlocked ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${state.communityUnlocked ? "text-white" : "text-gray-600"}`}>
                  Porta da Comunidade
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {state.communityUnlocked
                    ? "Desbloqueada! Toque para entrar no fórum"
                    : `Nível ${COMMUNITY_UNLOCK_LEVEL} necessário`
                  }
                </p>
                {!state.communityUnlocked && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(state.level / COMMUNITY_UNLOCK_LEVEL) * 100}%`,
                          background: `linear-gradient(90deg, ${phaseConfig.bodyDark}, ${phaseConfig.bodyMain})`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 flex-shrink-0">{state.level}/{COMMUNITY_UNLOCK_LEVEL}</span>
                  </div>
                )}
              </div>
              {state.communityUnlocked && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${phaseConfig.particleColor}15` }}
                >
                  <ChevronRight className={`w-5 h-5 ${phaseConfig.labelColor}`} />
                </div>
              )}
            </div>
          </div>

          {/* ── Level Roadmap (compact) ─────────────────────────────────────── */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className={`w-3.5 h-3.5 ${phaseConfig.labelColor}`} />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Evolução</span>
            </div>
            <div className="flex items-center gap-0.5">
              {AVATAR_LEVELS.map((lvl) => {
                const isActive = lvl.level <= state.level;
                const isCurrent = lvl.level === state.level;
                const phaseColors: Record<string, string> = {
                  fragilizado: "#94a3b8",
                  estavel: "#34d399",
                  evoluindo: "#a78bfa",
                  forte: "#fbbf24",
                };
                return (
                  <div key={lvl.level} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-1.5 rounded-full transition-all duration-500 ${isCurrent ? "ring-1 ring-white/20" : ""}`}
                      style={{
                        background: isActive
                          ? phaseColors[lvl.phase]
                          : "rgba(255,255,255,0.04)",
                        boxShadow: isActive ? `0 0 6px ${phaseColors[lvl.phase]}40` : "none",
                      }}
                    />
                    {isCurrent && (
                      <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">{lvl.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarEspelho;
