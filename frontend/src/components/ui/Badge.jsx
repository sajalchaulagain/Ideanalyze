const tones = {
  accent: "bg-accent-soft text-accent",
  neutral: "bg-surface-muted text-fg-muted",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger-ink",
  info: "bg-info-soft text-info-ink",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[tone] || tones.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
