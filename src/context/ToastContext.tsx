import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (msg: string) => addToast(msg, "success"),
      error: (msg: string) => addToast(msg, "error"),
      info: (msg: string) => addToast(msg, "info"),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Portal/Container */}
      <div className="fixed top-4 right-4 left-4 md:left-auto md:top-6 md:right-6 z-[9999] flex flex-col gap-3 w-auto md:w-full md:max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 w-full rounded-xl bg-ink/95 text-white p-4 shadow-lift border border-white/10 backdrop-blur-md animate-fade-up"
            role="alert"
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && (
                <CheckCircle className="text-gold flex-shrink-0 animate-in zoom-in duration-200" size={18} />
              )}
              {toast.type === "error" && (
                <AlertCircle className="text-red-400 flex-shrink-0 animate-in zoom-in duration-200" size={18} />
              )}
              {toast.type === "info" && (
                <Info className="text-copper-light flex-shrink-0 animate-in zoom-in duration-200" size={18} />
              )}
              <span className="text-xs font-semibold tracking-wide leading-normal">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors p-0.5 rounded-full hover:bg-white/10 flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
