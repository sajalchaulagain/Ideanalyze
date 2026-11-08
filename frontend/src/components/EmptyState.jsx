import { Link } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  title = "Nothing here yet",
  message = "Get started by creating your first item.",
  actionLabel,
  actionTo,
  onAction,
  icon: Icon = Lightbulb,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center ${className}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft">
        <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-fg-muted">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-5">
          <Button>{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
