import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Zap, Crown, Sparkles, Lock } from "lucide-react";

interface PricingPlansProps {
  currentPlan?: "free" | "premium" | "elite";
  onSelectPlan?: (plan: "free" | "premium" | "elite") => void;
}

export function PricingPlans({ currentPlan = "free", onSelectPlan }: PricingPlansProps) {
  const plans = [
    {
      id: "free" as const,
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar sua jornada",
      icon: <Sparkles className="w-8 h-8" />,
      color: "from-gray-500 to-gray-600",
      features: [
        { text: "1 módulo ativo", included: true },
        { text: "Contador de dias básico", included: true },
        { text: "5 achievements", included: true },
        { text: "Estatísticas básicas", included: true },
        { text: "Acesso ao fórum", included: true },
        { text: "Módulos ilimitados", included: false },
        { text: "Análise avançada", included: false },
        { text: "Exportar relatórios", included: false },
        { text: "Suporte prioritário", included: false },
      ],
      popular: false,
    },
    {
      id: "premium" as const,
      name: "Premium",
      price: "R$ 19,90",
      period: "/mês",
      description: "Para quem quer resultados sérios",
      icon: <Zap className="w-8 h-8" />,
      color: "from-purple-500 to-pink-600",
      features: [
        { text: "Até 3 módulos ativos", included: true },
        { text: "Contador avançado", included: true },
        { text: "20+ achievements exclusivos", included: true },
        { text: "Estatísticas avançadas", included: true },
        { text: "Gráficos detalhados", included: true },
        { text: "Metas personalizadas", included: true },
        { text: "Notificações motivacionais", included: true },
        { text: "Exportar relatórios PDF", included: true },
        { text: "Suporte prioritário", included: false },
      ],
      popular: true,
    },
    {
      id: "elite" as const,
      name: "Elite",
      price: "R$ 39,90",
      period: "/mês",
      description: "Transformação completa",
      icon: <Crown className="w-8 h-8" />,
      color: "from-amber-500 to-orange-600",
      features: [
        { text: "Módulos ilimitados", included: true },
        { text: "Todos os recursos Premium", included: true },
        { text: "50+ achievements exclusivos", included: true },
        { text: "IA de análise comportamental", included: true },
        { text: "Coaching semanal por e-mail", included: true },
        { text: "Relatórios personalizados", included: true },
        { text: "Badge exclusivo Elite", included: true },
        { text: "Acesso a grupo VIP", included: true },
        { text: "Suporte prioritário 24/7", included: true },
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          Planos e Preços
        </Badge>
        <h2 className="text-4xl font-bold">
          Escolha o plano ideal para você
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Invista em você mesmo. Todos os planos incluem 7 dias de garantia.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 transition-all duration-300 ${
              plan.popular
                ? "border-2 border-purple-500 shadow-2xl scale-105"
                : "border hover:border-gray-300 hover:shadow-lg"
            } ${currentPlan === plan.id ? "ring-2 ring-green-500" : ""}`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 shadow-lg">
                  ⭐ Mais Popular
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {currentPlan === plan.id && (
              <div className="absolute -top-4 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1 shadow-lg">
                  Plano Atual
                </Badge>
              </div>
            )}

            {/* Icon */}
            <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center text-white mb-4`}>
              {plan.icon}
            </div>

            {/* Plan Name & Description */}
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              onClick={() => onSelectPlan?.(plan.id)}
              disabled={currentPlan === plan.id}
              className={`w-full h-12 ${
                plan.popular
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  : currentPlan === plan.id
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {currentPlan === plan.id
                ? "✓ Plano Ativo"
                : plan.id === "free"
                ? "Começar Grátis"
                : "Assinar Agora"}
            </Button>
          </Card>
        ))}
      </div>

      {/* FAQ / Additional Info */}
      <div className="max-w-3xl mx-auto mt-12 space-y-6">
        <h3 className="text-2xl font-bold text-center mb-6">Perguntas Frequentes</h3>
        
        <Card className="p-6">
          <h4 className="font-semibold mb-2">🔄 Posso mudar de plano depois?</h4>
          <p className="text-gray-600">
            Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor será ajustado proporcionalmente.
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">💳 Quais formas de pagamento?</h4>
          <p className="text-gray-600">
            Aceitamos cartão de crédito, PIX e boleto bancário. Pagamentos processados com total segurança.
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">🎁 Tem garantia?</h4>
          <p className="text-gray-600">
            Sim! Oferecemos 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">📊 Meus dados ficam salvos se eu cancelar?</h4>
          <p className="text-gray-600">
            Seus dados são mantidos por 90 dias após o cancelamento. Você pode reativar a qualquer momento sem perder seu progresso.
          </p>
        </Card>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
            ✓
          </div>
          <span className="text-sm">Pagamento Seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            🔒
          </div>
          <span className="text-sm">SSL Certificado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
            💯
          </div>
          <span className="text-sm">7 Dias de Garantia</span>
        </div>
      </div>
    </div>
  );
}
