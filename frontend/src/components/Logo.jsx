import { Sparkles } from "lucide-react";

export default function Logo({
  className = "h-8 w-8",
  iconClassName = "h-4 w-4",
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      <Sparkles className={iconClassName} strokeWidth={2.2} />
    </span>
  );
}
