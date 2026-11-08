export function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  if (elapsed < 7 * 86_400_000) return `${Math.floor(elapsed / 86_400_000)}d ago`;
  return formatDate(value);
}

export function formatResetTime(value) {
  if (!value) return "00:00 UTC";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "00:00 UTC";
  return `${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  })} UTC`;
}

export function nextUtcMidnightIso() {
  const reset = new Date();
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

export function hasAnalysis(analysis) {
  return Boolean(
    analysis &&
      (analysis.problem ||
        analysis.solution ||
        analysis.targetUsers ||
        analysis.features?.length ||
        analysis.techStack?.length ||
        analysis.challenges ||
        analysis.futureImprovements)
  );
}
