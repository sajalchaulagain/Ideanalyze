import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const items = { dashboard: "▦", create: "+", profile: "○" };
const linkClass = ({ isActive }) => `flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm font-medium ${isActive ? "nav-active border-accent-500 bg-surface-700 text-text-hi" : "border-transparent text-text-mid hover:bg-surface-700 hover:text-text-hi"}`;

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); onNavigate?.(); navigate("/"); };
  return <div className="flex h-full flex-col bg-surface-800">
    <div className="flex h-12 items-center justify-between"><Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-2"><Logo className="h-8 w-8" /><span className="font-semibold">Ideanalyze <span className="text-accent-300">AI</span></span></Link><ThemeToggle /></div>
    <nav className="mt-8 space-y-1"><p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.08em] text-text-lo">Main</p><NavLink to="/dashboard" onClick={onNavigate} className={linkClass}><span className="w-4 text-center text-base">{items.dashboard}</span>Dashboard</NavLink><NavLink to="/create" onClick={onNavigate} className={linkClass}><span className="w-4 text-center text-xl">{items.create}</span>Create</NavLink><p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[.08em] text-text-lo">Account</p><NavLink to="/profile" onClick={onNavigate} className={linkClass}><span className="w-4 text-center text-base">{items.profile}</span>Profile</NavLink><button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 border-l-2 border-transparent px-3 text-left text-sm font-medium text-text-mid hover:bg-surface-700 hover:text-danger-500"><span className="w-4 text-center">↪</span>Sign out</button></nav>
    <div className="mt-auto border-t border-surface-600 pt-4"><div className="flex items-center gap-3 rounded-lg bg-surface-700 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-semibold text-text-hi">{user?.name?.charAt(0).toUpperCase() || "?"}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.name || "Builder"}</p><p className="truncate text-xs text-text-mid">{user?.email || ""}</p></div></div></div>
  </div>;
}
