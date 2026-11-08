import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const drawer = useRef(null);
  useEffect(() => { if (!open) return undefined; const close = (event) => event.key === "Escape" && setOpen(false); document.addEventListener("keydown", close); drawer.current?.focus(); return () => document.removeEventListener("keydown", close); }, [open]);
  return <div className="min-h-screen bg-surface-900 text-text-hi"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-surface-600 bg-surface-800 p-4 lg:block"><Sidebar /></aside>
    {open && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-surface-900/80" aria-label="Close navigation" onClick={() => setOpen(false)} /><aside ref={drawer} tabIndex={-1} className="absolute inset-y-0 left-0 w-72 bg-surface-800 p-4 shadow-xl"><div className="mb-2 flex justify-end"><button type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 text-text-mid" aria-label="Close menu">×</button></div><Sidebar onNavigate={() => setOpen(false)} /></aside></div>}
    <div className="lg:pl-64"><header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-600 bg-surface-800/90 px-4 backdrop-blur lg:hidden"><button type="button" onClick={() => setOpen(true)} className="min-h-11 min-w-11 text-left text-xl text-text-mid" aria-label="Open menu">☰</button><Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold"><Logo className="h-6 w-6" />Ideanalyze <span className="text-accent-300">AI</span></Link><Link to="/create" className="rounded-md bg-accent-500 px-3 py-2 text-sm font-semibold text-text-hi hover:bg-accent-600">+ New idea</Link></header><main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main></div>
  </div>;
}
