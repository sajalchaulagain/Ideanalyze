import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-lg font-bold text-white shadow-md shadow-indigo-500/20">
                IA
              </span>
              <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Ideanalyze <span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </p>
            </Link>
            <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
              Turn rough startup ideas into structured, hackathon-ready plans in seconds.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</a>
            <Link to="/login" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Log in</Link>
            <Link to="/signup" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">Sign Up</Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:flex-row dark:border-slate-800 dark:text-slate-400">
          <p>© {year} Ideanalyze AI. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Crafted with passion by{" "}
            <a
              href="https://sajalchaulagain.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:decoration-indigo-600"
            >
              Sajal Chaulagain aka Mr. Chaule
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
