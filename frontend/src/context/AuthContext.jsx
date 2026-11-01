import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, signupUser, getMe } from "../service/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore user session on mount if JWT token exists in localStorage
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const currentUser = await getMe();
          if (currentUser) {
            setUser(currentUser);
          } else {
            localStorage.removeItem("token");
          }
        } catch {
          localStorage.removeItem("token");
        }
      }
      setAuthLoading(false);
    }
    restoreSession();
  }, []);

  const isAuthenticated = user !== null;

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const data = await signupUser({ name, email, password });
      setUser(data.user);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = (updates) =>
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));

  const value = { user, isAuthenticated, authLoading, login, signup, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
