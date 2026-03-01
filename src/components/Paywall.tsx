import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Zap, Star, Calendar, Video, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../services/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  priceMonthlyFormatted: string;
  priceYearlyFormatted: string;
  yearlyDiscount: number;
  features: string[];
  limitations: string[];
}

interface PaywallProps {
  onClose?: () => void;
  trialDaysRemaining?: number;
  isTrialExpired?: boolean;
  autoRedirectPlan?: string | null;
  autoRedirectBillingCycle?: 'monthly' | 'yearly';
}

// Stripe Payment Links (Produção - Live Mode)
const STRIPE_PAYMENT_LINKS = {
  premium_monthly: 'https://buy.stripe.com/8x2eVdelWbcl0Pm6yPeAg00',
  premium_yearly: 'https://buy.stripe.com/9B6aEX5Pq0xH1Tqf5leAg01',
  elite_monthly: 'https://buy.stripe.com/cNidR9b9K1BLapWcXdeAg02',
  elite_yearly: 'https://buy.stripe.com/7sY8wP0v6a8h9lS6yPeAg03',
};

const Paywall: React.FC<PaywallProps> = ({ 
  onClose, 
  trialDaysRemaining = 0, 
  isTrialExpired = false,
  autoRedirectPlan = null,
  autoRedirectBillingCycle = 'monthly'
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(autoRedirectBillingCycle);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  // Auto-redirect para Stripe se um plano foi passado
  useEffect(() => {
    if (autoRedirectPlan && !loading) {
      redirectToStripe(autoRedirectPlan, autoRedirectBillingCycle);
    }
  }, [autoRedirectPlan, loading, autoRedirectBillingCycle]);

  const loadPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      // Fallback plans if API fails
      setPlans([
        {
          id: 'free',
          name: 'Gratuito',
          description: 'Perfeito para começar',
          priceMonthly: 0,
          priceYearly: 0,
          priceMonthlyFormatted: 'R$ 0',
          priceYearlyFormatted: 'R$ 0',
          yearlyDiscount: 0,
          features: ['1 módulo ativo', 'Contador básico', '5 achievements', 'Acesso ao fórum'],
          limitations: ['Módulos ilimitados', 'Análise avançada', 'Sessões com psicólogos'],
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Para resultados sérios',
          priceMonthly: 19.90,
          priceYearly: 199.00,
          priceMonthlyFormatted: 'R$ 19,90',
          priceYearlyFormatted: 'R$ 199,00',
          yearlyDiscount: 17,
          features: ['Até 3 módulos', 'Contador avançado', '20+ achievements', 'Estatísticas avançadas', 'Gráficos detalhados', 'Metas personalizadas', 'Notificações motivacionais'],
          limitations: ['Sessões com psicólogos'],
        },
        {
          id: 'elite',
          name: 'Elite',
          description: 'Transformação completa',
          priceMonthly: 99.90,
          priceYearly: 999.00,
          priceMonthlyFormatted: 'R$ 99,90',
          priceYearlyFormatted: 'R$ 999,00',
          yearlyDiscount: 17,
          features: ['Módulos ilimitados', 'Todos os recursos Premium', '50+ achievements', 'IA de análise', 'Badge exclusivo', 'Grupo VIP', 'Suporte 24/7', 'Sessões com psicólogos'],
          limitations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const redirectToStripe = async (planId: string, cycle: 'monthly' | 'yearly') => {
    const paymentKey = `${planId}_${cycle}` as keyof typeof STRIPE_PAYMENT_LINKS;
    const stripeLink = STRIPE_PAYMENT_LINKS[paymentKey];
    
    if (!stripeLink) {
      console.error('Link de pagamento não encontrado para:', paymentKey);
      return;
    }

    // Registrar tentativa de assinatura
    try {
      await api.post('/subscriptions/create', {
        planId,
        billingCycle: cycle,
        paymentMethod: 'stripe',
        status: 'pending'
      });
    } catch (error) {
      console.log('Subscription tracking error:', error);
    }

    // Redirecionar para o Stripe
    window.location.href = stripeLink;
  };

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') return;
    redirectToStripe(planId, billingCycle);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Star className="w-8 h-8" />;
      case 'premium': return <Zap className="w-8 h-8" />;
      case 'elite': return <Crown className="w-8 h-8" />;
      default: return <Star className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'from-gray-400 to-gray-500';
      case 'premium': return 'from-indigo-500 to-purple-600';
      case 'elite': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Se está redirecionando automaticamente, mostrar loading
  if (loading || autoRedirectPlan) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para pagamento seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Escolha seu plano</h2>
            <p className="text-gray-600">Invista na sua transformação</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Trial Banner */}
        {(trialDaysRemaining > 0 || isTrialExpired) && (
          <div className={`mx-6 mt-6 p-4 rounded-xl ${isTrialExpired ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3">
              <Calendar className={`w-6 h-6 ${isTrialExpired ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                {isTrialExpired ? (
                  <p className="font-semibold text-red-700">Seu período de teste expirou</p>
                ) : (
                  <p className="font-semibold text-amber-700">{trialDaysRemaining} dias restantes no trial</p>
                )}
                <p className="text-sm text-gray-600">
                  {isTrialExpired 
                    ? 'Assine agora para continuar usando todos os recursos' 
                    : 'Aproveite para experimentar todos os recursos premium'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center p-6">
          <div className="bg-gray-100 p-1 rounded-full flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white shadow-sm font-semibold' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
                billingCycle === 'yearly' 
                  ? 'bg-white shadow-sm font-semibold' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 p-6 pt-0">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all ${
                plan.id === 'elite' 
                  ? 'border-amber-400 shadow-xl scale-105' 
                  : plan.id === 'premium'
                  ? 'border-indigo-400 shadow-lg'
                  : 'border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.id === 'elite' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlanColor(plan.id)} flex items-center justify-center text-white mb-4`}>
                  {getPlanIcon(plan.id)}
                </div>
                
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {billingCycle === 'yearly' ? plan.priceYearlyFormatted : plan.priceMonthlyFormatted}
                    </span>
                    <span className="text-gray-500">/{billingCycle === 'yearly' ? 'ano' : 'mês'}</span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      Economia de {plan.yearlyDiscount}%
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-400">
                      <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.id === 'free'}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.id === 'elite'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {plan.id === 'free' ? 'Plano Atual' : (
                    <>
                      Assinar Agora
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Elite Benefits */}
        <div className="mx-6 mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800">Sessões com Psicólogos - Exclusivo Elite</h4>
              <p className="text-amber-700 text-sm mt-1">
                Agende sessões de acompanhamento com psicólogos especializados em dependências comportamentais. 
                Receba orientação profissional personalizada para sua jornada de recuperação.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 text-center text-sm text-gray-500">
          <p>🔒 Pagamento 100% seguro via Stripe. Cancele quando quiser.</p>
          <p className="mt-2">
            Ao assinar, você concorda com nossos{' '}
            <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
