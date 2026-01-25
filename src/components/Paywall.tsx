import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Zap, Star, Calendar, Video, ArrowRight } from 'lucide-react';
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
}

const Paywall: React.FC<PaywallProps> = ({ onClose, trialDaysRemaining = 0, isTrialExpired = false }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    
    setSelectedPlan(planId);
    setProcessing(true);

    try {
      // Create subscription
      const response = await api.post('/subscriptions/create', {
        planId,
        billingCycle,
        paymentToken: 'pending_google_pay'
      });

      if (response.data.success) {
        // Redirect to Google Pay or payment flow
        // For now, show a message
        alert('Redirecionando para o pagamento...');
        // TODO: Integrate actual Google Pay
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Erro ao processar assinatura. Tente novamente.');
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {isTrialExpired ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-2">
                  <X className="w-4 h-4" />
                  Período de teste expirado
                </div>
              ) : trialDaysRemaining > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  {trialDaysRemaining} dias restantes no teste
                </div>
              ) : null}
              <h2 className="text-2xl font-bold text-gray-900">Escolha o plano ideal para você</h2>
              <p className="text-gray-600 mt-1">Invista em você mesmo e transforme seus hábitos.</p>
            </div>
            {onClose && !isTrialExpired && (
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            )}
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Economize ~17%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all ${
                plan.id === 'premium'
                  ? 'border-indigo-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.id === 'premium' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full">
                  Mais Popular
                </div>
              )}

              <div className="p-6">
                {/* Plan Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPlanColor(plan.id)} text-white flex items-center justify-center mb-4`}>
                  {getPlanIcon(plan.id)}
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{plan.description}</p>

                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {billingCycle === 'yearly' ? plan.priceYearlyFormatted : plan.priceMonthlyFormatted}
                    </span>
                    <span className="text-gray-500 text-sm">
                      /{billingCycle === 'yearly' ? 'ano' : 'mês'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyDiscount > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      Economia de {plan.yearlyDiscount}%
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={`lim-${index}`} className="flex items-start gap-2 opacity-50">
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>

                {/* Elite Special Feature */}
                {plan.id === 'elite' && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Video className="w-5 h-5" />
                      <span className="font-medium text-sm">Sessões com Psicólogos via Zoom</span>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.id === 'free' || processing}
                  className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.id === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.id === 'premium'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {processing && selectedPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : plan.id === 'free' ? (
                    'Plano Atual'
                  ) : (
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

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Pagamento seguro via Google Pay. Cancele a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
