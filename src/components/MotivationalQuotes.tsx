import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Quote } from "lucide-react";

const FALLBACK_QUOTES = [
  "A disciplina é a ponte entre objetivos e realizações.",
  "Cada dia sem ceder é uma vitória que ninguém pode tirar de você.",
  "Você é mais forte do que seus impulsos.",
  "O desconforto temporário leva à força permanente.",
  "Sua mente é poderosa. Quando você a preenche com pensamentos positivos, sua vida começará a mudar.",
  "Não é sobre perfeição, é sobre progresso.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Você não precisa ser grande para começar, mas precisa começar para ser grande.",
  "A mudança acontece quando a dor de permanecer o mesmo é maior que a dor da mudança.",
  "Cada recomeço é uma nova oportunidade de fazer melhor.",
  "Sua jornada importa mais do que o destino.",
  "Força não vem do que você pode fazer. Vem de superar as coisas que você pensou que não poderia.",
];

const API_BASE = (import.meta as any).env?.VITE_API_URL || "https://pare-app-backend-1073430306643.southamerica-east1.run.app/api";

export function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState<{ text: string; author?: string } | null>(null);

  useEffect(() => {
    const pickRandom = (list: string[]) => {
      const idx = Math.floor(Math.random() * list.length);
      return { text: list[idx] };
    };

    fetch(`${API_BASE}/admin/public/motivational-quotes`)
      .then((res) => res.json())
      .then((data) => {
        const quotes: Array<{ text: string; author?: string }> = data?.data?.quotes || [];
        if (quotes.length > 0) {
          const idx = Math.floor(Math.random() * quotes.length);
          setCurrentQuote(quotes[idx]);
        } else {
          setCurrentQuote(pickRandom(FALLBACK_QUOTES));
        }
      })
      .catch(() => {
        setCurrentQuote(pickRandom(FALLBACK_QUOTES));
      });
  }, []);

  if (!currentQuote) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex gap-4">
        <Quote className="w-8 h-8 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-lg italic text-gray-700 mb-1">{currentQuote.text}</p>
          {currentQuote.author && (
            <p className="text-sm text-amber-600 font-medium mb-1">— {currentQuote.author}</p>
          )}
          <p className="text-sm text-gray-500">Mensagem motivacional do dia</p>
        </div>
      </div>
    </Card>
  );
}
