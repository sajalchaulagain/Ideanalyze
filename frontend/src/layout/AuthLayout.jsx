import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-800 transition-colors duration-300 dark:bg-surface-900 dark:text-surface-700">
      {/* Top bar */}
      <header className="border-b border-surface-600/80 bg-text-hi/80 backdrop-blur-md transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-500 to-accent-500 text-sm font-bold text-text-hi shadow-sm">
              IA
            </span>
            <span className="text-base font-bold tracking-tight text-surface-800 dark:text-text-hi">
              Ideanalyze <span className="text-accent-500 dark:text-accent-300">AI</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered card */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-surface-600/80 bg-text-hi p-6 shadow-sm transition-colors duration-300 sm:p-8 dark:border-surface-700 dark:bg-surface-800">
          <Outlet />
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-text-lo dark:text-text-mid">
        <Link to="/" className="hover:text-accent-500 dark:hover:text-accent-300"> Back to home</Link>
      </footer>
    </div>
  );
}
