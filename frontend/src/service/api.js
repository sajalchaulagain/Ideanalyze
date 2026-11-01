import axios from "axios";

/*
  ============================================================================
  CENTRAL API LAYER — Express Backend Integration
  ============================================================================
*/

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

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

export default api;

function getErrorMessage(error, defaultMsg) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || defaultMsg;
}

// ===========================================================================
// AUTH
// ===========================================================================

export async function signupUser({ name, email, password }) {
  try {
    const res = await api.post("/auth/signup", { name, email, password });
    if (res.data?.data?.token) {
      localStorage.setItem("token", res.data.data.token);
    }
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Signup failed"));
  }
}

export async function loginUser({ email, password }) {
  try {
    const res = await api.post("/auth/login", { email, password });
    if (res.data?.data?.token) {
      localStorage.setItem("token", res.data.data.token);
    }
    return res.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
}

export async function getMe() {
  try {
    const res = await api.get("/auth/me");
    return res.data.data?.user;
  } catch (error) {
    return null;
  }
}

// ===========================================================================
// IDEAS (CRUD)
// ===========================================================================

export async function fetchIdeas() {
  try {
    const res = await api.get("/ideas");
    return res.data?.data?.ideas || [];
  } catch (error) {
    console.error("Error fetching ideas from server:", getErrorMessage(error, "Fetch failed"));
    return [];
  }
}

export async function createIdea(payload) {
  try {
    const res = await api.post("/ideas", payload);
    return res.data?.data?.idea;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to create idea"));
  }
}

export async function updateIdea(id, payload) {
  try {
    const res = await api.put(`/ideas/${id}`, payload);
    return res.data?.data?.idea;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to update idea"));
  }
}

export async function deleteIdea(id) {
  try {
    await api.delete(`/ideas/${id}`);
    return id;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to delete idea"));
  }
}

// ===========================================================================
// AI ANALYSIS
// ===========================================================================

export async function analyzeIdeaWithAI({ title, description, category, targetAudience }) {
  try {
    const res = await api.post("/ai/analyze", {
      title,
      description,
      category,
      targetAudience,
    });
    return res.data?.data?.analysis;
  } catch (error) {
    throw new Error(getErrorMessage(error, "AI analysis failed"));
  }
}
