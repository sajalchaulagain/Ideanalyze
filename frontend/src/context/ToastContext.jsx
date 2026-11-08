import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    className: "border-success/30 text-success-ink",
    iconClassName: "text-success",
  },
  error: {
    icon: AlertCircle,
    className: "border-danger/30 text-danger-ink",
    iconClassName: "text-danger",
  },
  info: {
    icon: Info,
    className: "border-info/30 text-info-ink",
    iconClassName: "text-info",
  },
};

function ToastItem({ toast, onDismiss }) {
  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-pop ${style.className}`}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`}
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      if (!message) return null;
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-2), { id, message, type }]);
      const timer = window.setTimeout(() => dismiss(id), 4500);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-full sm:max-w-sm"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
