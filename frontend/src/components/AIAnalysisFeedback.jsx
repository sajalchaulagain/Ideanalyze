import Button from "./Button";
import ErrorState from "./ErrorState";

function formatResetTime(resetsAt) {
  if (!resetsAt) return "00:00 UTC";
  const date = new Date(resetsAt);
  return Number.isNaN(date.getTime())
    ? "00:00 UTC"
    : `${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

export default function AIAnalysisFeedback({ error, remaining, onRetry, retryCooldown = 0 }) {
  return (
    <>
      {Number.isFinite(remaining) && remaining <= 2 && (
        <p className="mb-3 text-xs text-text-lo dark:text-text-mid" role="status">
          AI availability is low: {remaining} free request{remaining === 1 ? "" : "s"} remaining today.
        </p>
      )}

      {error?.code === "AI_RATE_LIMITED" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn-500 bg-warn-500/20 px-4 py-3 text-sm text-warn-500">
          <span>The AI providers are busy. Retrying in a momentÃ¢â‚¬Â¦</span>
          <Button variant="outline" size="sm" disabled={retryCooldown > 0} onClick={onRetry}>
            {retryCooldown > 0 ? `Retry in ${retryCooldown}s` : "Retry now"}
          </Button>
        </div>
      )}

      {error?.code === "AI_DAILY_LIMIT" && (
        <div className="mb-4 rounded-xl border border-danger-500 bg-danger-500 px-4 py-3 text-sm text-danger-500 dark:border-danger-500/60 dark:bg-danger-500/30 dark:text-danger-500">
          Today&apos;s free AI allowance is used up. Resets at {formatResetTime(error.resetsAt)}.
        </div>
      )}

      {error && !["AI_RATE_LIMITED", "AI_DAILY_LIMIT"].includes(error.code) && (
        <div className="mb-4"><ErrorState message={error.message} /></div>
      )}
    </>
  );
}
