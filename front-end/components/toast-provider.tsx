'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message, description };
    
    setToasts((prev) => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const success = useCallback((message: string, description?: string) => {
    showToast('success', message, description);
  }, [showToast]);

  const error = useCallback((message: string, description?: string) => {
    showToast('error', message, description);
  }, [showToast]);

  const warning = useCallback((message: string, description?: string) => {
    showToast('warning', message, description);
  }, [showToast]);

  const info = useCallback((message: string, description?: string) => {
    showToast('info', message, description);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-600',
    error: 'bg-red-500/10 border-red-500/30 text-red-600',
    warning: 'bg-orange-500/10 border-orange-500/30 text-orange-600',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-orange-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={`
        ${colors[toast.type]}
        min-w-[320px] max-w-md
        border rounded-lg shadow-lg
        p-4 backdrop-blur-sm
        pointer-events-auto
        animate-slide-in-right
        [&.closing]:animate-slide-out-right
      `}
    >
      <div className="flex items-start gap-3">
        <div className={iconColors[toast.type]}>{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{toast.message}</p>
          {toast.description && (
            <p className="text-xs text-muted-foreground mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
