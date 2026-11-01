import { Link } from "react-router-dom";
import Button from "./Button";

export default function EmptyState({
  title = "Nothing here yet",
  message = "Get started by creating your first item.",
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white px-6 py-14 text-center transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60">
        <svg className="h-7 w-7 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12.5V6.8A1.8 1.8 0 0018.2 5H5.8A1.8 1.8 0 004 6.8v10.4a1.8 1.8 0 001.8 1.8h12.4a1.8 1.8 0 001.8-1.8V12.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{message}</p>
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
