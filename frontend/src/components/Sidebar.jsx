import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, PlusCircle, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create", label: "Create idea", icon: PlusCircle },
  { to: "/profile", label: "Profile", icon: UserRound },
];

const linkClass = ({ isActive }) =>
  `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
    isActive
      ? "bg-accent-soft text-accent"
      : "text-fg-muted hover:bg-surface-muted hover:text-fg"
  }`;

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    onNavigate?.();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-2.5"
          aria-label="Ideanalyze AI dashboard"
        >
          <Logo className="h-9 w-9" iconClassName="h-4 w-4" />
          <span className="text-base font-bold tracking-tight text-fg">
            Ideanalyze <span className="text-accent">AI</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="mt-8 flex-1 space-y-1" aria-label="Workspace navigation">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={linkClass}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-surface-muted p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">
              {user?.name || "Builder"}
            </p>
            <p className="truncate text-xs text-fg-muted">{user?.email || ""}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger-ink"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </div>
  );
}
