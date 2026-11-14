import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  RotateCw,
  Save,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { useIdeas } from "../context/IdeasContext";
import { useToast } from "../context/ToastContext";
import { analyzeIdeaWithAI, getAIStatus } from "../service/api";
import AIAnalysis from "../components/AIAnalysis";
import AIAnalysisFeedback from "../components/AIAnalysisFeedback";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import Badge from "../components/ui/Badge";
import FormField from "../components/ui/FormField";
import Modal from "../components/ui/Modal";
import {
  inputClass,
  selectClass,
  textareaClass,
} from "../components/ui/formStyles";
import { DEFAULT_CATEGORY, ideaCategories } from "../data/ideaCategories";
import { useRetryCooldown } from "../hooks/useRetryCooldown";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  trimTitle,
  trimToLength,
  useDocumentMeta,
} from "../hooks/useDocumentMeta";
import {
  formatDate,
  formatRelativeTime,
  hasAnalysis,
  nextUtcMidnightIso,
} from "../lib/format";

const MIN_DESCRIPTION = 20;

export default function IdeaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIdea, editIdea, removeIdea, saving, loadingIdeas, ideasLoaded, ideasError, reloadIdeas } =
    useIdeas();
  const { showToast } = useToast();
  const { retryCooldown, startCooldown, resetCooldown } = useRetryCooldown();

  const idea = getIdea(id);

  useDocumentMeta(
    idea ? `${trimTitle(idea.title) || "Idea"} · Ideanalyze AI` : DEFAULT_TITLE,
    (idea && trimToLength(idea.description)) || DEFAULT_DESCRIPTION
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: DEFAULT_CATEGORY,
    targetAudience: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reAnalyzing, setReAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAIError] = useState(null);
  const [aiStatus, setAIStatus] = useState(null);
  const [dailyResetAt, setDailyResetAt] = useState(null);

  useEffect(() => {
    let active = true;
    getAIStatus().then((status) => {
      if (active && status) setAIStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

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

  const backLink = (
    <Link
      to="/dashboard"
      className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-accent"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to dashboard
    </Link>
  );

  if (!idea && (loadingIdeas || !ideasLoaded)) {
    return (
      <div className="mx-auto max-w-4xl">
        {backLink}
        <div className="mt-6">
          <LoadingState
            message="Loading this idea and its analysis..."
            variant="analysis"
            count={4}
          />
        </div>
      </div>
    );
  }

  if (!idea) {
    if (ideasError) {
      return (
        <div className="mx-auto max-w-4xl">
          {backLink}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
            <ErrorState
              message={ideasError}
              onRetry={reloadIdeas}
              retryLabel="Try loading the idea again"
              retryDisabled={loadingIdeas}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-4xl">
        {backLink}
        <div className="mt-6">
          <EmptyState
            title="Idea not found"
            message="This idea doesn't exist in your workspace or it may have been deleted."
            actionLabel="Back to dashboard"
            actionTo="/dashboard"
          />
        </div>
      </div>
    );
  }

  const analyzed = hasAnalysis(idea.aiAnalysis);
  const wasUpdated =
    idea.updatedAt &&
    idea.createdAt &&
    new Date(idea.updatedAt).getTime() > new Date(idea.createdAt).getTime();

  const startEditing = () => {
    setDraft({
      title: idea.title || "",
      description: idea.description || "",
      category: idea.category || DEFAULT_CATEGORY,
      targetAudience: idea.targetAudience || "",
    });
    setFieldErrors({});
    setError("");
    setIsEditing(true);
  };

  const updateDraft = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  const validateDraft = () => {
    const next = {};
    const title = draft.title.trim();
    const description = draft.description.trim();

    if (!title) next.title = "Give your idea a title.";
    else if (title.length > 120)
      next.title = "Keep the title under 120 characters.";

    if (!description) next.description = "Add a description.";
    else if (description.length < MIN_DESCRIPTION)
      next.description = `Add at least ${MIN_DESCRIPTION} characters so the idea stays useful.`;

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveEdit = async (event) => {
    event?.preventDefault?.();
    if (saving) return;
    if (!validateDraft()) return;

    setError("");
    try {
      await editIdea(id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category || DEFAULT_CATEGORY,
        targetAudience: draft.targetAudience.trim() || "Not specified",
      });
      setIsEditing(false);
      showToast("Idea details updated.", "success");
    } catch (err) {
      setError(err.message || "Could not save your changes. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (saving) return;
    setDeleteError("");
    try {
      await removeIdea(id);
      setConfirmingDelete(false);
      showToast("Idea deleted.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setDeleteError(
        err.message || "Could not delete this idea. Please try again."
      );
    }
  };

  const closeDeleteModal = () => {
    if (saving) return;
    setConfirmingDelete(false);
    setDeleteError("");
  };

  const refreshStatus = () => {
    getAIStatus().then((status) => {
      if (status) setAIStatus(status);
    });
  };

  const handleAnalyzeAgain = async () => {
    if (dailyBlocked || reAnalyzing || retryCooldown > 0 || saving) return;

    setError("");
    setAIError(null);
    setReAnalyzing(true);

    try {
      const freshAnalysis = await analyzeIdeaWithAI({
        title: idea.title,
        description: idea.description,
        category: idea.category || DEFAULT_CATEGORY,
        targetAudience: idea.targetAudience || "Not specified",
      });

      if (!hasAnalysis(freshAnalysis)) {
        const empty = new Error(
          "The AI returned an empty analysis. Your saved analysis was left unchanged."
        );
        empty.code = "AI_EMPTY_RESULT";
        throw empty;
      }

      // Only replace the saved analysis after the new one is valid and saved.
      try {
        await editIdea(id, { aiAnalysis: freshAnalysis });
        showToast("AI analysis refreshed and saved.", "success");
        resetCooldown();
        refreshStatus();
      } catch (saveError) {
        setError(
          saveError.message ||
            "The new analysis was generated but could not be saved. Your previous analysis is still intact."
        );
      }
    } catch (err) {
      setAIError(err);
      if (err.code === "AI_RATE_LIMITED") {
        startCooldown(err.retryAfter || 60);
      }
      if (err.code === "AI_DAILY_LIMIT") {
        setDailyResetAt(err.resetsAt || nextUtcMidnightIso());
      }
    } finally {
      setReAnalyzing(false);
    }
  };

  const analyzeLabel = dailyBlocked
    ? "Daily AI limit reached"
    : retryCooldown > 0 && aiError?.code === "AI_RATE_LIMITED"
      ? `Retry in ${retryCooldown}s`
      : "Analyze again";

  return (
    <div className="mx-auto max-w-4xl">
      {backLink}

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-4" noValidate>
            <div>
              <h1 className="text-lg font-semibold text-fg">Edit idea details</h1>
              <p className="mt-1 text-sm text-fg-muted">
                Changes are saved to your workspace and do not affect the saved
                AI analysis.
              </p>
            </div>

            <FormField
              label="Title"
              htmlFor="edit-title"
              required
              error={fieldErrors.title}
            >
              <input
                id="edit-title"
                name="title"
                type="text"
                value={draft.title}
                onChange={updateDraft}
                className={inputClass}
                maxLength={120}
                aria-invalid={Boolean(fieldErrors.title)}
              />
            </FormField>

            <FormField
              label="Description"
              htmlFor="edit-description"
              required
              error={fieldErrors.description}
              hint={`At least ${MIN_DESCRIPTION} characters.`}
            >
              <textarea
                id="edit-description"
                name="description"
                value={draft.description}
                onChange={updateDraft}
                rows={5}
                className={`${textareaClass} resize-y`}
                maxLength={5000}
                aria-invalid={Boolean(fieldErrors.description)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category" htmlFor="edit-category">
                <select
                  id="edit-category"
                  name="category"
                  value={draft.category}
                  onChange={updateDraft}
                  className={selectClass}
                >
                  {ideaCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Target audience"
                htmlFor="edit-audience"
                hint="Who is this mainly for?"
              >
                <input
                  id="edit-audience"
                  name="targetAudience"
                  type="text"
                  value={draft.targetAudience}
                  onChange={updateDraft}
                  className={inputClass}
                  maxLength={120}
                />
              </FormField>
            </div>

            {error && <ErrorState message={error} />}

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  setFieldErrors({});
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{idea.category || DEFAULT_CATEGORY}</Badge>
              {idea.targetAudience && (
                <Badge tone="neutral">
                  <Target className="h-3.5 w-3.5" aria-hidden="true" />
                  {idea.targetAudience}
                </Badge>
              )}
              <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <time dateTime={idea.createdAt || undefined}>
                  {formatDate(idea.createdAt)}
                </time>
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {idea.title}
            </h1>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-fg-muted sm:text-base">
              {idea.description}
            </p>

            {wasUpdated && (
              <p className="mt-3 text-xs text-fg-subtle">
                Updated {formatRelativeTime(idea.updatedAt)}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:flex-wrap">
              <Button variant="outline" onClick={startEditing}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit details
              </Button>
              <Button
                variant="secondary"
                onClick={handleAnalyzeAgain}
                loading={reAnalyzing}
                disabled={dailyBlocked || saving || retryCooldown > 0}
              >
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                {analyzeLabel}
              </Button>
              <Button
                variant="danger-outline"
                onClick={() => {
                  setDeleteError("");
                  setConfirmingDelete(true);
                }}
                className="sm:ml-auto"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>

      {!isEditing && error && (
        <div className="mt-4">
          <ErrorState message={error} />
        </div>
      )}

      {!isEditing && (
        <div className="mt-4">
          <AIAnalysisFeedback
            error={aiError}
            remaining={aiStatus?.remaining}
            onRetry={handleAnalyzeAgain}
            retryCooldown={retryCooldown}
          />
        </div>
      )}

      {!isEditing && (
        <section className="mt-8" aria-labelledby="saved-analysis-heading">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="saved-analysis-heading"
                className="text-xl font-semibold tracking-tight text-fg"
              >
                AI analysis
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                A seven-part draft generated from this idea. Treat it as a
                starting point, not verified research.
              </p>
            </div>
            <Badge tone={analyzed ? "success" : "neutral"}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {analyzed ? "Analysis saved" : "No analysis yet"}
            </Badge>
          </div>

          {reAnalyzing && (
            <div className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-card">
              <LoadingState
                message="Refreshing the analysis. Your current analysis stays saved until the new one succeeds..."
                variant="lines"
                count={3}
              />
            </div>
          )}

          <AIAnalysis analysis={idea.aiAnalysis} />
        </section>
      )}

      <Modal
        open={confirmingDelete}
        onClose={closeDeleteModal}
        title="Delete this idea?"
        description={`"${idea.title}" and its saved AI analysis will be permanently removed.`}
        footer={
          <>
            <Button variant="outline" onClick={closeDeleteModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete idea
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm leading-6 text-fg-muted">
            This action cannot be undone. You can always create and analyze the
            idea again later.
          </p>
          {deleteError && <ErrorState message={deleteError} />}
        </div>
      </Modal>
    </div>
  );
}
