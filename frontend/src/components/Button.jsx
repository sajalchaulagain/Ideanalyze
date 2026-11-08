import { LoaderCircle } from "lucide-react";

const variantStyles = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-700",
  secondary:
    "border border-border bg-surface-muted text-fg hover:bg-surface-strong",
  outline:
    "border border-border-strong bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
  danger: "bg-danger text-white shadow-sm hover:bg-danger-strong",
  "danger-outline":
    "border border-danger/30 bg-danger-soft text-danger-ink hover:bg-danger-soft/80",
};

const sizeStyles = {
  sm: "min-h-9 rounded-lg px-3 text-xs",
  md: "min-h-10 rounded-xl px-4 text-sm",
  lg: "min-h-11 rounded-xl px-5 text-sm",
  icon: "h-10 w-10 rounded-xl p-0",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {loading && (
        <LoaderCircle
          className="h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
