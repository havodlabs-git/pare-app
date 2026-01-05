import { useState, useCallback } from 'react';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    title: string,
    description?: string,
    variant: 'success' | 'error' | 'info' = 'info'
  ) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: ToastData = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove após 5 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) => {
    return showToast(title, description, 'success');
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    return showToast(title, description, 'error');
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    return showToast(title, description, 'info');
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info
  };
};
