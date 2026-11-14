import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Landing from "./page/Landing";
import Login from "./page/Login";
import Signup from "./page/Signup";
import Dashboard from "./page/Dashboard";
import CreateIdea from "./page/CreateIdea";
import IdeaDetails from "./page/IdeaDetails";
import Profile from "./page/Profile";
import AdminLayout from "./layout/AdminLayout";
import AdminOverview from "./page/admin/AdminOverview";
import AdminUsers from "./page/admin/AdminUsers";
import AdminIdeas from "./page/admin/AdminIdeas";
import AdminAudit from "./page/admin/AdminAudit";
import AdminAccount from "./page/admin/AdminAccount";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

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

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="audit" element={<AdminAudit />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
