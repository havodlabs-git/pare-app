import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Logo } from "./Logo";
import { Progress } from "./ui/progress";
import {
  Check, ChevronRight, ChevronLeft, Shield, User, Target,
  Zap, Heart, Lightbulb, Clock, Star, Eye, Smartphone,
  Cigarette, Wine, ShoppingCart, Utensils, Hand
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BehavioralProfile {
  // Etapa 1 – LGPD
  lgpdAccepted: boolean;
  lgpdAcceptedAt: string;

  // Etapa 2 – Identificação
  nickname: string;
  age: string;
  city: string;

  // Etapa 3 – Desafio principal
  addictions: string[];
  primaryAddiction: string;

  // Etapa 4 – Intensidade
  intensityMap: Record<string, number>;

  // Etapa 5 – Gatilhos emocionais
  triggers: string[];
  postEmotions: string[];

  // Etapa 6 – Interesses
  interests: string[];

  // Etapa 7 – Disponibilidade
  daysPerWeek: number;
  minutesPerDay: number;
  preferredPeriod: string;

  // Etapa 8 – Visão de futuro
  futureVision: string;

  // Calculados após onboarding
  behaviorProfile: string;
  riskScore: number;
}

interface OnboardingBehavioralProps {
  onComplete: (profile: BehavioralProfile, primaryModuleId: string) => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const ADDICTIONS = [
  { id: "pornography", label: "Pornografia", icon: <Eye className="w-5 h-5" /> },
  { id: "compulsive_masturbation", label: "Masturbação compulsiva", icon: <Hand className="w-5 h-5" /> },
  { id: "alcohol", label: "Álcool", icon: <Wine className="w-5 h-5" /> },
  { id: "smoking", label: "Tabagismo", icon: <Cigarette className="w-5 h-5" /> },
  { id: "social_media", label: "Redes sociais", icon: <Smartphone className="w-5 h-5" /> },
  { id: "compulsive_eating", label: "Alimentação compulsiva", icon: <Utensils className="w-5 h-5" /> },
  { id: "shopping", label: "Compras compulsivas", icon: <ShoppingCart className="w-5 h-5" /> },
];

const INTENSITY_LABELS: Record<number, string> = {
  1: "Raramente",
  2: "Algumas vezes por semana",
  3: "Diariamente",
  4: "Mais de uma vez ao dia",
  5: "Fora de controle",
};

const TRIGGERS = [
  "Quando estou estressado",
  "Quando me sinto sozinho",
  "À noite",
  "Após o trabalho",
  "Quando estou ansioso",
  "Quando estou entediado",
];

const POST_EMOTIONS = [
  "Culpa",
  "Tristeza",
  "Frustração",
  "Indiferença",
  "Vergonha",
];

const INTERESTS = [
  "Lutas",
  "Academia",
  "Bicicleta",
  "Leitura",
  "Música",
  "Esportes",
  "Espiritualidade",
  "Tecnologia",
  "Artes",
];

const MINUTES_OPTIONS = [15, 30, 45, 60];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toggle = (arr: string[], val: string): string[] =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

// ─── Componente Principal ────────────────────────────────────────────────────

export function OnboardingBehavioral({ onComplete }: OnboardingBehavioralProps) {
  const TOTAL_STEPS = 8;
  const [step, setStep] = useState(1);

  // Etapa 1
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Etapa 2
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");

  // Etapa 3
  const [addictions, setAddictions] = useState<string[]>([]);
  const [primaryAddiction, setPrimaryAddiction] = useState("");

  // Etapa 4
  const [intensityMap, setIntensityMap] = useState<Record<string, number>>({});

  // Etapa 5
  const [triggers, setTriggers] = useState<string[]>([]);
  const [postEmotions, setPostEmotions] = useState<string[]>([]);

  // Etapa 6
  const [interests, setInterests] = useState<string[]>([]);

  // Etapa 7
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [minutesPerDay, setMinutesPerDay] = useState(30);
  const [preferredPeriod, setPreferredPeriod] = useState("");

  // Etapa 8
  const [futureVision, setFutureVision] = useState("");

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  // ── Navegação ──────────────────────────────────────────────────────────────

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

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // ── Classificação de perfil ────────────────────────────────────────────────

  const classifyProfile = (): { profile: string; riskScore: number } => {
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

    // Mapear addiction para moduleId compatível com o sistema existente
    const moduleIdMap: Record<string, string> = {
      pornography: "pornography",
      compulsive_masturbation: "pornography",
      alcohol: "alcohol",
      smoking: "smoking",
      social_media: "social_media",
      compulsive_eating: "shopping",
      shopping: "shopping",
    };

    const behavioralProfile: BehavioralProfile = {
      lgpdAccepted: true,
      lgpdAcceptedAt: new Date().toISOString(),
      nickname,
      age,
      city,
      addictions,
      primaryAddiction,
      intensityMap,
      triggers,
      postEmotions,
      interests,
      daysPerWeek,
      minutesPerDay,
      preferredPeriod,
      futureVision,
      behaviorProfile: profile,
      riskScore,
    };

    const primaryModuleId = moduleIdMap[primaryAddiction] || "pornography";
    onComplete(behavioralProfile, primaryModuleId);
  };

  // ── Render de cada etapa ───────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Etapa 1: LGPD ──────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Você está prestes a iniciar uma nova fase da sua vida.</h2>
              <p className="text-gray-300 text-base leading-relaxed">
                Este é um ambiente seguro e confidencial. Para personalizarmos sua jornada,
                precisamos tratar alguns dados comportamentais.
              </p>
            </div>

            {showTerms ? (
              <Card className="p-5 bg-white/10 border-white/20 text-white max-h-64 overflow-y-auto">
                <h3 className="font-bold mb-3">Termos de Uso e Política de Privacidade</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  A plataforma <strong>Pare!</strong> coleta dados comportamentais com o objetivo exclusivo de personalizar
                  sua jornada de recuperação. Seus dados são tratados com base no legítimo interesse e no consentimento
                  explícito, conforme a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
                </p>
                <br />
                <p className="text-sm text-gray-300 leading-relaxed">
                  <strong>Dados coletados:</strong> nome, idade, cidade (opcional), hábitos comportamentais, gatilhos
                  emocionais e interesses pessoais. Esses dados são armazenados de forma criptografada e nunca são
                  compartilhados com terceiros sem seu consentimento.
                </p>
                <br />
                <p className="text-sm text-gray-300 leading-relaxed">
                  <strong>Seus direitos:</strong> Você pode solicitar a exclusão ou anonimização dos seus dados a qualquer
                  momento através das configurações da sua conta.
                </p>
                <br />
                <p className="text-sm text-gray-300 leading-relaxed">
                  Ao aceitar, você confirma que leu e concorda com estes termos.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-purple-300 hover:text-white"
                  onClick={() => setShowTerms(false)}
                >
                  Fechar
                </Button>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10"
                onClick={() => setShowTerms(true)}
              >
                Ler Termos de Uso e Política de Privacidade
              </Button>
            )}

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  lgpdAccepted
                    ? "bg-purple-500 border-purple-500"
                    : "border-white/40 group-hover:border-white/70"
                }`}
                onClick={() => setLgpdAccepted(!lgpdAccepted)}
              >
                {lgpdAccepted && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-gray-300 text-sm leading-relaxed">
                Li e aceito os Termos de Uso e Política de Privacidade
              </span>
            </label>
          </div>
        );

      // ── Etapa 2: Identificação ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Vamos nos conhecer</h2>
              <p className="text-gray-300">Essas informações personalizam sua experiência.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Como você gostaria de ser chamado aqui? *
                </label>
                <input
                  type="text"
                  placeholder="Seu apelido ou nome"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Qual sua idade? *
                </label>
                <input
                  type="number"
                  placeholder="Ex: 25"
                  min={13}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Em qual cidade você mora? <span className="text-gray-500">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>

            {nickname && (
              <p className="text-center text-purple-300 font-medium animate-pulse">
                Perfeito, {nickname}. Vamos construir algo poderoso juntos.
              </p>
            )}
          </div>
        );

      // ── Etapa 3: Desafio principal ─────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Qual hábito você deseja transformar agora?</h2>
              <p className="text-gray-300 text-sm">Pode selecionar mais de um.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ADDICTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    const updated = toggle(addictions, a.id);
                    setAddictions(updated);
                    if (!updated.includes(primaryAddiction)) setPrimaryAddiction("");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    addictions.includes(a.id)
                      ? "border-purple-400 bg-purple-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                  }`}
                >
                  <span className={addictions.includes(a.id) ? "text-purple-300" : "text-gray-400"}>
                    {a.icon}
                  </span>
                  <span className="font-medium">{a.label}</span>
                  {addictions.includes(a.id) && (
                    <Check className="w-4 h-4 text-purple-300 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {addictions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Qual deles mais impacta sua vida hoje?</p>
                <div className="grid grid-cols-1 gap-2">
                  {addictions.map((id) => {
                    const a = ADDICTIONS.find((x) => x.id === id)!;
                    return (
                      <button
                        key={id}
                        onClick={() => setPrimaryAddiction(id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                          primaryAddiction === id
                            ? "border-amber-400 bg-amber-500/20 text-white"
                            : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                        }`}
                      >
                        <span>{a.icon}</span>
                        <span className="font-medium">{a.label}</span>
                        {primaryAddiction === id && (
                          <Badge className="ml-auto bg-amber-500 text-white border-0 text-xs">Prioridade</Badge>
                        )}
                      </button>
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
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Com que frequência isso acontece?</h2>
              <p className="text-gray-300 text-sm italic">Reconhecer é o primeiro passo da evolução.</p>
            </div>

            <div className="space-y-6">
              {addictions.map((id) => {
                const a = ADDICTIONS.find((x) => x.id === id)!;
                const current = intensityMap[id] || 0;
                return (
                  <div key={id} className="space-y-3">
                    <p className="text-white font-medium flex items-center gap-2">
                      {a.icon}
                      <span>{a.label}</span>
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setIntensityMap({ ...intensityMap, [id]: n })}
                          className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                            current === n
                              ? "border-orange-400 bg-orange-500/30 text-orange-200"
                              : "border-white/20 bg-white/5 text-gray-400 hover:border-white/40"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    {current > 0 && (
                      <p className="text-xs text-gray-400 text-center">{INTENSITY_LABELS[current]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── Etapa 5: Gatilhos emocionais ───────────────────────────────────────
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Quando isso costuma acontecer?</h2>
              <p className="text-gray-300 text-sm">Selecione os gatilhos que se aplicam a você.</p>
            </div>

            <div className="space-y-2">
              {TRIGGERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTriggers(toggle(triggers, t))}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    triggers.includes(t)
                      ? "border-pink-400 bg-pink-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                  }`}
                >
                  {triggers.includes(t) && <Check className="w-4 h-4 text-pink-300 flex-shrink-0" />}
                  <span className={triggers.includes(t) ? "" : "ml-7"}>{t}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">O que você sente depois?</p>
              <div className="flex flex-wrap gap-2">
                {POST_EMOTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setPostEmotions(toggle(postEmotions, e))}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      postEmotions.includes(e)
                        ? "border-pink-400 bg-pink-500/20 text-white"
                        : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ── Etapa 6: Interesses ────────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Quais atividades fazem sentido para você?</h2>
              <p className="text-gray-300 text-sm italic">
                Vamos substituir o que te enfraquece por algo que te fortalece.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  onClick={() => setInterests(toggle(interests, i))}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    interests.includes(i)
                      ? "border-green-400 bg-green-500/20 text-white"
                      : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                  }`}
                >
                  {interests.includes(i) && "✓ "}
                  {i}
                </button>
              ))}
            </div>
          </div>
        );

      // ── Etapa 7: Disponibilidade ───────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Qual é sua disponibilidade real?</h2>
              <p className="text-gray-300 text-sm">Seja honesto — vamos criar uma rotina que você consegue cumprir.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Quantos dias por semana você consegue dedicar a novos hábitos?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDaysPerWeek(d)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all ${
                        daysPerWeek === d
                          ? "border-cyan-400 bg-cyan-500/30 text-white"
                          : "border-white/20 bg-white/5 text-gray-400 hover:border-white/40"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Quantos minutos por dia?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {MINUTES_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMinutesPerDay(m)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                        minutesPerDay === m
                          ? "border-cyan-400 bg-cyan-500/30 text-white"
                          : "border-white/20 bg-white/5 text-gray-400 hover:border-white/40"
                      }`}
                    >
                      {m === 60 ? "60+" : m} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Qual o melhor período do dia?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Manhã", "Tarde", "Noite"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPreferredPeriod(p)}
                      className={`py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                        preferredPeriod === p
                          ? "border-cyan-400 bg-cyan-500/30 text-white"
                          : "border-white/20 bg-white/5 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      {p === "Manhã" ? "🌅" : p === "Tarde" ? "☀️" : "🌙"} {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ── Etapa 8: Visão de futuro ───────────────────────────────────────────
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Se você vencer esse hábito, como sua vida estará daqui 6 meses?
              </h2>
              <p className="text-gray-300 text-sm">Escreva com detalhes. Essa é a sua versão futura.</p>
            </div>

            <textarea
              placeholder="Ex: Vou ter mais energia, foco no trabalho, me sentir orgulhoso de mim mesmo, ter relacionamentos mais saudáveis..."
              value={futureVision}
              onChange={(e) => setFutureVision(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none"
            />

            {futureVision.trim().length > 20 && (
              <p className="text-center text-amber-300 font-medium">
                Essa é a sua versão futura. Vamos construí-la a partir de hoje. 🚀
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    "Privacidade",
    "Conexão",
    "Desafio",
    "Intensidade",
    "Gatilhos",
    "Interesses",
    "Disponibilidade",
    "Visão",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              Etapa {step} de {TOTAL_STEPS} — {stepTitles[step - 1]}
            </span>
            <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i + 1 === step
                    ? "w-4 h-2 bg-purple-400"
                    : i + 1 < step
                    ? "w-2 h-2 bg-purple-600"
                    : "w-2 h-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="bg-white/5 border-white/10 p-6 backdrop-blur-sm">
          {renderStep()}
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-white/30 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
            className={`flex-1 font-semibold ${
              step === TOTAL_STEPS
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            } text-white border-0 disabled:opacity-40`}
          >
            {step === TOTAL_STEPS ? (
              <>Começar Minha Jornada <Star className="w-4 h-4 ml-1" /></>
            ) : (
              <>Continuar <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
