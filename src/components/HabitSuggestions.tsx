import { useState } from "react";
import {
  Check, X, Edit2, Lightbulb, ChevronRight, Sparkles,
  Clock, Calendar, Sun, Moon, Sunset, Save,
  Dumbbell, BookOpen, Brain, Palette, Heart, Zap, Music, Leaf
} from "lucide-react";
import type { BehavioralProfile } from "./OnboardingBehavioral";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuggestedHabit {
  id: string;
  name: string;
  description: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  suggestedPeriod: string;
  sourceRule: string;
  category: string;
  accepted: boolean;
}

interface HabitSuggestionsProps {
  profile: BehavioralProfile;
  onComplete: (habits: SuggestedHabit[]) => void;
}

// ─── Motor de Sugestão Rule-Based ─────────────────────────────────────────────

const HABIT_TEMPLATES: Record<string, SuggestedHabit[]> = {
  Lutas: [
    {
      id: "lutas_treino", name: "Treino de Arte Marcial",
      description: "Prática de luta ou treino funcional para canalizar energia e desenvolver disciplina.",
      frequencyPerWeek: 3, durationMinutes: 60, suggestedPeriod: "Noite",
      sourceRule: "interesse:Lutas", category: "Exercício", accepted: true,
    },
    {
      id: "lutas_leitura", name: "Leitura sobre Disciplina Marcial",
      description: "Leitura de livros ou artigos sobre filosofia e disciplina das artes marciais.",
      frequencyPerWeek: 2, durationMinutes: 15, suggestedPeriod: "Noite",
      sourceRule: "interesse:Lutas", category: "Leitura", accepted: true,
    },
  ],
  Academia: [
    {
      id: "academia_treino", name: "Treino na Academia",
      description: "Exercício físico regular para liberar endorfinas e construir disciplina corporal.",
      frequencyPerWeek: 3, durationMinutes: 60, suggestedPeriod: "Manhã",
      sourceRule: "interesse:Academia", category: "Exercício", accepted: true,
    },
    {
      id: "academia_registro", name: "Registro de Evolução Física",
      description: "Anotar seu progresso físico semanalmente para manter motivação.",
      frequencyPerWeek: 1, durationMinutes: 10, suggestedPeriod: "Noite",
      sourceRule: "interesse:Academia", category: "Reflexão", accepted: true,
    },
  ],
  Leitura: [
    {
      id: "leitura_guiada", name: "Leitura Guiada",
      description: "Leitura diária de 15 minutos sobre autoconhecimento, disciplina ou desenvolvimento pessoal.",
      frequencyPerWeek: 5, durationMinutes: 15, suggestedPeriod: "Noite",
      sourceRule: "interesse:Leitura", category: "Leitura", accepted: true,
    },
    {
      id: "leitura_resumo", name: "Resumo Reflexivo",
      description: "Escrever 3 aprendizados do livro que está lendo para fixar o conhecimento.",
      frequencyPerWeek: 2, durationMinutes: 10, suggestedPeriod: "Noite",
      sourceRule: "interesse:Leitura", category: "Reflexão", accepted: true,
    },
  ],
  Bicicleta: [
    {
      id: "bike_passeio", name: "Passeio de Bicicleta",
      description: "Pedalar ao ar livre para aliviar o estresse e melhorar o condicionamento físico.",
      frequencyPerWeek: 3, durationMinutes: 45, suggestedPeriod: "Manhã",
      sourceRule: "interesse:Bicicleta", category: "Exercício", accepted: true,
    },
  ],
  Música: [
    {
      id: "musica_pratica", name: "Prática Musical",
      description: "Tocar instrumento ou ouvir música conscientemente como forma de relaxamento.",
      frequencyPerWeek: 3, durationMinutes: 30, suggestedPeriod: "Tarde",
      sourceRule: "interesse:Música", category: "Arte", accepted: true,
    },
  ],
  Esportes: [
    {
      id: "esporte_coletivo", name: "Esporte Coletivo",
      description: "Participar de um esporte em grupo para desenvolver conexão social e disciplina.",
      frequencyPerWeek: 2, durationMinutes: 60, suggestedPeriod: "Tarde",
      sourceRule: "interesse:Esportes", category: "Exercício", accepted: true,
    },
  ],
  Espiritualidade: [
    {
      id: "espiritualidade_meditacao", name: "Meditação Diária",
      description: "Prática de meditação ou oração para fortalecer o autocontrole e a paz interior.",
      frequencyPerWeek: 7, durationMinutes: 10, suggestedPeriod: "Manhã",
      sourceRule: "interesse:Espiritualidade", category: "Bem-estar", accepted: true,
    },
  ],
  Tecnologia: [
    {
      id: "tech_projeto", name: "Projeto Pessoal de Tecnologia",
      description: "Dedicar tempo a aprender uma nova habilidade técnica ou desenvolver um projeto.",
      frequencyPerWeek: 3, durationMinutes: 30, suggestedPeriod: "Noite",
      sourceRule: "interesse:Tecnologia", category: "Aprendizado", accepted: true,
    },
  ],
  Artes: [
    {
      id: "artes_criacao", name: "Criação Artística",
      description: "Desenho, pintura, escrita criativa ou outra forma de expressão artística.",
      frequencyPerWeek: 2, durationMinutes: 30, suggestedPeriod: "Tarde",
      sourceRule: "interesse:Artes", category: "Arte", accepted: true,
    },
  ],
};

