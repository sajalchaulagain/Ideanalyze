import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-800 transition-colors duration-300 dark:bg-surface-900 dark:text-surface-700">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-surface-600/80 bg-text-hi p-4 transition-colors duration-300 lg:block dark:border-surface-700 dark:bg-surface-800">
        <Sidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-surface-800/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-text-hi p-4 shadow-xl transition-colors duration-300 dark:bg-surface-800">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-text-lo hover:bg-surface-700 dark:text-text-mid dark:hover:bg-surface-700"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 border-b border-surface-600/80 bg-text-hi/90 backdrop-blur-md transition-colors duration-300 lg:hidden dark:border-surface-700 dark:bg-surface-800/90">
          <div className="flex h-14 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text-mid hover:bg-surface-700 dark:text-surface-600 dark:hover:bg-surface-700"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <Link to="/create" className="rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-3.5 py-2 text-sm font-semibold text-text-hi shadow-xs hover:from-accent-500 hover:to-accent-500">
              + New Idea
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
