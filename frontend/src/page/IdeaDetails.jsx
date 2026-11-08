import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useIdeas } from "../context/IdeasContext";
import { analyzeIdeaWithAI, getAIStatus } from "../service/api";
import AIAnalysis from "../components/AIAnalysis";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import AIAnalysisFeedback from "../components/AIAnalysisFeedback";

const inputStyles =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export default function IdeaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIdea, editIdea, removeIdea, saving } = useIdeas();

  const idea = getIdea(id);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "" });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [reAnalyzing, setReAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAIError] = useState(null);
  const [aiStatus, setAIStatus] = useState(null);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [dailyResetAt, setDailyResetAt] = useState(null);

  useEffect(() => {
    let active = true;
    getAIStatus().then((status) => {
      if (active) setAIStatus(status);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!retryCooldown) return undefined;
    const timer = window.setInterval(() => setRetryCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [retryCooldown]);

  useEffect(() => {
    if (!dailyResetAt) return undefined;
    const timer = window.setInterval(() => {
      if (Date.now() >= new Date(dailyResetAt).getTime()) {
        setDailyResetAt(null);
        setAIError(null);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [dailyResetAt]);

  const dailyBlocked = Boolean(dailyResetAt);

  if (!idea) {
    return (
      <EmptyState
        title="Idea not found"
        message="This idea doesn't exist or was deleted."
        actionLabel="Back to Dashboard"
        actionTo="/dashboard"
      />
    );
  }

  const formattedDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startEditing = () => {
    setDraft({ title: idea.title, description: idea.description });
    setIsEditing(true);
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("Title and description cannot be empty.");
      return;
    }
    try {
      await editIdea(id, { title: draft.title.trim(), description: draft.description.trim() });
      setIsEditing(false);
    } catch {
      setError("Could not save changes. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await removeIdea(id);
      navigate("/dashboard");
    } catch {
      setError("Could not delete the idea. Please try again.");
    }
  };

  const handleAnalyzeAgain = async () => {
    if (dailyBlocked) return;
    setError("");
    setAIError(null);
    setReAnalyzing(true);
    try {
      const freshAnalysis = await analyzeIdeaWithAI({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        targetAudience: idea.targetAudience,
      });
      await editIdea(id, { aiAnalysis: freshAnalysis });
    } catch (err) {
      setAIError(err);
      if (err.code === "AI_RATE_LIMITED") setRetryCooldown(60);
      if (err.code === "AI_DAILY_LIMIT") setDailyResetAt(err.resetsAt || null);
    } finally {
      setReAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5M3 12h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Idea header card */}
      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors duration-300 sm:p-7 dark:border-slate-800 dark:bg-slate-900/90">
        {isEditing ? (
          <div className="space-y-3">
            <input
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              className={`${inputStyles} text-lg font-semibold`}
              aria-label="Idea title"
            />
            <textarea
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className={`${inputStyles} resize-y`}
              aria-label="Idea description"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} loading={saving}>Save changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {idea.category || "General"}
              </span>
              {idea.targetAudience && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Target: {idea.targetAudience}
                </span>
              )}
              <time className="ml-auto text-xs text-slate-400 dark:text-slate-500">Created {formattedDate}</time>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{idea.title}</h1>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{idea.description}</p>
          </>
        )}

        {!isEditing && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
            <Button variant="outline" onClick={startEditing}>Edit</Button>
            <Button variant="secondary" onClick={handleAnalyzeAgain} loading={reAnalyzing} disabled={dailyBlocked}>
              {retryCooldown > 0 && aiError?.code === "AI_RATE_LIMITED" ? `Retry in ${retryCooldown}s` : "Analyze Again"}
            </Button>
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>Delete</Button>
          </div>
        )}
      </div>

      {error && <div className="mt-4"><ErrorState message={error} /></div>}
      <div className="mt-4">
        <AIAnalysisFeedback error={aiError} remaining={aiStatus?.remaining} onRetry={handleAnalyzeAgain} retryCooldown={retryCooldown} />
      </div>

      {reAnalyzing && (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <LoadingState message="Re-analyzing your idea with Ideanalyze AI..." />
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Ideanalyze AI Breakdown</h2>
        <AIAnalysis analysis={idea.aiAnalysis} />
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete this idea?</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              &ldquo;{idea.title}&rdquo; and its analysis will be permanently deleted.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="danger" onClick={handleDelete} loading={saving} className="flex-1">
                Yes, delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmingDelete(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
