import { CheckCircle2 } from "lucide-react";

export default function SuccessMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3 text-success-ink ${className}`}
      role="status"
    >
      <CheckCircle2
        className="mt-0.5 h-5 w-5 shrink-0 text-success"
        aria-hidden="true"
      />
      <p className="break-words text-sm font-medium leading-6">{message}</p>
    </div>
  );
}
