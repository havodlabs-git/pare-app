import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, Heart, Shield } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationProps extends ToastMessage {
  onClose: (id: string) => void;
}

// ─── Configurações visuais por tipo ─────────────────────────────────────────

const notificationConfig = {
  success: {
    icon: CheckCircle2,
    accentIcon: Sparkles,
    title: 'Sucesso!',
    bgGradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-800',
    textColor: 'text-emerald-700',
    progressColor: 'bg-emerald-400',
    glowColor: 'shadow-emerald-200/50',
  },
  error: {
    icon: AlertCircle,
    accentIcon: Shield,
    title: 'Atenção',
    bgGradient: 'from-red-500 to-rose-600',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    progressColor: 'bg-red-400',
    glowColor: 'shadow-red-200/50',
  },
  info: {
    icon: Info,
    accentIcon: Heart,
    title: 'Informação',
    bgGradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    borderColor: 'border-violet-200',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    titleColor: 'text-violet-800',
    textColor: 'text-violet-700',
    progressColor: 'bg-violet-400',
    glowColor: 'shadow-violet-200/50',
  },
  warning: {
    icon: AlertTriangle,
    accentIcon: Shield,
    title: 'Aviso',
    bgGradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
    progressColor: 'bg-amber-400',
    glowColor: 'shadow-amber-200/50',
  },
};

// ─── Componente de Notificação Individual ───────────────────────────────────

function StyledNotification({ id, message, type, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = notificationConfig[type];
  const Icon = config.icon;
  const AccentIcon = config.accentIcon;

  const DURATION = 5000;

  useEffect(() => {
    // Animação de entrada
    requestAnimationFrame(() => setIsVisible(true));

    // Barra de progresso
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-fechar
    const timer = setTimeout(() => {
      handleClose();
    }, DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl ${config.glowColor}
        min-w-[340px] max-w-[420px]
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : isLeaving
            ? 'translate-x-8 opacity-0 scale-95'
            : 'translate-x-12 opacity-0 scale-95'
        }
      `}
    >
      {/* Fundo principal */}
      <div className={`${config.bgLight} ${config.borderColor} border backdrop-blur-sm rounded-2xl`}>
        {/* Barra decorativa superior com gradiente */}
        <div className={`h-1 bg-gradient-to-r ${config.bgGradient} rounded-t-2xl`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Ícone principal com fundo */}
            <div className={`${config.iconBg} rounded-xl p-2.5 flex-shrink-0 relative`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} strokeWidth={2.5} />
              {/* Mini ícone decorativo */}
              <AccentIcon
                className={`w-3 h-3 ${config.iconColor} opacity-50 absolute -top-1 -right-1`}
                strokeWidth={2}
              />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className={`text-xs font-bold uppercase tracking-wider ${config.titleColor} mb-0.5`}>
                {config.title}
              </p>
              <p className={`text-sm font-medium ${config.textColor} leading-relaxed`}>
                {message}
              </p>
            </div>

            {/* Botão fechar */}
            <button
              onClick={handleClose}
              className={`
                ${config.iconBg} rounded-lg p-1.5 flex-shrink-0
                hover:opacity-70 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-1 ${config.borderColor}
              `}
              aria-label="Fechar"
            >
              <X className={`w-3.5 h-3.5 ${config.iconColor}`} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Barra de progresso inferior */}
        <div className="h-1 bg-black/5 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full ${config.progressColor} opacity-60 rounded-b-2xl transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Container ──────────────────────────────────────────────────────────────

interface ContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function StyledNotificationContainer({ toasts, onClose }: ContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <StyledNotification key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

export default StyledNotification;
