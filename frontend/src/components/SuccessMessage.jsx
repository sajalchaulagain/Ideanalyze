export default function SuccessMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-ok-500 bg-ok-500 px-4 py-3 dark:border-ok-500/50 dark:bg-ok-500/40" role="status">
      <svg className="mt-0.5 h-5 w-5 shrink-0 text-ok-500 dark:text-ok-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm font-medium text-ok-500 dark:text-ok-500">{message}</p>
    </div>
  );
}
