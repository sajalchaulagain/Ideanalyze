import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [ideasLoaded, setIdeasLoaded] = useState(false);
  const [ideasError, setIdeasError] = useState("");
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);

  const reloadIdeas = useCallback(async () => {
    if (!isAuthenticated) return;
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;

    setLoadingIdeas(true);
    setIdeasError("");
    try {
      const fetched = await apiFetchIdeas();
      if (requestId.current !== currentRequest) return;
      setIdeas(Array.isArray(fetched) ? fetched : []);
      setIdeasLoaded(true);
    } catch (error) {
      if (requestId.current !== currentRequest) return;
      setIdeasError(error.message || "Could not load your ideas.");
      setIdeasLoaded(true);
    } finally {
      if (requestId.current === currentRequest) {
        setLoadingIdeas(false);
      }
    }
  }, [isAuthenticated]);

  /* The workspace cache must be cleared on sign-out so another account never
     sees stale ideas. This effect intentionally synchronizes React state with
     the auth store. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isAuthenticated) {
      requestId.current += 1;
      setIdeas([]);
      setIdeasError("");
      setIdeasLoaded(false);
      setLoadingIdeas(false);
      return;
    }
    reloadIdeas();
  }, [isAuthenticated, reloadIdeas]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addIdea = async (ideaDraft) => {
    setSaving(true);
    try {
      const saved = await apiCreateIdea(ideaDraft);
      setIdeas((current) => [saved, ...current]);
      setIdeasLoaded(true);
      return saved;
    } finally {
      setSaving(false);
    }
  };

  const editIdea = async (id, updates) => {
    setSaving(true);
    try {
      // Send only the changed fields. The API merges them, so re-analysis
      // cannot accidentally overwrite unrelated idea data.
      const updated = await apiUpdateIdea(id, updates);
      setIdeas((current) =>
        current.map((idea) => (idea._id === id ? updated : idea))
      );
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const removeIdea = async (id) => {
    setSaving(true);
    try {
      await apiDeleteIdea(id);
      setIdeas((current) => current.filter((idea) => idea._id !== id));
    } finally {
      setSaving(false);
    }
  };

  const getIdea = (id) => ideas.find((idea) => idea._id === id);

  const value = {
    ideas,
    loadingIdeas,
    ideasLoaded,
    ideasError,
    reloadIdeas,
    saving,
    addIdea,
    editIdea,
    removeIdea,
    getIdea,
  };

  return <IdeasContext.Provider value={value}>{children}</IdeasContext.Provider>;
}

export function useIdeas() {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error("useIdeas must be used inside an IdeasProvider");
  }
  return context;
}
