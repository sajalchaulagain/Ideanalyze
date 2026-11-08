import axios from "axios";

/*
  Central API layer.
  All requests go through one Axios instance so authentication headers,
  timeouts and error normalization stay consistent across the app.
*/

const configuredBaseUrl = (import.meta.env?.VITE_API_URL || "").trim();
const API_BASE_URL = (
  configuredBaseUrl || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const AUTH_UNAUTHORIZED_EVENT = "ideanalyze:unauthorized";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthAttempt =
      url.includes("/auth/login") || url.includes("/auth/signup");

    // 401 means the token is expired or invalid — not a temporary outage.
    // Clearing it here keeps every page from showing stale "authenticated" UI.
    if (status === 401 && !isAuthAttempt && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

function getErrorMessage(error, fallback) {
  const serverMessage = error.response?.data?.message;
  if (serverMessage) return serverMessage;

  if (error.code === "ECONNABORTED") {
    return "The request took too long to complete. Please try again.";
  }
  if (!error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (error.response.status >= 500) {
    return "The server is unavailable right now. Please try again in a moment.";
  }
  return fallback || error.message || "Something went wrong.";
}

function toApiError(error, fallback) {
  const wrapped = new Error(getErrorMessage(error, fallback), { cause: error });
  const data = error.response?.data;
  wrapped.code = data?.code;
  wrapped.field = data?.field;
  wrapped.resetsAt = data?.resetsAt;
  wrapped.retryAfter = data?.retryAfter;
  wrapped.status = error.response?.status;
  return wrapped;
}

// ===========================================================================
// AUTH
// ===========================================================================

export async function signupUser({ name, email, password }) {
  try {
    const response = await api.post("/auth/signup", { name, email, password });
    const data = response.data?.data;
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    throw toApiError(error, "Signup failed. Please try again.");
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data?.data;
    if (data?.token) localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    throw toApiError(error, "Login failed. Check your email and password.");
  }
}

export async function getMe() {
  try {
    const response = await api.get("/auth/me");
    return response.data?.data?.user;
  } catch (error) {
    throw toApiError(error, "Could not restore your session.");
  }
}

export async function updateProfile(payload) {
  try {
    const response = await api.patch("/auth/me", payload);
    return response.data?.data?.user;
  } catch (error) {
    throw toApiError(error, "Could not update your profile.");
  }
}

// ===========================================================================
// IDEAS (CRUD)
// ===========================================================================

export async function fetchIdeas() {
  try {
    const response = await api.get("/ideas");
    return response.data?.data?.ideas || [];
  } catch (error) {
    throw toApiError(error, "Could not load your ideas.");
  }
}

export async function fetchIdea(id) {
  try {
    const response = await api.get(`/ideas/${id}`);
    return response.data?.data?.idea;
  } catch (error) {
    throw toApiError(error, "Could not load this idea.");
  }
}

export async function createIdea(payload) {
  try {
    const response = await api.post("/ideas", payload);
    return response.data?.data?.idea;
  } catch (error) {
    throw toApiError(error, "Failed to create the idea.");
  }
}

export async function updateIdea(id, payload) {
  try {
    const response = await api.put(`/ideas/${id}`, payload);
    return response.data?.data?.idea;
  } catch (error) {
    throw toApiError(error, "Failed to update the idea.");
  }
}

export async function deleteIdea(id) {
  try {
    await api.delete(`/ideas/${id}`);
    return id;
  } catch (error) {
    throw toApiError(error, "Failed to delete the idea.");
  }
}

// ===========================================================================
// AI ANALYSIS
// ===========================================================================

export async function analyzeIdeaWithAI({
  title,
  description,
  category,
  targetAudience,
}) {
  try {
    const response = await api.post("/ai/analyze", {
      title,
      description,
      category: category || "Other",
      targetAudience: targetAudience || "Not specified",
    });
    return response.data?.data?.analysis;
  } catch (error) {
    throw toApiError(error, "AI analysis failed. Please try again.");
  }
}

export async function getAIStatus() {
  try {
    const response = await api.get("/ai/status");
    return response.data;
  } catch {
    // AI status is supplemental; a failure must not block the main workflow.
    return null;
  }
}

export default api;
