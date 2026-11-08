const layouts = {
  cards: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
  lines: "space-y-3",
  analysis: "grid gap-4 md:grid-cols-2",
};

export default function LoadingState({
  message = "Loading...",
  variant = "cards",
  count = 3,
  className = "",
}) {
  const items = Array.from({ length: count }, (_, index) => index);

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <span className="sr-only">{message}</span>
      <div className={layouts[variant] || layouts.cards} aria-hidden="true">
        {items.map((item) =>
          variant === "lines" ? (
            <div
              key={item}
              className="skeleton h-3.5 rounded-full"
              style={{ width: `${[100, 88, 94, 72][item % 4]}%` }}
            />
          ) : variant === "analysis" ? (
            <div
              key={item}
              className="skeleton h-36 rounded-2xl border border-border"
            />
          ) : (
            <div
              key={item}
              className="skeleton h-40 rounded-2xl border border-border"
            />
          )
        )}
      </div>
    </div>
  );
}
