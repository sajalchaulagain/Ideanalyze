import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const linkStyles = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-surface-700 text-accent-500 shadow-xs dark:bg-accent-600/60 dark:text-accent-300"
      : "text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-text-mid dark:hover:bg-surface-700/80 dark:hover:text-surface-600"
  }`;

const icons = {
  dashboard: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18V6z" />
    </svg>
  ),
  create: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  profile: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0" />
    </svg>
  ),
  home: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.96-8.96a1.5 1.5 0 012.12 0L22.29 12M4.5 9.75V20.25h15V9.75" />
    </svg>
  ),
};

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col bg-text-hi transition-colors duration-300 dark:bg-surface-800/90">
      {/* Logo & Theme Toggle */}
      <div className="flex items-center justify-between px-2 py-1">
        <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-500 to-accent-500 text-base font-bold text-text-hi shadow-md shadow-accent-500/20">
            IA
          </span>
          <span className="text-lg font-bold tracking-tight text-surface-800 dark:text-text-hi">
            Ideanalyze <span className="text-accent-500 dark:text-accent-300">AI</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Nav links */}
      <nav className="mt-6 flex flex-col gap-1.5">
        <NavLink to="/dashboard" onClick={onNavigate} className={linkStyles}>
          {icons.dashboard} Dashboard
        </NavLink>
        <NavLink to="/create" onClick={onNavigate} className={linkStyles}>
          {icons.create} New Idea
        </NavLink>
        <NavLink to="/profile" onClick={onNavigate} className={linkStyles}>
          {icons.profile} Profile
        </NavLink>
        <NavLink to="/" onClick={onNavigate} className={linkStyles}>
          {icons.home} Back to Site
        </NavLink>
      </nav>

      {/* Logged-in user footer */}
      <div className="mt-auto border-t border-surface-600/80 pt-4 dark:border-surface-700">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-accent-500 to-accent-600 text-sm font-bold text-text-hi shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-surface-800 dark:text-surface-700">{user?.name || "Builder"}</p>
            <p className="truncate text-xs text-text-lo dark:text-text-mid">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text-mid transition-colors hover:bg-danger-500 hover:text-danger-500 dark:text-text-mid dark:hover:bg-danger-500/40 dark:hover:text-danger-500"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
