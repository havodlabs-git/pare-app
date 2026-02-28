import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Edit2, Lightbulb, ChevronRight, Sparkles } from "lucide-react";
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
      id: "lutas_treino",
      name: "Treino de Arte Marcial",
      description: "Prática de luta ou treino funcional para canalizar energia e desenvolver disciplina.",
      frequencyPerWeek: 3,
      durationMinutes: 60,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Lutas",
      category: "Exercício",
      accepted: true,
    },
    {
      id: "lutas_leitura",
      name: "Leitura sobre Disciplina Marcial",
      description: "Leitura de livros ou artigos sobre filosofia e disciplina das artes marciais.",
      frequencyPerWeek: 2,
      durationMinutes: 15,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Lutas",
      category: "Leitura",
      accepted: true,
    },
  ],
  Academia: [
    {
      id: "academia_treino",
      name: "Treino na Academia",
      description: "Exercício físico regular para liberar endorfinas e construir disciplina corporal.",
      frequencyPerWeek: 3,
      durationMinutes: 60,
      suggestedPeriod: "Manhã",
      sourceRule: "interesse:Academia",
      category: "Exercício",
      accepted: true,
    },
    {
      id: "academia_registro",
      name: "Registro de Evolução Física",
      description: "Anotar seu progresso físico semanalmente para manter motivação.",
      frequencyPerWeek: 1,
      durationMinutes: 10,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Academia",
      category: "Reflexão",
      accepted: true,
    },
  ],
  Leitura: [
    {
      id: "leitura_guiada",
      name: "Leitura Guiada",
      description: "Leitura diária de 15 minutos sobre autoconhecimento, disciplina ou desenvolvimento pessoal.",
      frequencyPerWeek: 5,
      durationMinutes: 15,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Leitura",
      category: "Leitura",
      accepted: true,
    },
    {
      id: "leitura_resumo",
      name: "Resumo Reflexivo",
      description: "Escrever 3 aprendizados do livro que está lendo para fixar o conhecimento.",
      frequencyPerWeek: 2,
      durationMinutes: 10,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Leitura",
      category: "Reflexão",
      accepted: true,
    },
  ],
  Bicicleta: [
    {
      id: "bike_passeio",
      name: "Passeio de Bicicleta",
      description: "Pedalar ao ar livre para aliviar o estresse e melhorar o condicionamento físico.",
      frequencyPerWeek: 3,
      durationMinutes: 45,
      suggestedPeriod: "Manhã",
      sourceRule: "interesse:Bicicleta",
      category: "Exercício",
      accepted: true,
    },
  ],
  Música: [
    {
      id: "musica_pratica",
      name: "Prática Musical",
      description: "Tocar instrumento ou ouvir música conscientemente como forma de relaxamento.",
      frequencyPerWeek: 3,
      durationMinutes: 30,
      suggestedPeriod: "Tarde",
      sourceRule: "interesse:Música",
      category: "Arte",
      accepted: true,
    },
  ],
  Esportes: [
    {
      id: "esporte_coletivo",
      name: "Esporte Coletivo",
      description: "Participar de um esporte em grupo para desenvolver conexão social e disciplina.",
      frequencyPerWeek: 2,
      durationMinutes: 60,
      suggestedPeriod: "Tarde",
      sourceRule: "interesse:Esportes",
      category: "Exercício",
      accepted: true,
    },
  ],
  Espiritualidade: [
    {
      id: "espiritualidade_meditacao",
      name: "Meditação Diária",
      description: "Prática de meditação ou oração para fortalecer o autocontrole e a paz interior.",
      frequencyPerWeek: 7,
      durationMinutes: 10,
      suggestedPeriod: "Manhã",
      sourceRule: "interesse:Espiritualidade",
      category: "Bem-estar",
      accepted: true,
    },
  ],
  Tecnologia: [
    {
      id: "tech_projeto",
      name: "Projeto Pessoal de Tecnologia",
      description: "Dedicar tempo a aprender uma nova habilidade técnica ou desenvolver um projeto.",
      frequencyPerWeek: 3,
      durationMinutes: 30,
      suggestedPeriod: "Noite",
      sourceRule: "interesse:Tecnologia",
      category: "Aprendizado",
      accepted: true,
    },
  ],
  Artes: [
    {
      id: "artes_criacao",
      name: "Criação Artística",
      description: "Desenho, pintura, escrita criativa ou outra forma de expressão artística.",
      frequencyPerWeek: 2,
      durationMinutes: 30,
      suggestedPeriod: "Tarde",
      sourceRule: "interesse:Artes",
      category: "Arte",
      accepted: true,
    },
  ],
};

