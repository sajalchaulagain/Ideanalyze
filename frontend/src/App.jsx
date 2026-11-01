import { Routes, Route, Navigate } from "react-router-dom";

// Layouts (page chrome: sidebar vs. centered auth card)
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";

// Route guard for private pages
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./page/Landing";
import Login from "./page/Login";
import Signup from "./page/Signup";
import Dashboard from "./page/Dashboard";
import CreateIdea from "./page/CreateIdea";
import IdeaDetails from "./page/IdeaDetails";
import Profile from "./page/Profile";

/*
  All application routes in ONE place.
  Structure:
    - "/"            -> public landing page (own Navbar + Footer)
    - /login, /signup -> AuthLayout (centered card), public
    - /dashboard, /create, /idea/:id, /profile
      -> MainLayout (sidebar), wrapped in ProtectedRoute (login required)
    - anything else  -> redirect home (simple 404 handling for now)
*/

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Public auth pages sharing the centered-card layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Private pages: must be "logged in" (see ProtectedRoute).
          MainLayout provides the sidebar; <Outlet> renders the child. */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateIdea />} />
        <Route path="/idea/:id" element={<IdeaDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Unknown URLs bounce back to the landing page. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