const DIARY_HABIT: SuggestedHabit = {
  id: "diario_emocional", name: "Diário Emocional",
  description: "Escrever 5 minutos sobre como você se sentiu durante o dia, identificando gatilhos e progressos.",
  frequencyPerWeek: 7, durationMinutes: 5, suggestedPeriod: "Noite",
  sourceRule: "universal", category: "Reflexão", accepted: true,
};

export function generateHabitSuggestions(profile: BehavioralProfile): SuggestedHabit[] {
  const suggestions: SuggestedHabit[] = [];
  const seen = new Set<string>();

  for (const interest of profile.interests.slice(0, 3)) {
    const templates = HABIT_TEMPLATES[interest] || [];
    for (const t of templates) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        let freq = t.frequencyPerWeek;
        let dur = t.durationMinutes;
        if (profile.daysPerWeek <= 2) {
          freq = Math.min(freq, 2);
        } else if (profile.daysPerWeek <= 4) {
          freq = Math.min(freq, profile.daysPerWeek);
        }
        if (profile.minutesPerDay < 30) {
          dur = Math.min(dur, profile.minutesPerDay);
        }
        suggestions.push({
          ...t,
          frequencyPerWeek: freq,
          durationMinutes: dur,
          suggestedPeriod: profile.preferredPeriod || t.suggestedPeriod,
        });
      }
    }
  }

  if (!seen.has(DIARY_HABIT.id)) {
    suggestions.push({
      ...DIARY_HABIT,
      suggestedPeriod: profile.preferredPeriod || "Noite",
    });
  }

  return suggestions.slice(0, 5);
}

