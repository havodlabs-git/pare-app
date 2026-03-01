import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Logo } from "./Logo";
import {
  Check, ChevronRight, ChevronLeft, Shield, User, Target,
  Zap, Heart, Lightbulb, Clock, Star, Eye, Smartphone,
  Cigarette, Wine, ShoppingCart, Utensils, Hand, Lock,
  ArrowRight, Sparkles
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BehavioralProfile {
  lgpdAccepted: boolean;
  lgpdAcceptedAt: string;
  nickname: string;
  age: string;
  city: string;
  addictions: string[];
  primaryAddiction: string;
  intensityMap: Record<string, number>;
  triggers: string[];
  postEmotions: string[];
  interests: string[];
  daysPerWeek: number;
  minutesPerDay: number;
  preferredPeriod: string;
  futureVision: string;
  behaviorProfile: string;
  riskScore: number;
}

interface OnboardingBehavioralProps {
  onComplete: (profile: BehavioralProfile, primaryModuleId: string) => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const ADDICTIONS = [
  { id: "pornography",            label: "Pornografia",             icon: Eye,          emoji: "🔞" },
  { id: "compulsive_masturbation",label: "Masturbação compulsiva",  icon: Hand,         emoji: "🚫" },
  { id: "alcohol",                label: "Álcool",                  icon: Wine,         emoji: "🍷" },
  { id: "smoking",                label: "Tabagismo",               icon: Cigarette,    emoji: "🚬" },
  { id: "social_media",           label: "Redes sociais",           icon: Smartphone,   emoji: "📱" },
  { id: "compulsive_eating",      label: "Alimentação compulsiva",  icon: Utensils,     emoji: "🍔" },
  { id: "shopping",               label: "Compras compulsivas",     icon: ShoppingCart, emoji: "🛒" },
];

const INTENSITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Raramente",                color: "text-emerald-400" },
  2: { label: "Algumas vezes por semana", color: "text-yellow-400"  },
  3: { label: "Diariamente",              color: "text-orange-400"  },
  4: { label: "Mais de uma vez ao dia",   color: "text-red-400"     },
  5: { label: "Fora de controle",         color: "text-red-500"     },
};

const TRIGGERS = [
  { label: "Quando estou estressado",  emoji: "😤" },
  { label: "Quando me sinto sozinho",  emoji: "😔" },
  { label: "À noite",                  emoji: "🌙" },
  { label: "Após o trabalho",          emoji: "💼" },
  { label: "Quando estou ansioso",     emoji: "😰" },
  { label: "Quando estou entediado",   emoji: "😑" },
];

const POST_EMOTIONS = [
  { label: "Culpa",       emoji: "😞" },
  { label: "Tristeza",    emoji: "😢" },
  { label: "Frustração",  emoji: "😤" },
  { label: "Indiferença", emoji: "😶" },
  { label: "Vergonha",    emoji: "🫣" },
];

const INTERESTS = [
  { label: "Lutas",          emoji: "🥊" },
  { label: "Academia",       emoji: "💪" },
  { label: "Bicicleta",      emoji: "🚴" },
  { label: "Leitura",        emoji: "📚" },
  { label: "Música",         emoji: "🎵" },
  { label: "Esportes",       emoji: "⚽" },
  { label: "Espiritualidade",emoji: "🧘" },
  { label: "Tecnologia",     emoji: "💻" },
  { label: "Artes",          emoji: "🎨" },
];

const STEP_CONFIG = [
  { title: "Privacidade",     subtitle: "Seus dados são protegidos",          icon: Shield,    gradient: "from-violet-600 to-purple-700"  },
  { title: "Conexão",         subtitle: "Vamos nos conhecer",                 icon: User,      gradient: "from-blue-600 to-cyan-600"       },
  { title: "Desafio",         subtitle: "O que você quer transformar",        icon: Target,    gradient: "from-rose-600 to-pink-600"       },
  { title: "Intensidade",     subtitle: "Com que frequência acontece",        icon: Zap,       gradient: "from-orange-500 to-red-600"      },
  { title: "Gatilhos",        subtitle: "Quando isso costuma acontecer",      icon: Heart,     gradient: "from-pink-600 to-rose-600"       },
  { title: "Interesses",      subtitle: "O que te fortalece",                 icon: Lightbulb, gradient: "from-emerald-600 to-teal-600"    },
  { title: "Disponibilidade", subtitle: "Sua rotina real",                    icon: Clock,     gradient: "from-cyan-600 to-blue-600"       },
  { title: "Visão de Futuro", subtitle: "Como será sua vida em 6 meses",      icon: Star,      gradient: "from-amber-500 to-orange-600"    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toggle = (arr: string[], val: string): string[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function SelectChip({
  selected,
  onClick,
  children,
  color = "purple",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    purple:  "border-purple-500 bg-purple-500/20 text-white shadow-purple-500/20",
    pink:    "border-pink-500 bg-pink-500/20 text-white shadow-pink-500/20",
    amber:   "border-amber-500 bg-amber-500/20 text-white shadow-amber-500/20",
    emerald: "border-emerald-500 bg-emerald-500/20 text-white shadow-emerald-500/20",
    cyan:    "border-cyan-500 bg-cyan-500/20 text-white shadow-cyan-500/20",
    rose:    "border-rose-500 bg-rose-500/20 text-white shadow-rose-500/20",
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 w-full group ${
        selected
          ? `${colors[color]} shadow-lg`
          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:bg-white/10 hover:text-gray-200"
      }`}
    >
      {children}
      {selected && (
        <span className="ml-auto flex-shrink-0">
          <Check className="w-4 h-4 text-current" />
        </span>
      )}
    </button>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────

export function OnboardingBehavioral({ onComplete }: OnboardingBehavioralProps) {
  const TOTAL_STEPS = 8;
  const [step, setStep] = useState(1);

  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [addictions, setAddictions] = useState<string[]>([]);
  const [primaryAddiction, setPrimaryAddiction] = useState("");
  const [intensityMap, setIntensityMap] = useState<Record<string, number>>({});
  const [triggers, setTriggers] = useState<string[]>([]);
  const [postEmotions, setPostEmotions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minutesPerDay, setMinutesPerDay] = useState(30);
  const [preferredPeriod, setPreferredPeriod] = useState("");
  const [futureVision, setFutureVision] = useState("");

  const progress = ((step - 1) / TOTAL_STEPS) * 100;
  const cfg = STEP_CONFIG[step - 1];
  const StepIcon = cfg.icon;

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return lgpdAccepted;
      case 2: return nickname.trim().length > 0 && age.trim().length > 0;
      case 3: return addictions.length > 0 && primaryAddiction !== "";
      case 4: return addictions.every((a) => intensityMap[a] !== undefined);
      case 5: return triggers.length > 0;
      case 6: return interests.length > 0;
      case 7: return preferredPeriod !== "";
      case 8: return futureVision.trim().length > 0;
      default: return true;
    }
  };

  const handleNext = () => step < TOTAL_STEPS ? setStep((s) => s + 1) : handleComplete();
  const handleBack = () => step > 1 && setStep((s) => s - 1);

  const classifyProfile = () => {
    const primaryIntensity = intensityMap[primaryAddiction] || 1;
    let riskScore = primaryIntensity * 20;
    if (triggers.some((t) => t.toLowerCase().includes("ansios"))) riskScore += 10;
    if (triggers.some((t) => t.toLowerCase().includes("noite"))) riskScore += 5;
    if (addictions.length > 1) riskScore += 15;
    riskScore = Math.min(100, riskScore);

    let profile = "Moderado Consciente";
    if (primaryIntensity >= 4 && triggers.some((t) => t.toLowerCase().includes("ansios"))) {
      profile = "Compensador de Estresse";
    } else if (triggers.some((t) => t.toLowerCase().includes("noite"))) {
      profile = "Noturno Automático";
    } else if (primaryIntensity === 5) {
      profile = "Alto Grau de Dependência";
    } else if (triggers.some((t) => t.toLowerCase().includes("sozinho"))) {
      profile = "Impulsivo Emocional";
    }
    return { profile, riskScore };
  };

  const handleComplete = () => {
    const { profile, riskScore } = classifyProfile();
    const moduleIdMap: Record<string, string> = {
      pornography: "pornography", compulsive_masturbation: "pornography",
      alcohol: "alcohol", smoking: "smoking", social_media: "social_media",
      compulsive_eating: "shopping", shopping: "shopping",
    };
    const behavioralProfile: BehavioralProfile = {
      lgpdAccepted: true, lgpdAcceptedAt: new Date().toISOString(),
      nickname, age, city, addictions, primaryAddiction, intensityMap,
      triggers, postEmotions, interests, daysPerWeek, minutesPerDay,
      preferredPeriod, futureVision, behaviorProfile: profile, riskScore,
    };
    onComplete(behavioralProfile, moduleIdMap[primaryAddiction] || "pornography");
  };

  // ── Render de cada etapa ───────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      // ── Etapa 1: LGPD ─────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Este é um ambiente <span className="text-white font-semibold">seguro e confidencial</span>. Para
                personalizarmos sua jornada, precisamos tratar alguns dados comportamentais com base na{" "}
                <span className="text-purple-300 font-medium">LGPD (Lei nº 13.709/2018)</span>.
              </p>

              <div className="grid grid-cols-3 gap-2 py-2">
                {[
                  { icon: "🔒", text: "Dados criptografados" },
                  { icon: "🚫", text: "Sem venda de dados" },
                  { icon: "✏️", text: "Exclusão a qualquer momento" },
                ].map((item) => (
                  <div key={item.text} className="flex flex-col items-center gap-1.5 bg-white/5 rounded-2xl p-3 text-center border border-white/10">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs text-gray-400 leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de ver termos */}
            {!showTerms ? (
              <button
                onClick={() => setShowTerms(true)}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">Ler Termos de Uso e Política de Privacidade</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
              </button>
            ) : (
              <div className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" /> Termos de Uso e Privacidade
                  </span>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
                  >
                    Fechar
                  </button>
                </div>
                <div className="p-4 max-h-48 overflow-y-auto space-y-3 text-xs text-gray-400 leading-relaxed">
                  <p>A plataforma <strong className="text-gray-200">Pare!</strong> coleta dados comportamentais com o objetivo exclusivo de personalizar sua jornada de recuperação. Seus dados são tratados com base no legítimo interesse e no consentimento explícito, conforme a LGPD.</p>
                  <p><strong className="text-gray-200">Dados coletados:</strong> nome, idade, cidade (opcional), hábitos comportamentais, gatilhos emocionais e interesses pessoais. Esses dados são armazenados de forma criptografada e nunca são compartilhados com terceiros sem seu consentimento.</p>
                  <p><strong className="text-gray-200">Seus direitos:</strong> Você pode solicitar a exclusão ou anonimização dos seus dados a qualquer momento através das configurações da sua conta.</p>
                </div>
              </div>
            )}

            {/* Checkbox de aceite */}
            <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-2xl hover:bg-white/5 transition-colors">
              <div
                onClick={() => setLgpdAccepted(!lgpdAccepted)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                  lgpdAccepted
                    ? "bg-purple-500 border-purple-500 shadow-lg shadow-purple-500/30"
                    : "border-white/30 group-hover:border-white/50"
                }`}
              >
                {lgpdAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <span className="text-sm text-gray-300 leading-relaxed">
                Li e aceito os{" "}
                <span className="text-purple-300 font-medium">Termos de Uso e Política de Privacidade</span>
              </span>
            </label>
          </div>
        );

      // ── Etapa 2: Identificação ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Como você quer ser chamado? *
                </label>
                <input
                  type="text"
                  placeholder="Seu apelido ou nome"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    Idade *
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 25"
                    min={13}
                    max={99}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    Cidade <span className="text-gray-600 normal-case">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {nickname.trim().length > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <p className="text-sm text-blue-300 font-medium">
                  Perfeito, {nickname}. Vamos construir algo poderoso juntos.
                </p>
              </div>
            )}
          </div>
        );

      // ── Etapa 3: Desafio ───────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Selecione um ou mais</p>
            <div className="space-y-2">
              {ADDICTIONS.map((a) => {
                const selected = addictions.includes(a.id);
                return (
                  <SelectChip
                    key={a.id}
                    selected={selected}
                    color="rose"
                    onClick={() => {
                      const updated = toggle(addictions, a.id);
                      setAddictions(updated);
                      if (!updated.includes(primaryAddiction)) setPrimaryAddiction("");
                    }}
                  >
                    <span className="text-lg leading-none">{a.emoji}</span>
                    <span className="font-medium text-sm">{a.label}</span>
                  </SelectChip>
                );
              })}
            </div>

            {addictions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  ⭐ Qual impacta mais sua vida hoje?
                </p>
                <div className="space-y-2">
                  {addictions.map((id) => {
                    const a = ADDICTIONS.find((x) => x.id === id)!;
                    return (
                      <SelectChip
                        key={id}
                        selected={primaryAddiction === id}
                        color="amber"
                        onClick={() => setPrimaryAddiction(id)}
                      >
                        <span className="text-lg leading-none">{a.emoji}</span>
                        <span className="font-medium text-sm">{a.label}</span>
                        {primaryAddiction === id && (
                          <Badge className="ml-auto bg-amber-500/80 text-white border-0 text-xs px-2">
                            Prioridade
                          </Badge>
                        )}
                      </SelectChip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      // ── Etapa 4: Intensidade ───────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            {addictions.map((id) => {
              const a = ADDICTIONS.find((x) => x.id === id)!;
              const current = intensityMap[id] || 0;
              return (
                <div key={id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{a.emoji}</span>
                    <span className="text-sm font-semibold text-white">{a.label}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setIntensityMap({ ...intensityMap, [id]: n })}
                        className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 ${
                          current === n
                            ? n <= 2
                              ? "border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-lg shadow-emerald-500/20"
                              : n === 3
                              ? "border-orange-400 bg-orange-500/25 text-orange-200 shadow-lg shadow-orange-500/20"
                              : "border-red-400 bg-red-500/25 text-red-200 shadow-lg shadow-red-500/20"
                            : "border-white/10 bg-white/5 text-gray-500 hover:border-white/25 hover:text-gray-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {current > 0 && (
                    <p className={`text-xs font-medium ${INTENSITY_LABELS[current].color}`}>
                      {INTENSITY_LABELS[current].label}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );

      // ── Etapa 5: Gatilhos ──────────────────────────────────────────────────
      case 5:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Quando acontece?</p>
              <div className="space-y-2">
                {TRIGGERS.map((t) => (
                  <SelectChip
                    key={t.label}
                    selected={triggers.includes(t.label)}
                    color="pink"
                    onClick={() => setTriggers(toggle(triggers, t.label))}
                  >
                    <span className="text-lg leading-none">{t.emoji}</span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </SelectChip>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">O que sente depois?</p>
              <div className="flex flex-wrap gap-2">
                {POST_EMOTIONS.map((e) => (
                  <button
                    key={e.label}
                    onClick={() => setPostEmotions(toggle(postEmotions, e.label))}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      postEmotions.includes(e.label)
                        ? "border-pink-500 bg-pink-500/20 text-white shadow-lg shadow-pink-500/20"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-gray-200"
                    }`}
                  >
                    <span>{e.emoji}</span> {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ── Etapa 6: Interesses ────────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              Selecione pelo menos um
            </p>
            <div className="grid grid-cols-3 gap-2">
              {INTERESTS.map((i) => {
                const selected = interests.includes(i.label);
                return (
                  <button
                    key={i.label}
                    onClick={() => setInterests(toggle(interests, i.label))}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all duration-200 ${
                      selected
                        ? "border-emerald-500 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{i.emoji}</span>
                    <span className="text-xs font-medium text-center leading-tight">{i.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        );

      // ── Etapa 7: Disponibilidade ───────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Dias por semana
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDaysPerWeek(d)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                      daysPerWeek === d
                        ? "border-cyan-400 bg-cyan-500/25 text-white shadow-lg shadow-cyan-500/20"
                        : "border-white/10 bg-white/5 text-gray-500 hover:border-white/25 hover:text-gray-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Minutos por dia
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMinutesPerDay(m)}
                    className={`py-3 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                      minutesPerDay === m
                        ? "border-cyan-400 bg-cyan-500/25 text-white shadow-lg shadow-cyan-500/20"
                        : "border-white/10 bg-white/5 text-gray-500 hover:border-white/25 hover:text-gray-300"
                    }`}
                  >
                    {m === 60 ? "60+" : m}
                    <span className="text-xs font-normal ml-0.5">min</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Melhor período do dia
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Manhã", emoji: "🌅" },
                  { label: "Tarde", emoji: "☀️" },
                  { label: "Noite", emoji: "🌙" },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPreferredPeriod(p.label)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200 ${
                      preferredPeriod === p.label
                        ? "border-cyan-400 bg-cyan-500/25 text-white shadow-lg shadow-cyan-500/20"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/25 hover:text-gray-200"
                    }`}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ── Etapa 8: Visão de futuro ───────────────────────────────────────────
      case 8:
        return (
          <div className="space-y-5">
            <p className="text-gray-300 text-sm leading-relaxed">
              Escreva com detalhes. Essa frase se tornará sua âncora nos momentos difíceis.
            </p>
            <textarea
              placeholder="Ex: Vou ter mais energia, foco no trabalho, me sentir orgulhoso de mim mesmo, ter relacionamentos mais saudáveis..."
              value={futureVision}
              onChange={(e) => setFutureVision(e.target.value)}
              rows={6}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all text-sm resize-none leading-relaxed"
            />
            {futureVision.trim().length > 20 && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300 font-medium leading-relaxed">
                  Essa é a sua versão futura. Vamos construí-la a partir de hoje. 🚀
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ── Layout Principal ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-700/15 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Progress Header */}
        <div className="mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg`}>
                <StepIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">{cfg.title}</p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{cfg.subtitle}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {step}<span className="text-gray-700">/{TOTAL_STEPS}</span>
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? "w-5 h-1.5 bg-white"
                    : i + 1 < step
                    ? "w-1.5 h-1.5 bg-white/40"
                    : "w-1.5 h-1.5 bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card principal */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl">
          {/* Título da etapa */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white leading-snug">
              {step === 1 && "Você está prestes a iniciar uma nova fase da sua vida."}
              {step === 2 && `Olá! Como você quer ser chamado?`}
              {step === 3 && "Qual hábito você deseja transformar agora?"}
              {step === 4 && "Com que frequência isso acontece?"}
              {step === 5 && "Quando isso costuma acontecer?"}
              {step === 6 && "Quais atividades fazem sentido para você?"}
              {step === 7 && "Qual é sua disponibilidade real?"}
              {step === 8 && "Como sua vida estará daqui 6 meses?"}
            </h2>
            {step === 4 && (
              <p className="text-xs text-gray-500 mt-1 italic">Reconhecer é o primeiro passo da evolução.</p>
            )}
            {step === 6 && (
              <p className="text-xs text-gray-500 mt-1">Vamos substituir o que te enfraquece por algo que te fortalece.</p>
            )}
            {step === 7 && (
              <p className="text-xs text-gray-500 mt-1">Seja honesto — vamos criar uma rotina que você consegue cumprir.</p>
            )}
          </div>

          {renderStep()}
        </div>

        {/* Navegação */}
        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="h-14 px-5 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`flex-1 h-14 rounded-2xl font-semibold text-base transition-all duration-200 border-0 ${
              canAdvance()
                ? step === TOTAL_STEPS
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-xl shadow-amber-500/30"
                  : `bg-gradient-to-r ${cfg.gradient} hover:opacity-90 text-white shadow-xl shadow-purple-500/20`
                : "bg-white/10 text-gray-600 cursor-not-allowed"
            }`}
          >
            {step === TOTAL_STEPS ? (
              <span className="flex items-center gap-2">
                Começar Minha Jornada <Sparkles className="w-5 h-5" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
