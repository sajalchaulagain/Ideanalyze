import Button from "./Button";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-danger-500 bg-danger-500 px-4 py-3 dark:border-danger-500/50 dark:bg-danger-500/40" role="alert">
      <svg className="mt-0.5 h-5 w-5 shrink-0 text-danger-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-danger-500 dark:text-danger-500">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 border-danger-500 text-danger-500 hover:bg-danger-500/20 dark:border-danger-500 dark:text-danger-500 dark:hover:bg-danger-500/50">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
