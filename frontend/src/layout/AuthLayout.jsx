import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "../components/Logo";

const benefits = ["Private idea workspace", "Seven-part AI analysis", "Clear next steps to validate"];

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-900 text-text-hi">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <section className="hidden flex-col justify-between bg-surface-900 p-8 lg:flex lg:p-12">
          <Link to="/" className="flex items-center gap-3"><Logo className="h-10 w-10" /><span className="text-lg font-semibold">Ideanalyze <span className="text-accent-300">AI</span></span></Link>
          <div className="max-w-md animate-fade-up"><p className="mb-4 text-xs font-semibold uppercase tracking-[.08em] text-accent-300">Build with signal</p><h1 className="text-4xl font-semibold leading-tight">Make your next idea easier to believe in.</h1><p className="mt-5 text-base leading-7 text-text-mid">Turn a rough thought into a structured plan you can test, share, and improve.</p><ul className="mt-8 space-y-4 text-sm text-text-mid">{benefits.map((item) => <li key={item} className="flex items-center gap-3"><span className="text-ok-500">✓</span>{item}</li>)}</ul></div>
          <p className="text-xs text-text-lo">© 2026 Ideanalyze AI</p>
        </section>
        <section className="flex min-h-screen flex-col bg-surface-800">
          <header className="flex h-14 items-center justify-between border-b border-surface-600 px-4 sm:px-6 lg:justify-end"><Link to="/" className="flex items-center gap-2 lg:hidden"><Logo className="h-7 w-7" /><span className="text-sm font-semibold">Ideanalyze <span className="text-accent-300">AI</span></span></Link><ThemeToggle /></header>
          <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8"><div className="w-full max-w-md animate-fade-up"><Outlet /></div></main>
          <footer className="pb-6 text-center text-xs text-text-lo"><Link to="/" className="hover:text-accent-300">&lt;- Back to home</Link></footer>
        </section>
      </div>
    </div>
  );
}
