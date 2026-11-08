import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-600 bg-text-hi transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/90">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-500 to-accent-500 text-lg font-bold text-text-hi shadow-md shadow-accent-500/20">
                IA
              </span>
              <p className="text-xl font-extrabold tracking-tight text-surface-800 dark:text-text-hi">
                Ideanalyze <span className="text-accent-500 dark:text-accent-300">AI</span>
              </p>
            </Link>
            <p className="mt-2 max-w-sm text-sm text-text-mid dark:text-text-mid">
              Turn rough startup ideas into structured, hackathon-ready plans in seconds.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-text-mid dark:text-text-mid">
            <a href="#features" className="transition-colors hover:text-accent-500 dark:hover:text-accent-300">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-accent-500 dark:hover:text-accent-300">How It Works</a>
            <Link to="/login" className="transition-colors hover:text-accent-500 dark:hover:text-accent-300">Log in</Link>
            <Link to="/signup" className="transition-colors hover:text-accent-500 dark:hover:text-accent-300">Sign Up</Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-surface-700 pt-6 text-sm text-text-lo sm:flex-row dark:border-surface-700 dark:text-text-mid">
          <p>Ã‚Â© {year} Ideanalyze AI. All rights reserved.</p>
          <p className="flex items-center gap-1 font-medium">
            Crafted with passion by{" "}
            <a
              href="https://sajalchaulagain.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-500 underline decoration-accent-300 underline-offset-4 transition-colors hover:text-accent-500 dark:text-accent-300 dark:decoration-accent-500"
            >
              Sajal Chaulagain aka Mr. Chaule
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
