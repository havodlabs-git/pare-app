import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

export function SimpleToast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500 text-white border-green-600',
    error: 'bg-red-500 text-white border-red-600',
    info: 'bg-blue-500 text-white border-blue-600',
    warning: 'bg-yellow-500 text-white border-yellow-600',
  };

  return (
    <div
      className={`${colors[type]} rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[320px] max-w-md border-2 animate-in slide-in-from-right-5 duration-300`}
    >
      {icons[type]}
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition-opacity flex-shrink-0"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function SimpleToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <SimpleToast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