// Hábito universal de diário emocional
const DIARY_HABIT: SuggestedHabit = {
  id: "diario_emocional",
  name: "Diário Emocional",
  description: "Escrever 5 minutos sobre como você se sentiu durante o dia, identificando gatilhos e progressos.",
  frequencyPerWeek: 7,
  durationMinutes: 5,
  suggestedPeriod: "Noite",
  sourceRule: "universal",
  category: "Reflexão",
  accepted: true,
};

export function generateHabitSuggestions(profile: BehavioralProfile): SuggestedHabit[] {
  const suggestions: SuggestedHabit[] = [];
  const seen = new Set<string>();

  // Adicionar hábitos baseados nos interesses
  for (const interest of profile.interests.slice(0, 3)) {
    const templates = HABIT_TEMPLATES[interest] || [];
    for (const t of templates) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        // Ajustar por disponibilidade
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

  // Sempre adicionar o diário emocional (especialmente para perfis de risco alto)
  if (!seen.has(DIARY_HABIT.id)) {
    suggestions.push({
      ...DIARY_HABIT,
      suggestedPeriod: profile.preferredPeriod || "Noite",
    });
  }

  // Limitar a 5 sugestões
  return suggestions.slice(0, 5);
}

// ─── Componente ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Exercício: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Leitura: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Reflexão: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Arte: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Bem-estar": "bg-green-500/20 text-green-300 border-green-500/30",
  Aprendizado: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Seus hábitos personalizados</h1>
          <p className="text-gray-300">
            Com base no seu perfil <strong className="text-purple-300">{profile.behaviorProfile}</strong>,
            criamos sugestões para substituir o que te enfraquece por algo que te fortalece.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 border">
              Risco: {profile.riskScore}/100
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 border">
              {profile.daysPerWeek}x/semana • {profile.minutesPerDay} min/dia
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 border">
              {profile.preferredPeriod}
            </Badge>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((h) => (
            <Card
              key={h.id}
              className={`p-4 border transition-all ${
                h.accepted
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 border-white/10 opacity-50"
              }`}
            >
              {editingId === h.id ? (
                <div className="space-y-3">
                  <p className="text-white font-semibold">{h.name}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Frequência/semana</label>
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={editFreq}
                        onChange={(e) => setEditFreq(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Duração (min)</label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        step={5}
                        value={editDur}
                        onChange={(e) => setEditDur(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveEdit(h.id)}
                    className="bg-green-600 hover:bg-green-700 text-white border-0"
                  >
                    <Check className="w-4 h-4 mr-1" /> Salvar
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleAccept(h.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                      h.accepted
                        ? "bg-green-500 border-green-500"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    {h.accepted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white">{h.name}</h3>
                      <Badge
                        className={`text-xs border flex-shrink-0 ${
                          CATEGORY_COLORS[h.category] || "bg-gray-500/20 text-gray-300"
                        }`}
                      >
                        {h.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{h.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>📅 {h.frequencyPerWeek}x/semana</span>
                      <span>⏱ {h.durationMinutes} min</span>
                      <span>
                        {h.suggestedPeriod === "Manhã"
                          ? "🌅"
                          : h.suggestedPeriod === "Tarde"
                          ? "☀️"
                          : "🌙"}{" "}
                        {h.suggestedPeriod}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => startEdit(h)}
                    className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="bg-white/5 border-white/10 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Você pode aceitar, remover ou personalizar cada hábito. Esses hábitos formarão
              sua rotina semanal. Você poderá ajustá-los a qualquer momento.
            </p>
          </div>
        </Card>

        {/* CTA */}
        <Button
          onClick={handleConfirm}
          disabled={acceptedCount === 0}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 disabled:opacity-40"
        >
          Confirmar {acceptedCount} hábito{acceptedCount !== 1 ? "s" : ""} e criar minha rotina
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
