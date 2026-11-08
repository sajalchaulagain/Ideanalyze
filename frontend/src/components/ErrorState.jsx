import { AlertCircle, RotateCw } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  message = "Something went wrong.",
  onRetry,
  retryLabel = "Try again",
  retryDisabled = false,
  className = "",
}) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-danger-ink ${className}`}
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-danger"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium leading-6">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={retryDisabled}
            className="mt-2 border-danger/30 bg-surface text-danger-ink hover:bg-surface-muted"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
