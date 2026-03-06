import { useState } from "react";
import { X, Plus, Clock, Calendar, Users, Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { type ScheduledHabit } from "./WeeklyRoutineSetup";

interface CustomHabitModalProps {
  onClose: () => void;
  onSave: (habit: ScheduledHabit & { isCustom: true; sharedWithCommunity: boolean }) => void;
}

const CATEGORIES = [
  { id: "saude", label: "Saúde", emoji: "💪" },
  { id: "mental", label: "Mental", emoji: "🧠" },
  { id: "social", label: "Social", emoji: "🤝" },
  { id: "produtividade", label: "Produtividade", emoji: "⚡" },
  { id: "criatividade", label: "Criatividade", emoji: "🎨" },
  { id: "espiritual", label: "Espiritual", emoji: "🌟" },
  { id: "financeiro", label: "Financeiro", emoji: "💰" },
  { id: "geral", label: "Geral", emoji: "📌" },
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];

export function CustomHabitModal({ onClose, onSave }: CustomHabitModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("geral");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Seg-Sex por padrão
  const [timeSlot, setTimeSlot] = useState("08:00");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [sharedWithCommunity, setSharedWithCommunity] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("O nome do hábito é obrigatório.");
      return;
    }
    if (daysOfWeek.length === 0) {
      setError("Selecione pelo menos um dia da semana.");
      return;
    }
    const habit: ScheduledHabit & { isCustom: true; sharedWithCommunity: boolean } = {
      habitId: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      habitName: name.trim(),
      category,
      daysOfWeek,
      timeSlot,
      durationMinutes,
      isCustom: true,
      sharedWithCommunity,
    };
    onSave(habit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Novo Hábito Personalizado</h2>
              <p className="text-sm text-gray-500">Adicionado à temporada atual</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do hábito <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ex: Meditação matinal, Leitura, Exercício..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              maxLength={60}
            />
            <div className="flex justify-between mt-1">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-xs text-gray-400 ml-auto">{name.length}/60</p>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    category === cat.id
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dias da semana */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dias da semana <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    daysOfWeek.includes(idx)
                      ? "bg-violet-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Horário e duração */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário
              </label>
              <input
                type="time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duração
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d < 60 ? `${d} min` : `${d / 60}h`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Partilhar com comunidade */}
          <div
            onClick={() => setSharedWithCommunity((v) => !v)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              sharedWithCommunity
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              sharedWithCommunity ? "bg-emerald-100" : "bg-gray-100"
            }`}>
              {sharedWithCommunity ? (
                <Users className="w-5 h-5 text-emerald-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${sharedWithCommunity ? "text-emerald-700" : "text-gray-700"}`}>
                {sharedWithCommunity ? "Partilhado com a comunidade" : "Apenas para mim"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {sharedWithCommunity
                  ? "Outros utilizadores podem ver e inspirar-se neste hábito"
                  : "Este hábito é privado e só você o vê"}
              </p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              sharedWithCommunity ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
            }`}>
              {sharedWithCommunity && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Hábito
          </Button>
        </div>
      </div>
    </div>
  );
}
