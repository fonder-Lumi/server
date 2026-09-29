import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
            default:
              return <Info className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl glass-dropdown text-sm shadow-2xl transition-all duration-200 border border-white/10 animate-in fade-in slide-in-from-bottom-2"
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-neutral-100 text-xs tracking-tight">{toast.title}</div>
              {toast.message && (
                <div className="text-neutral-400 text-xs mt-0.5 leading-relaxed break-words">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors p-0.5 -mr-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
