'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const value: ToastContextType = {
    toast: addToast,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    warning: (msg: string) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Container de Toasts Flutuantes */}
      <div
        aria-live="polite"
        className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              t.type === 'success'
                ? 'border-emerald-500/40 bg-zinc-950/90 text-emerald-300 shadow-emerald-950/50'
                : t.type === 'error'
                ? 'border-red-500/40 bg-zinc-950/90 text-red-300 shadow-red-950/50'
                : t.type === 'warning'
                ? 'border-amber-500/40 bg-zinc-950/90 text-amber-300 shadow-amber-950/50'
                : 'border-cyan-500/40 bg-zinc-950/90 text-cyan-300 shadow-cyan-950/50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
              {t.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {t.type === 'info' && <Info className="h-4 w-4 text-cyan-400" />}
            </div>

            <p className="flex-1 text-xs font-semibold leading-relaxed text-zinc-100">
              {t.message}
            </p>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
              aria-label="Fechar notificação"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback gracioso caso chamado fora do provider
    return {
      toast: (msg) => console.log('[Toast]', msg),
      success: (msg) => console.log('[Toast Success]', msg),
      error: (msg) => console.error('[Toast Error]', msg),
      info: (msg) => console.info('[Toast Info]', msg),
      warning: (msg) => console.warn('[Toast Warning]', msg),
    };
  }
  return context;
}
