import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchIdeas as apiFetchIdeas,
  createIdea as apiCreateIdea,
  updateIdea as apiUpdateIdea,
  deleteIdea as apiDeleteIdea,
} from "../service/api";

const IdeasContext = createContext(null);

export function IdeasProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadIdeas() {
      if (isAuthenticated) {
        setLoadingIdeas(true);
        try {
          const fetched = await apiFetchIdeas();
          setIdeas(Array.isArray(fetched) ? fetched : []);
        } catch (error) {
          console.error("Failed to load ideas:", error);
          setIdeas([]);
        } finally {
          setLoadingIdeas(false);
        }
      } else {
        setIdeas([]);
      }
    }
    loadIdeas();
  }, [isAuthenticated]);

  const addIdea = async (ideaDraft) => {
    setSaving(true);
    try {
      const saved = await apiCreateIdea(ideaDraft);
      setIdeas((prev) => [saved, ...prev]);
      return saved;
    } finally {
      setSaving(false);
    }
  };

  const editIdea = async (id, updates) => {
    setSaving(true);
    try {
      const current = getIdea(id);
      const updated = await apiUpdateIdea(id, {
        ...current,
        ...updates,
      });
      setIdeas((prev) => prev.map((idea) => (idea._id === id ? updated : idea)));
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const removeIdea = async (id) => {
    setSaving(true);
    try {
      await apiDeleteIdea(id);
      setIdeas((prev) => prev.filter((idea) => idea._id !== id));
    } finally {
      setSaving(false);
    }
  };

  const getIdea = (id) => ideas.find((idea) => idea._id === id);

  const value = {
    ideas,
    loadingIdeas,
    saving,
    addIdea,
    editIdea,
    removeIdea,
    getIdea,
  };

  return <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>;
}

export function useIdeas() {
  return useContext(IdeasContext);
}
