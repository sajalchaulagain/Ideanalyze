import { Link, NavLink, Outlet } from "react-router-dom";
import { KeyRound } from "lucide-react";

const tabs = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/ideas", label: "Ideas" },
  { to: "/admin/audit", label: "Audit log" },
];

const tabClass = ({ isActive }) =>
  `whitespace-nowrap border-b-2 px-3 pb-2.5 pt-2 text-sm font-medium transition-colors ${
    isActive
      ? "border-accent text-fg"
      : "border-transparent text-fg-muted hover:text-fg"
  }`;

export default function AdminLayout() {
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Control room
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-fg-muted">
            Manage accounts, review saved ideas, and follow every change in the
            audit log.
          </p>
        </div>
        <Link
          to="/admin/account"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-fg transition-colors hover:bg-surface-muted"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Admin password
        </Link>
      </div>

      <nav
        aria-label="Admin sections"
        className="mt-6 flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={tabClass}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
