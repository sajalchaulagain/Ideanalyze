import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2.5"
              aria-label="Ideanalyze AI home"
            >
              <Logo className="h-9 w-9" iconClassName="h-4 w-4" />
              <span className="text-lg font-bold tracking-tight text-fg">
                Ideanalyze <span className="text-accent">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-fg-muted">
              Turn rough startup ideas into structured, testable plans with a
              focused seven-part AI breakdown.
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-fg-muted"
            aria-label="Footer navigation"
          >
            <a href="#features" className="transition-colors hover:text-accent">
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-accent"
            >
              How it works
            </a>
            <a href="#example" className="transition-colors hover:text-accent">
              Example
            </a>
            <Link to="/login" className="transition-colors hover:text-accent">
              Log in
            </Link>
            <Link to="/signup" className="transition-colors hover:text-accent">
              Sign up
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-sm text-fg-subtle sm:flex-row sm:items-center">
          <p>© {year} Ideanalyze AI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-danger" aria-hidden="true" />
            Crafted by{" "}
            <a
              href="https://sajalchaulagain.com.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              Sajal Chaulagain
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
