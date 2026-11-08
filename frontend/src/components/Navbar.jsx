import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#example", label: "Example" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent-soft text-accent"
      : "text-fg-muted hover:bg-surface-muted hover:text-fg"
  }`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Ideanalyze AI home"
        >
          <Logo className="h-9 w-9" iconClassName="h-4 w-4" />
          <span className="text-base font-bold tracking-tight text-fg sm:text-lg">
            Ideanalyze <span className="text-accent">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button onClick={() => navigate("/dashboard")}>
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign up</Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-border bg-surface px-4 pb-5 pt-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            <NavLink
              to="/"
              className={linkClass}
              end
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Go to dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Log in
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="w-full"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