// ─── Configurações visuais ───────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  "Exercício":   { color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/25", icon: Dumbbell },
  "Leitura":     { color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/25", icon: BookOpen },
  "Reflexão":    { color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/25", icon: Brain },
  "Arte":        { color: "text-pink-400",   bg: "bg-pink-500/15",   border: "border-pink-500/25", icon: Palette },
  "Bem-estar":   { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/25", icon: Heart },
  "Aprendizado": { color: "text-cyan-400",   bg: "bg-cyan-500/15",   border: "border-cyan-500/25", icon: Zap },
};

const PERIOD_ICON: Record<string, any> = {
  "Manhã": Sun,
  "Tarde": Sunset,
  "Noite": Moon,
};

// ─── Componente ──────────────────────────────────────────────────────────────

export function HabitSuggestions({ profile, onComplete }: HabitSuggestionsProps) {
  const [habits, setHabits] = useState<SuggestedHabit[]>(() =>
    generateHabitSuggestions(profile)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFreq, setEditFreq] = useState(0);
  const [editDur, setEditDur] = useState(0);

  const acceptedCount = habits.filter((h) => h.accepted).length;

  const toggleAccept = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, accepted: !h.accepted } : h))
    );
  };

  const startEdit = (h: SuggestedHabit) => {
    setEditingId(h.id);
    setEditFreq(h.frequencyPerWeek);
    setEditDur(h.durationMinutes);
  };

  const saveEdit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, frequencyPerWeek: editFreq, durationMinutes: editDur } : h
      )
    );
    setEditingId(null);
  };

  const handleConfirm = () => {
    const accepted = habits.filter((h) => h.accepted);
    onComplete(accepted);
  };

  // Calcular tempo total semanal
  const totalMinutesWeek = habits
    .filter((h) => h.accepted)
    .reduce((sum, h) => sum + h.frequencyPerWeek * h.durationMinutes, 0);
  const totalHours = Math.floor(totalMinutesWeek / 60);
  const totalMins = totalMinutesWeek % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full space-y-8">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="text-center space-y-5">
          {/* Ícone com glow */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-3xl blur-xl" />
            <div className="relative w-18 h-18 bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/25 p-4">
              <Sparkles className="w-9 h-9 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Seus hábitos personalizados
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Com base no seu perfil{" "}
              <span className="text-purple-300 font-semibold">{profile.behaviorProfile}</span>,
              criamos sugestões para substituir o que te enfraquece por algo que te fortalece.
            </p>
          </div>

          {/* Badges do perfil */}
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/20 animate-[riskPulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(239,68,68,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Risco {profile.riskScore}/100
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Calendar className="w-3 h-3" />
              {profile.daysPerWeek}x/semana
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <Clock className="w-3 h-3" />
              {profile.minutesPerDay} min/dia
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {(() => { const PIcon = PERIOD_ICON[profile.preferredPeriod] || Sun; return <PIcon className="w-3 h-3" />; })()}
              {profile.preferredPeriod}
            </span>
          </div>
        </div>

        {/* ── Resumo rápido ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{acceptedCount} hábito{acceptedCount !== 1 ? "s" : ""} selecionado{acceptedCount !== 1 ? "s" : ""}</p>
              <p className="text-xs text-gray-500">de {habits.length} sugeridos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {totalHours > 0 ? `${totalHours}h ` : ""}{totalMins > 0 ? `${totalMins}min` : ""}
            </p>
            <p className="text-xs text-gray-500">por semana</p>
          </div>
        </div>

        {/* ── Lista de Hábitos ──────────────────────────────────────────── */}
        <div className="space-y-3">
          {habits.map((h, index) => {
            const catConfig = CATEGORY_CONFIG[h.category] || CATEGORY_CONFIG["Reflexão"];
            const CatIcon = catConfig.icon;
            const PeriodIcon = PERIOD_ICON[h.suggestedPeriod] || Sun;

            return (
              <div
                key={h.id}
                className={`
                  group relative rounded-2xl border backdrop-blur-sm transition-all duration-300
                  ${h.accepted
                    ? "bg-white/[0.06] border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.15]"
                    : "bg-white/[0.02] border-white/[0.05] opacity-50 hover:opacity-70"
                  }
                `}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {editingId === h.id ? (
                  /* ── Modo Edição ──────────────────────────────────────── */
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${catConfig.bg} flex items-center justify-center`}>
                        <CatIcon className={`w-4 h-4 ${catConfig.color}`} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{h.name}</p>
                        <p className="text-xs text-gray-500">Editando configurações</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Frequência / semana
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditFreq(Math.max(1, editFreq - 1))}
                            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors text-lg font-medium"
                          >
                            -
                          </button>
                          <span className="text-white font-bold text-lg w-8 text-center">{editFreq}x</span>
                          <button
                            onClick={() => setEditFreq(Math.min(7, editFreq + 1))}
                            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors text-lg font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Duração (minutos)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditDur(Math.max(5, editDur - 5))}
                            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors text-lg font-medium"
                          >
                            -
                          </button>
                          <span className="text-white font-bold text-lg w-12 text-center">{editDur}</span>
                          <button
                            onClick={() => setEditDur(Math.min(120, editDur + 5))}
                            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors text-lg font-medium"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(h.id)}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-2 border border-emerald-500/20"
                      >
                        <Save className="w-4 h-4" /> Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Modo Visualização ────────────────────────────────── */
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleAccept(h.id)}
                        className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          transition-all duration-200 border-2
                          ${h.accepted
                            ? "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400 shadow-lg shadow-emerald-500/20"
                            : "border-white/15 hover:border-white/30 bg-white/[0.03]"
                          }
                        `}
                      >
                        {h.accepted ? (
                          <Check className="w-5 h-5 text-white" strokeWidth={3} />
                        ) : (
                          <X className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-white text-[15px] leading-tight">{h.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${catConfig.bg} ${catConfig.color} border ${catConfig.border}`}>
                            <CatIcon className="w-3 h-3" />
                            {h.category}
                          </span>
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed mb-3">{h.description}</p>

                        {/* Meta-info */}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span className="font-medium text-gray-300">{h.frequencyPerWeek}x</span>/semana
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="font-medium text-gray-300">{h.durationMinutes}</span> min
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-gray-400">
                            <PeriodIcon className="w-3.5 h-3.5 text-gray-500" />
                            {h.suggestedPeriod}
                          </span>
                        </div>
                      </div>

                      {/* Botão editar */}
                      <button
                        onClick={() => startEdit(h)}
                        className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/15 transition-all flex-shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Dica ──────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-0.5">Dica</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Você pode aceitar, remover ou personalizar cada hábito. Esses hábitos formarão
              sua rotina semanal. Você poderá ajustá-los a qualquer momento.
            </p>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <button
          onClick={handleConfirm}
          disabled={acceptedCount === 0}
          className={`
            w-full py-4 rounded-2xl text-base font-bold
            flex items-center justify-center gap-2
            transition-all duration-300 shadow-xl
            ${acceptedCount > 0
              ? "bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99]"
              : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
            }
          `}
        >
          <Sparkles className="w-5 h-5" />
          Confirmar {acceptedCount} hábito{acceptedCount !== 1 ? "s" : ""} e criar minha rotina
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Espaço inferior */}
        <div className="h-4" />
      </div>
    </div>
  );
}
