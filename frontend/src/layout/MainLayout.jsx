import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";
import Modal from "../components/ui/Modal";

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Reset scroll position for the new route. The drawer is closed by its
    // navigation links (onNavigate), so this effect only touches the DOM.
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-fg focus:shadow-pop"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface p-4 lg:block">
        <Sidebar />
      </aside>

      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        variant="drawer"
        title="Workspace navigation"
        closeLabel="Close navigation"
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </Modal>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-2 text-sm font-semibold"
          >
            <Logo className="h-7 w-7" iconClassName="h-3.5 w-3.5" />
            <span className="truncate">Ideanalyze AI</span>
          </Link>
          <Link
            to="/create"
            className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New idea
          </Link>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
