import { Clock3, Info, Sparkles } from "lucide-react";
import Button from "./Button";
import ErrorState from "./ErrorState";
import { formatResetTime } from "../lib/format";

const busyCodes = ["AI_RATE_LIMITED", "AI_TIMEOUT"];

export default function AIAnalysisFeedback({
  error,
  remaining,
  onRetry,
  retryCooldown = 0,
}) {
  const retryDisabled = retryCooldown > 0;
  const retryLabel = retryDisabled ? `Retry in ${retryCooldown}s` : "Retry now";

  return (
    <div className="space-y-3">
      {Number.isFinite(remaining) && remaining <= 2 && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning-ink"
          role="status"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            AI availability is low: {remaining} free request
            {remaining === 1 ? "" : "s"} left today.
          </p>
        </div>
      )}

      {error?.code === "AI_DAILY_LIMIT" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Today&apos;s free AI allowance is used up. It resets at{" "}
            <strong className="font-semibold">
              {formatResetTime(error.resetsAt)}
            </strong>
            .
          </p>
        </div>
      )}

      {busyCodes.includes(error?.code) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          <p className="flex items-start gap-2.5">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {error.code === "AI_TIMEOUT"
                ? "The AI provider took too long to respond."
                : error.message || "The AI providers are busy right now."}
            </span>
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              disabled={retryDisabled}
              onClick={onRetry}
              className="border-warning/30 bg-surface text-warning-ink hover:bg-surface-muted"
            >
              {retryLabel}
            </Button>
          )}
        </div>
      )}

      {error?.code === "AI_NOT_CONFIGURED" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-info/25 bg-info-soft px-4 py-3 text-sm text-info-ink">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            AI analysis is not configured on the server yet. You can still save
            this idea and add the analysis later.
          </p>
        </div>
      )}

      {error &&
        !busyCodes.includes(error.code) &&
        !["AI_DAILY_LIMIT", "AI_NOT_CONFIGURED"].includes(error.code) && (
          <ErrorState
            message={error.message || "AI analysis failed. Please try again."}
            onRetry={onRetry}
            retryLabel={retryDisabled ? retryLabel : "Retry analysis"}
            retryDisabled={retryDisabled}
          />
        )}
    </div>
  );
}
