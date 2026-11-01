import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-sm font-bold text-white shadow-sm">
              IA
            </span>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Ideanalyze <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Centered card */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors duration-300 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <Outlet />
        </div>
      </main>

      <footer className="pb-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">← Back to home</Link>
      </footer>
    </div>
  );
}
