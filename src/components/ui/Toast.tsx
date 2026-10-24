import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinanceStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-300 transform translate-y-0"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
          {(!toast.type || toast.type === 'info') && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {toast.description}
              </p>
            )}
          </div>

          {toast.undoAction && (
            <button
              onClick={() => {
                toast.undoAction?.();
                removeToast(toast.id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          )}

          <button
            onClick={() => removeToast(toast.id)}
            title="Dismiss notification"
            aria-label="Dismiss notification"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Dismiss notification</span>
          </button>
        </div>
      ))}
    </div>
  );
};
