import { Navigate, useLocation } from "react-router-dom";
import { LogIn, RotateCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import ErrorState from "./ErrorState";
import Logo from "./Logo";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading, authError, retrySession, logout } =
    useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-sm text-center" role="status">
          <Logo className="mx-auto h-11 w-11" iconClassName="h-5 w-5" />
          <p className="mt-4 text-sm font-medium text-fg">
            Restoring your workspace…
          </p>
          <div className="mt-5 space-y-2.5" aria-hidden="true">
            <div className="skeleton mx-auto h-3 w-3/4 rounded-full" />
            <div className="skeleton mx-auto h-3 w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return children;

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card">
          <Logo className="h-10 w-10" iconClassName="h-5 w-5" />
          <h1 className="mt-4 text-lg font-semibold text-fg">
            We couldn&apos;t verify your session
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-fg-muted">
            Your saved session is still on this device. This usually means the
            API was temporarily unreachable.
          </p>
          <div className="mt-4">
            <ErrorState message={authError} />
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={retrySession} className="flex-1">
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="flex-1"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Navigate
      to="/login"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}
