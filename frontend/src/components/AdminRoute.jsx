import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/*
  Mirrors ProtectedRoute, with one extra rule: only admins may render the
  admin tree. Everyone else is sent to their dashboard instead of a 403 page,
  because there is no reason to advertise that /admin exists.
*/
export default function AdminRoute({ children }) {
  const { user, authLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // The parent ProtectedRoute normally resolves the session first. This keeps
  // the guard safe if it is ever mounted on its own.
  if (authLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
