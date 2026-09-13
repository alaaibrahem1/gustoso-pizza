import React from 'react';
import { CheckCircle2, Heart, Info, AlertCircle, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCart();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isInfo = toast.type === 'info';
        const isWarning = toast.type === 'warning';
        const isHeart = toast.title.includes('favorite');

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-stone-900 text-white rounded-2xl p-3.5 shadow-xl border border-stone-800 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {isHeart ? (
                <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isWarning ? (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" />
              )}
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              <h5 className="text-xs sm:text-sm font-bold leading-tight">{toast.title}</h5>
              {toast.message && (
                <p className="text-[11px] text-stone-300 mt-0.5 leading-normal">{toast.message}</p>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    dismissToast(toast.id);
                  }}
                  className="mt-1.5 text-xs font-bold text-red-400 hover:text-red-300 underline cursor-pointer"
                >
                  {toast.actionLabel} →
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-stone-400 hover:text-white shrink-0 p-1 cursor-pointer transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
