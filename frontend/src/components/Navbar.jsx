import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const linkStyles = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-surface-700 text-accent-500 dark:bg-accent-600/50 dark:text-accent-300"
      : "text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-text-hi"
  }`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-600/80 bg-text-hi/80 backdrop-blur-md transition-colors duration-300 dark:border-surface-700/80 dark:bg-surface-800/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <Logo className="h-8 w-8 transition-transform group-hover:scale-105" />
          <span className="text-lg font-bold tracking-tight text-surface-800 dark:text-text-hi">
            Ideanalyze <span className="text-accent-500 dark:text-accent-300">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkStyles}>Home</NavLink>
          <a href="#features" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-text-hi">
            Features
          </a>
          <a href="#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-text-hi">
            How It Works
          </a>
          <a href="#example" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-text-hi">
            Example
          </a>
        </div>

        {/* Desktop Right Actions (Theme Toggle + Auth) */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle & ThemeToggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-text-mid hover:bg-surface-700 dark:text-surface-600 dark:hover:bg-surface-700"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="border-t border-surface-600 bg-text-hi px-4 pb-4 pt-2 md:hidden dark:border-surface-700 dark:bg-surface-800">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={linkStyles} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <a href="#features" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 dark:text-surface-600 dark:hover:bg-surface-700" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 dark:text-surface-600 dark:hover:bg-surface-700" onClick={() => setMenuOpen(false)}>
              How It Works
            </a>
            <a href="#example" className="rounded-lg px-3 py-2 text-sm font-medium text-text-mid hover:bg-surface-700 dark:text-surface-600 dark:hover:bg-surface-700" onClick={() => setMenuOpen(false)}>
              Example
            </a>
          </div>
          <div className="mt-3 flex gap-2">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="flex-1">Go to Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/login")} className="flex-1">Log in</Button>
                <Button onClick={() => navigate("/signup")} className="flex-1">Sign Up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
