import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "../components/Logo";

const benefits = [
  "Private workspace with your saved ideas",
  "Seven-part AI analysis in seconds",
  "Clear next steps for validation",
];

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas text-fg">
      <div className="grid min-h-screen lg:grid-cols-[46%_54%]">
        <section className="relative hidden overflow-hidden bg-brand-700 p-10 text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl"
            aria-hidden="true"
          />

          <Link
            to="/"
            className="relative flex min-h-11 items-center gap-3"
            aria-label="Ideanalyze AI home"
          >
            <Logo className="h-10 w-10" iconClassName="h-5 w-5" />
            <span className="text-lg font-bold tracking-tight">
              Ideanalyze AI
            </span>
          </Link>

          <div className="relative max-w-md animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
              Build with signal
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.15] tracking-tight">
              Make your next idea easier to believe in.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/75">
              Turn a rough thought into a structured plan you can test, share,
              and improve.
            </p>
            <ul className="mt-8 space-y-3.5 text-sm text-white/85">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 text-white/70"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">
            © {new Date().getFullYear()} Ideanalyze AI
          </p>
        </section>

        <section className="flex min-h-screen flex-col bg-canvas">
          <header className="flex h-16 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur sm:px-6 lg:justify-end">
            <Link
              to="/"
              className="flex min-h-11 items-center gap-2 lg:hidden"
              aria-label="Ideanalyze AI home"
            >
              <Logo className="h-8 w-8" iconClassName="h-4 w-4" />
              <span className="text-sm font-bold">
                Ideanalyze <span className="text-accent">AI</span>
              </span>
            </Link>
            <ThemeToggle />
          </header>

          <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
            <div className="w-full max-w-md animate-fade-up">
              <Outlet />
            </div>
          </main>

          <footer className="pb-7 text-center">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </footer>
        </section>
      </div>
    </div>
  );
}
