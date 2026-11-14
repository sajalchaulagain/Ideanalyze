import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AUTH_UNAUTHORIZED_EVENT,
  getMe,
  loginUser,
  signupUser,
  updateProfile as updateProfileRequest,
} from "../service/api";

const AuthContext = createContext(null);

function readToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function clearToken() {
  try {
    localStorage.removeItem("token");
  } catch {
    // Ignore storage failures.
  }
}

/*
  Sessions created before roles existed have no role in localStorage. /auth/me
  now returns it, and this fallback keeps every consumer from seeing undefined.
*/
function withRole(user) {
  if (!user) return user;
  return { ...user, role: user.role || "user" };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [hasSession, setHasSession] = useState(() => Boolean(readToken()));

  const restoreSession = useCallback(async () => {
    const token = readToken();
    setHasSession(Boolean(token));

    if (!token) {
      setUser(null);
      setAuthError("");
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    try {
      const currentUser = await getMe();
      if (currentUser) {
        setUser(withRole(currentUser));
        setAuthError("");
      } else {
        clearToken();
        setHasSession(false);
        setUser(null);
        setAuthError("");
      }
    } catch (error) {
      // Expired or invalid credentials: sign out. Network/server failures:
      // keep the token and show a retryable message instead of logging out.
      if (error.status === 401) {
        clearToken();
        setHasSession(false);
        setUser(null);
        setAuthError("");
      } else {
        setAuthError(
          error.message || "We couldn't check your session. Please try again."
        );
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  /* Restoring the session is a one-time read from an external store
     (localStorage/API). The state writes are the intended result of that read. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setHasSession(false);
      setAuthError("");
    };
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const data = await loginUser({ email, password });
      setUser(withRole(data.user));
      setHasSession(true);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const data = await signupUser({ name, email, password });
      setUser(withRole(data.user));
      setHasSession(true);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setHasSession(false);
    setAuthError("");
  };

  const updateProfile = async (updates) => {
    const updatedUser = await updateProfileRequest(updates);
    setUser(withRole(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    authLoading,
    authError,
    hasSession,
    login,
    signup,
    logout,
    updateProfile,
    retrySession: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
