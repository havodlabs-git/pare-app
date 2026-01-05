import React, { useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info'
}) => {
  const variantStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      className={`${variantStyles[variant]} text-white rounded-lg shadow-lg p-4 border-2 flex items-start gap-3 min-w-[300px] max-w-[450px]`}
    >
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
        {icons[variant]}
      </div>
      <div className="flex-1">
        <ToastPrimitive.Title className="font-semibold text-sm mb-1">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="text-sm opacity-90">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="flex-shrink-0 text-white/80 hover:text-white">
        ✕
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = () => (
  <ToastPrimitive.Viewport className="fixed top-4 right-4 flex flex-col gap-2 w-[390px] max-w-[100vw] z-[100]" />
);
