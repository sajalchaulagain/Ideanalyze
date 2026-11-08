import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIdeas } from "../context/IdeasContext";
import { analyzeIdeaWithAI, getAIStatus } from "../service/api";
import IdeaInput from "../components/IdeaInput";
import AIAnalysis from "../components/AIAnalysis";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import Button from "../components/Button";
import AIAnalysisFeedback from "../components/AIAnalysisFeedback";

const emptyForm = { title: "", description: "", category: "", targetAudience: "" };

export default function CreateIdea() {
  const navigate = useNavigate();
  const { addIdea, saving } = useIdeas();

  const [form, setForm] = useState(emptyForm);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
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

  const handleAnalyze = async (event) => {
    event?.preventDefault?.();
    setError("");
    setAIError(null);

    if (dailyBlocked || !form.title.trim() || !form.description.trim()) {
      if (dailyBlocked) return;
      setError("Please give your idea a title and a short description first.");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeIdeaWithAI({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        targetAudience: form.targetAudience.trim(),
      });
      setAnalysis(result);
    } catch (err) {
      setAIError(err);
      if (err.code === "AI_RATE_LIMITED") setRetryCooldown(60);
      if (err.code === "AI_DAILY_LIMIT") setDailyResetAt(err.resetsAt || null);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    setError("");
    try {
      const saved = await addIdea({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "General",
        targetAudience: form.targetAudience.trim() || "Not specified",
        aiAnalysis: analysis,
        createdAt: new Date().toISOString(),
      });
      navigate(`/idea/${saved._id}`);
    } catch {
      setError("Could not save the idea. Please try again.");
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setAnalysis(null);
    setError("");
    setAIError(null);
    setDailyResetAt(null);
    setRetryCooldown(0);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Create a new idea</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Describe your idea below and get a structured AI breakdown in seconds.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors duration-300 sm:p-7 dark:border-slate-800 dark:bg-slate-900/90">
        <AIAnalysisFeedback error={aiError} remaining={aiStatus?.remaining} onRetry={handleAnalyze} retryCooldown={retryCooldown} />
        <IdeaInput form={form} onChange={setForm} onSubmit={handleAnalyze} loading={analyzing} disabled={dailyBlocked} />
        {error && !analysis && <div className="mt-4"><ErrorState message={error} /></div>}
      </div>

      {analyzing && (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <LoadingState message="Ideanalyze AI is structuring problem, solution, features & tech stack..." />
        </div>
      )}

      {!analyzing && analysis && (
        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ideanalyze AI Result</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleReset}>Start over</Button>
              <Button variant="secondary" onClick={handleAnalyze}>Analyze again</Button>
              <Button onClick={handleSave} loading={saving}>Save idea</Button>
            </div>
          </div>
          {error && <div className="mb-4"><ErrorState message={error} /></div>}
          <AIAnalysis analysis={analysis} />
        </div>
      )}
    </div>
  );
}
