import { useState, useEffect, useMemo, useRef } from "react";
import {
  Heart, Zap, Lock, Unlock,
  ChevronRight, Flame, Eye, Info
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
    bgGlow: "bg-slate-500/10",
    borderColor: "border-slate-600/30",
    particleColor: "#94a3b8",
    label: "Fragilizado",
    labelColor: "text-slate-400",
    bodyMain: "#7c8da4",
    bodyLight: "#a0b1c5",
    bodyDark: "#4a5568",
    eyeColor: "#2d3748",
    pupilColor: "#1a202c",
    cheekColor: "transparent",
    mouthColor: "#4a5568",
    aura: false,
    bgScene: "#1a1e2e",
  },
  estavel: {
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    bgGlow: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    particleColor: "#34d399",
    label: "Estável",
    labelColor: "text-emerald-400",
    bodyMain: "#34d399",
    bodyLight: "#6ee7b7",
    bodyDark: "#059669",
    eyeColor: "#065f46",
    pupilColor: "#022c22",
    cheekColor: "rgba(251,191,36,0.35)",
    mouthColor: "#065f46",
    aura: false,
    bgScene: "#0f2922",
  },
  evoluindo: {
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    bgGlow: "bg-violet-500/15",
    borderColor: "border-violet-500/25",
    particleColor: "#a78bfa",
    label: "Evoluindo",
    labelColor: "text-violet-400",
    bodyMain: "#a78bfa",
    bodyLight: "#c4b5fd",
    bodyDark: "#7c3aed",
    eyeColor: "#4c1d95",
    pupilColor: "#2e1065",
    cheekColor: "rgba(251,146,60,0.3)",
    mouthColor: "#4c1d95",
    aura: true,
    bgScene: "#1a1033",
  },
  forte: {
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    bgGlow: "bg-amber-500/15",
    borderColor: "border-amber-500/25",
    particleColor: "#fbbf24",
    label: "Forte",
    labelColor: "text-amber-400",
    bodyMain: "#fbbf24",
    bodyLight: "#fde68a",
    bodyDark: "#d97706",
    eyeColor: "#78350f",
    pupilColor: "#451a03",
    cheekColor: "rgba(239,68,68,0.25)",
    mouthColor: "#78350f",
    aura: true,
    bgScene: "#2a1a0a",
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

// ─── CSS Animations (injected once) ──────────────────────────────────────────

const ANIM_STYLE_ID = "avatar-espelho-anims";

function injectAnimations() {
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = ANIM_STYLE_ID;
  style.textContent = `
    /* Breathing — gentle body scale */
    @keyframes av-breathe {
      0%, 100% { transform: scaleY(1) translateY(0); }
      50% { transform: scaleY(1.035) translateY(-0.8px); }
    }
    .av-breathe { animation: av-breathe 3.2s ease-in-out infinite; transform-origin: center bottom; }

    /* Idle floating — subtle up/down */
    @keyframes av-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .av-float { animation: av-float 4s ease-in-out infinite; }

    /* Eye blink */
    @keyframes av-blink {
      0%, 42%, 44%, 100% { transform: scaleY(1); }
      43% { transform: scaleY(0.08); }
    }
    .av-blink { animation: av-blink 4.5s ease-in-out infinite; transform-origin: center; }
    .av-blink-delay { animation: av-blink 4.5s ease-in-out infinite 0.6s; transform-origin: center; }

    /* Ear wiggle */
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

    /* Tail wag */
    @keyframes av-tail {
      0%, 100% { transform: rotate(-15deg); }
      25% { transform: rotate(10deg); }
      50% { transform: rotate(-10deg); }
      75% { transform: rotate(8deg); }
    }
    .av-tail { animation: av-tail 2s ease-in-out infinite; transform-origin: 20% 80%; }

    /* Happy bounce */
    @keyframes av-hop {
      0%, 100% { transform: translateY(0) scaleY(1); }
      15% { transform: translateY(0) scaleY(0.92); }
      30% { transform: translateY(-8px) scaleY(1.05); }
      50% { transform: translateY(0) scaleY(0.95); }
      65% { transform: translateY(-4px) scaleY(1.02); }
      80% { transform: translateY(0) scaleY(0.98); }
    }
    .av-hop { animation: av-hop 3s ease-in-out infinite; transform-origin: center bottom; }

    /* Sad droop */
    @keyframes av-droop {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(2px) rotate(-1.5deg); }
    }
    .av-droop { animation: av-droop 4s ease-in-out infinite; transform-origin: center bottom; }

    /* Aura pulse */
    @keyframes av-aura {
      0%, 100% { opacity: 0.12; transform: scale(1); }
      50% { opacity: 0.25; transform: scale(1.06); }
    }
    .av-aura { animation: av-aura 3s ease-in-out infinite; transform-origin: center; }

    /* Sparkle twinkle */
    @keyframes av-sparkle {
      0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
      20% { opacity: 1; transform: scale(1) rotate(30deg); }
      80% { opacity: 1; transform: scale(1) rotate(150deg); }
    }
    .av-sparkle-1 { animation: av-sparkle 2.5s ease-in-out infinite; }
    .av-sparkle-2 { animation: av-sparkle 2.5s ease-in-out infinite 0.8s; }
    .av-sparkle-3 { animation: av-sparkle 2.5s ease-in-out infinite 1.6s; }

    /* Crown glow */
    @keyframes av-crown {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.3)); }
      50% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.7)); }
    }
    .av-crown { animation: av-crown 2.5s ease-in-out infinite; }

    /* Shadow breathing sync */
    @keyframes av-shadow {
      0%, 100% { rx: 20; opacity: 0.12; }
      50% { rx: 22; opacity: 0.08; }
    }
    .av-shadow { animation: av-shadow 3.2s ease-in-out infinite; }

    /* Cheek blush pulse */
    @keyframes av-blush {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
    .av-blush { animation: av-blush 3s ease-in-out infinite; }

    /* Heart float (radiante) */
    @keyframes av-heart-float {
      0% { opacity: 0; transform: translateY(0) scale(0.5); }
      30% { opacity: 1; transform: translateY(-6px) scale(1); }
      100% { opacity: 0; transform: translateY(-18px) scale(0.6); }
    }
    .av-heart-1 { animation: av-heart-float 3s ease-out infinite; }
    .av-heart-2 { animation: av-heart-float 3s ease-out infinite 1s; }
    .av-heart-3 { animation: av-heart-float 3s ease-out infinite 2s; }

    /* Tear drop (triste) */
    @keyframes av-tear {
      0%, 60% { opacity: 0; transform: translateY(0); }
      65% { opacity: 0.7; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(10px); }
    }
    .av-tear { animation: av-tear 5s ease-in infinite; }
    .av-tear-delay { animation: av-tear 5s ease-in infinite 2.5s; }

    /* XP bar shimmer */
    @keyframes av-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .av-shimmer::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
      animation: av-shimmer 2.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// ─── SVG Tamagotchi ──────────────────────────────────────────────────────────

function TamagotchiSVG({ state, phase }: { state: AvatarState; phase: PhaseConfig }) {
  const uid = useRef(`av-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => { injectAnimations(); }, []);

  const scale = 0.82 + (state.level / 13) * 0.38;

  // Body animation class
  const bodyAnim =
    state.mood === "radiante" ? "av-hop" :
    state.mood === "feliz" ? "av-float" :
    state.mood === "triste" ? "av-droop" :
    "av-breathe";

  // Mouth paths
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

      {/* Aura glow for advanced phases */}
      {phase.aura && (
        <ellipse cx="60" cy="62" rx="52" ry="48" fill={`url(#${uid}-aura)`} className="av-aura" />
      )}

      {/* Ground shadow */}
      <ellipse cx="60" cy="108" rx={20 * scale} ry="3.5" fill="black" className="av-shadow" />

      {/* Main body group with animation */}
      <g className={bodyAnim}>
        <g transform={`translate(60,62) scale(${scale}) translate(-60,-62)`}>

          {/* Tail */}
          <path
            d="M84,72 Q96,65 92,55 Q90,50 86,52"
            stroke={phase.bodyDark}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
            className="av-tail"
          />

          {/* Left ear */}
          <g className="av-ear-l">
            <ellipse cx="36" cy="28" rx="10" ry="14" fill={phase.bodyMain} />
            <ellipse cx="36" cy="28" rx="6" ry="10" fill={phase.bodyLight} opacity="0.5" />
          </g>

          {/* Right ear */}
          <g className="av-ear-r">
            <ellipse cx="84" cy="28" rx="10" ry="14" fill={phase.bodyMain} />
            <ellipse cx="84" cy="28" rx="6" ry="10" fill={phase.bodyLight} opacity="0.5" />
          </g>

          {/* Body */}
          <ellipse cx="60" cy="60" rx="30" ry="33" fill={`url(#${uid}-body)`} />
          <ellipse cx="60" cy="60" rx="30" ry="33" fill={`url(#${uid}-shine)`} />

          {/* Belly spot */}
          <ellipse cx="60" cy="68" rx="16" ry="14" fill={`url(#${uid}-belly)`} />

          {/* Feet */}
          <ellipse cx="45" cy="90" rx="9" ry="5" fill={phase.bodyDark} />
          <ellipse cx="75" cy="90" rx="9" ry="5" fill={phase.bodyDark} />
          {/* Foot highlights */}
          <ellipse cx="44" cy="89" rx="5" ry="2.5" fill={phase.bodyMain} opacity="0.4" />
          <ellipse cx="74" cy="89" rx="5" ry="2.5" fill={phase.bodyMain} opacity="0.4" />

          {/* Arms / paws */}
          <ellipse cx="33" cy="65" rx="6" ry="8" fill={phase.bodyMain} transform="rotate(15,33,65)" />
          <ellipse cx="87" cy="65" rx="6" ry="8" fill={phase.bodyMain} transform="rotate(-15,87,65)" />

          {/* ── Face ── */}

          {/* Eyes with blink */}
          {state.mood === "radiante" ? (
            <>
              {/* Happy closed eyes — arcs */}
              <g className="av-blink">
                <path d="M47,44 Q51,38 55,44" stroke={phase.eyeColor} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              </g>
              <g className="av-blink-delay">
                <path d="M65,44 Q69,38 73,44" stroke={phase.eyeColor} strokeWidth="2.8" fill="none" strokeLinecap="round" />
              </g>
            </>
          ) : state.mood === "triste" ? (
            <>
              {/* Sad droopy eyes */}
              <g className="av-blink">
                <ellipse cx="51" cy="46" rx="5" ry="5.5" fill={phase.eyeColor} />
                <circle cx="49.5" cy="44.5" r="2" fill="white" opacity="0.7" />
                {/* Sad brow */}
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
              {/* Normal / happy eyes */}
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

          {/* Cheeks */}
          {phase.cheekColor !== "transparent" && (
            <>
              <ellipse cx="40" cy="54" rx="6" ry="3.5" fill={phase.cheekColor} className="av-blush" />
              <ellipse cx="80" cy="54" rx="6" ry="3.5" fill={phase.cheekColor} className="av-blush" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="60" cy="50" rx="2.5" ry="2" fill={phase.eyeColor} opacity="0.6" />

          {/* Mouth */}
          <path
            d={mouths[state.mood]}
            stroke={phase.mouthColor}
            strokeWidth="2.2"
            fill={state.mood === "radiante" ? phase.mouthColor : "none"}
            fillOpacity={state.mood === "radiante" ? 0.15 : 0}
            strokeLinecap="round"
          />

          {/* Tears (sad) */}
          {state.mood === "triste" && (
            <>
              <ellipse cx="46" cy="52" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.6" className="av-tear" />
              <ellipse cx="74" cy="52" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.6" className="av-tear-delay" />
            </>
          )}

          {/* Hearts floating (radiante) */}
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

          {/* Crown (forte) */}
          {state.phase === "forte" && (
            <g transform="translate(60,14)" className="av-crown">
              <polygon
                points="0,-10 -3,-4 -12,0 -8,0 -5,4 5,4 8,0 12,0 3,-4"
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              <circle cx="-6" cy="-1" r="2" fill="#ef4444" />
              <circle cx="0" cy="-6" r="2" fill="#3b82f6" />
              <circle cx="6" cy="-1" r="2" fill="#10b981" />
            </g>
          )}

          {/* Sparkles (evoluindo) */}
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

  return (
    <div className="w-full">
      <div className={`relative rounded-3xl overflow-hidden border ${phaseConfig.borderColor} ${phaseConfig.bgGlow}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${phaseConfig.gradient} opacity-10`} />

        <div className="relative p-5 sm:p-6">
          {/* Header */}
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

          {showInfo && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 leading-relaxed">
              Seu avatar reflete seu comportamento real. Faça hábitos para evoluir, evite recaídas para manter a energia.
              Ao atingir o <strong className={phaseConfig.labelColor}>Nível {COMMUNITY_UNLOCK_LEVEL}</strong>, a porta da comunidade será desbloqueada.
            </div>
          )}

          {/* Avatar + Stats */}
          <div className="flex gap-5 items-center">
            {/* Avatar container */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-36 h-36 sm:w-40 sm:h-40 rounded-2xl p-0.5`}
                style={{ background: `linear-gradient(135deg, ${phaseConfig.bodyLight}, ${phaseConfig.bodyDark})` }}
              >
                <div
                  className="w-full h-full rounded-[14px] flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: phaseConfig.bgScene }}
                >
                  <TamagotchiSVG state={state} phase={phaseConfig} />
                </div>
              </div>
              {/* Level badge */}
              <div
                className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-900 transition-transform duration-300 ${animateLevel ? "scale-125" : "scale-100"}`}
                style={{ background: `linear-gradient(135deg, ${phaseConfig.bodyLight}, ${phaseConfig.bodyDark})` }}
              >
                <span className="text-white font-extrabold text-sm">{state.level}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nível {state.level}</p>
                <p className="text-lg font-extrabold text-white leading-tight">{currentLevelData.name}</p>
              </div>

              {/* XP bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500 font-medium">{state.totalPoints} pts</span>
                  {nextLevelData && (
                    <span className="text-[11px] text-gray-500 font-medium">{nextLevelData.minPts} pts</span>
                  )}
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out relative av-shimmer"
                    style={{
                      width: `${Math.min(100, progressToNext)}%`,
                      background: `linear-gradient(90deg, ${phaseConfig.bodyDark}, ${phaseConfig.bodyMain}, ${phaseConfig.bodyLight})`,
                    }}
                  />
                </div>
                {nextLevelData && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    Faltam <strong className={phaseConfig.labelColor}>{nextLevelData.minPts - state.totalPoints}</strong> pts para {nextLevelData.name}
                  </p>
                )}
              </div>

              {/* Mini stats — no emojis */}
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
                  <p className="text-xs font-bold text-white">{MOOD_LABELS[state.mood]}</p>
                  <p className="text-[9px] text-gray-500">Humor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Gate */}
          <div className="mt-5">
            <div
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                state.communityUnlocked
                  ? "bg-amber-500/10 border-amber-500/20 cursor-pointer hover:bg-amber-500/15"
                  : "bg-white/[0.02] border-white/[0.06] opacity-60"
              }`}
              onClick={state.communityUnlocked ? onOpenForum : undefined}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                state.communityUnlocked
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 border border-white/10"
              }`}>
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
              {state.communityUnlocked ? (
                <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-500">{state.level}/{COMMUNITY_UNLOCK_LEVEL}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 7-day timeline */}
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
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Hábito feito
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Recaída
              </span>
              <span className="flex items-center gap-1 text-[9px] text-gray-500">
                <span className="w-2 h-2 rounded-full bg-gray-700 inline-block" /> Sem registro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarEspelho;
