import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  RotateCw,
  Save,
  Sparkles,
  Target,
} from "lucide-react";
import { useIdeas } from "../context/IdeasContext";
import { useToast } from "../context/ToastContext";
import { analyzeIdeaWithAI, getAIStatus } from "../service/api";
import AIAnalysis from "../components/AIAnalysis";
import AIAnalysisFeedback from "../components/AIAnalysisFeedback";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import Badge from "../components/ui/Badge";
import FormField from "../components/ui/FormField";
import {
  inputClass,
  selectClass,
  textareaClass,
} from "../components/ui/formStyles";
import { DEFAULT_CATEGORY, ideaCategories } from "../data/ideaCategories";
import { useRetryCooldown } from "../hooks/useRetryCooldown";
import { hasAnalysis, nextUtcMidnightIso } from "../lib/format";

const MIN_DESCRIPTION = 20;

const emptyForm = {
  title: "",
  description: "",
  category: DEFAULT_CATEGORY,
  targetAudience: "",
};

export default function CreateIdea() {
  const navigate = useNavigate();
  const { addIdea, saving } = useIdeas();
  const { showToast } = useToast();
  const { retryCooldown, startCooldown, resetCooldown } = useRetryCooldown();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [analyzedInputs, setAnalyzedInputs] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
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

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) next.title = "Give your idea a short, clear title.";
    else if (title.length > 120)
      next.title = "Keep the title under 120 characters.";

    if (!description) next.description = "Describe the idea in a sentence or two.";
    else if (description.length < MIN_DESCRIPTION)
      next.description = `Add at least ${MIN_DESCRIPTION} characters so the AI has enough context.`;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const refreshStatus = () => {
    getAIStatus().then((status) => {
      if (status) setAIStatus(status);
    });
  };

  const handleAnalyze = async (event) => {
    event?.preventDefault?.();
    if (analyzing || dailyBlocked) return;

    setError("");
    setAIError(null);
    if (!validate()) return;

    const inputs = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category || DEFAULT_CATEGORY,
      targetAudience: form.targetAudience.trim() || "Not specified",
    };

    setAnalyzing(true);
    try {
      const result = await analyzeIdeaWithAI(inputs);
      if (!hasAnalysis(result)) {
        const empty = new Error(
          "The AI returned an empty analysis. Please try again."
        );
        empty.code = "AI_EMPTY_RESULT";
        throw empty;
      }
      setAnalysis(result);
      setAnalyzedInputs(inputs);
      resetCooldown();
      showToast("AI analysis ready. Review it, then save your idea.", "success");
      refreshStatus();
    } catch (err) {
      setAIError(err);
      if (err.code === "AI_RATE_LIMITED") {
        startCooldown(err.retryAfter || 60);
      }
      if (err.code === "AI_DAILY_LIMIT") {
        setDailyResetAt(err.resetsAt || nextUtcMidnightIso());
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const save = async (payload, message) => {
    setError("");
    try {
      const saved = await addIdea(payload);
      showToast(message, "success");
      navigate(`/idea/${saved._id}`);
    } catch (err) {
      const failure = err.message || "Could not save the idea. Please try again.";
      setError(failure);
      showToast(failure, "error");
    }
  };

  const handleSave = () => {
    if (!analysis || !analyzedInputs || saving) return;
    save({ ...analyzedInputs, aiAnalysis: analysis }, "Idea saved to your workspace.");
  };

  const handleSaveWithoutAnalysis = () => {
    if (saving || analyzing) return;
    if (!validate()) return;
    save(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || DEFAULT_CATEGORY,
        targetAudience: form.targetAudience.trim() || "Not specified",
      },
      "Draft saved without an AI analysis."
    );
  };

  const handleEditDetails = () => {
    setAnalysis(null);
    setAnalyzedInputs(null);
    setAIError(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setForm(emptyForm);
    setErrors({});
    setAnalysis(null);
    setAnalyzedInputs(null);
    setError("");
    setAIError(null);
    setDailyResetAt(null);
    resetCooldown();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/dashboard"
        className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-fg-muted transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
          New idea
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Create an idea
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-fg-muted">
          Describe the problem and who it affects. Ideanalyze AI will turn it
          into a seven-part starting point you can save and refine.
        </p>
      </div>

      {!analysis && (
        <>
          <div className="mt-5">
            <AIAnalysisFeedback
              error={aiError}
              remaining={aiStatus?.remaining}
              onRetry={handleAnalyze}
              retryCooldown={retryCooldown}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
            <form onSubmit={handleAnalyze} className="space-y-5" noValidate>
              <div>
                <h2 className="text-base font-semibold text-fg">Idea details</h2>
                <p className="mt-1 text-sm text-fg-muted">
                  The more specific the description, the more useful the
                  analysis.
                </p>
              </div>

              <FormField
                label="Title"
                htmlFor="idea-title"
                required
                error={errors.title}
              >
                <input
                  id="idea-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="e.g. Smart waste collection for Kathmandu"
                  maxLength={120}
                  aria-invalid={Boolean(errors.title)}
                />
              </FormField>

              <FormField
                label="Description"
                htmlFor="idea-description"
                required
                error={errors.description}
                hint={`At least ${MIN_DESCRIPTION} characters. Cover the problem, who has it, and how your idea helps.`}
              >
                <textarea
                  id="idea-description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={5}
                  className={`${textareaClass} resize-y`}
                  placeholder="What problem are you solving, and why does it matter?"
                  maxLength={5000}
                  aria-invalid={Boolean(errors.description)}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Category" htmlFor="idea-category">
                  <select
                    id="idea-category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
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
                  htmlFor="idea-audience"
                  hint="Optional. Who is this mainly for?"
                >
                  <input
                    id="idea-audience"
                    name="targetAudience"
                    type="text"
                    value={form.targetAudience}
                    onChange={updateField}
                    className={inputClass}
                    placeholder="e.g. Students, municipal teams"
                    maxLength={120}
                  />
                </FormField>
              </div>

              {error && <ErrorState message={error} />}

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  disabled={analyzing || saving}
                >
                  Reset
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={handleSaveWithoutAnalysis}
                    loading={saving}
                    disabled={analyzing}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save without AI
                  </Button>
                  <Button
                    type="submit"
                    loading={analyzing}
                    disabled={dailyBlocked || saving}
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {dailyBlocked ? "Daily AI limit reached" : "Analyze with AI"}
                  </Button>
                </div>
              </div>
            </form>

            {analyzing && (
              <div className="mt-5 border-t border-border pt-5">
                <LoadingState
                  message="Ideanalyze AI is structuring the problem, solution, features, and next steps..."
                  variant="lines"
                  count={4}
                />
              </div>
            )}
          </div>
        </>
      )}

      {analysis && analyzedInputs && (
        <section className="mt-6 animate-fade-up" aria-labelledby="analysis-heading">
          <AIAnalysisFeedback
            error={aiError}
            remaining={aiStatus?.remaining}
            onRetry={handleAnalyze}
            retryCooldown={retryCooldown}
          />

          <div className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
            <Badge tone="accent">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Analysis ready
            </Badge>
            <h2
              id="analysis-heading"
              className="mt-3 text-xl font-semibold tracking-tight text-fg"
            >
              {analyzedInputs.title}
            </h2>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-fg-muted">
              {analyzedInputs.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="neutral">{analyzedInputs.category}</Badge>
              <Badge tone="neutral">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
                {analyzedInputs.targetAudience}
              </Badge>
            </div>

            {error && (
              <div className="mt-4">
                <ErrorState message={error} />
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:flex-wrap">
              <Button onClick={handleSave} loading={saving} disabled={analyzing}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save idea
              </Button>
              <Button
                variant="outline"
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={dailyBlocked || saving || retryCooldown > 0}
              >
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                {retryCooldown > 0 && aiError?.code === "AI_RATE_LIMITED"
                  ? `Retry in ${retryCooldown}s`
                  : "Analyze again"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleEditDetails}
                disabled={saving || analyzing}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit details
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <AIAnalysis analysis={analysis} />
          </div>
        </section>
      )}
    </div>
  );
}
