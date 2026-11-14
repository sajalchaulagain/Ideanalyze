import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  LogOut,
  Mail,
  Pencil,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIdeas } from "../context/IdeasContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import { inputClass } from "../components/ui/formStyles";
import { formatDate, hasAnalysis } from "../lib/format";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { ideas } = useIdeas();
  const { showToast } = useToast();

  useDocumentMeta("Profile · Ideanalyze AI", "Manage your account details and saved ideas.");

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const analyzed = ideas.filter((idea) => hasAnalysis(idea.aiAnalysis)).length;
  const categories = new Set(ideas.map((idea) => idea.category).filter(Boolean))
    .size;
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const startEditing = () => {
    setNameDraft(user?.name || "");
    setNameError("");
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNameError("");
    setError("");
  };

  const handleSave = async (event) => {
    event?.preventDefault?.();
    if (savingProfile) return;

    const name = nameDraft.trim();
    if (!name) {
      setNameError("Your display name cannot be empty.");
      return;
    }

    setNameError("");
    setError("");
    setSavingProfile(true);
    try {
      await updateProfile({ name });
      setIsEditing(false);
      showToast("Profile updated.", "success");
    } catch (err) {
      setError(err.message || "Could not update your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Signed out of your workspace.", "info");
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
          Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-fg-muted">
          Manage your account details and review what you have saved.
        </p>
      </div>

      <Card className="mt-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-semibold text-white shadow-card">
            {initial}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight text-fg">
              {user?.name || "Builder"}
            </h2>
            <p className="mt-0.5 truncate text-sm text-fg-muted">
              {user?.email || "Signed in"}
            </p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              onClick={startEditing}
              className="sm:ml-auto"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit profile
            </Button>
          )}
        </div>

        <dl className="mt-6 grid gap-3 rounded-xl border border-border bg-surface-muted p-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-fg-subtle">
                Email
              </dt>
              <dd className="mt-0.5 break-all font-medium text-fg">
                {user?.email || "Not available"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-fg-subtle">
                Member since
              </dt>
              <dd className="mt-0.5 font-medium text-fg">
                {user?.createdAt ? formatDate(user.createdAt) : "Recently"}
              </dd>
            </div>
          </div>
        </dl>

        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 border-t border-border pt-6" noValidate>
            <FormField
              label="Display name"
              htmlFor="profile-name"
              required
              error={nameError}
              hint="This is the name shown in your workspace."
            >
              <input
                id="profile-name"
                type="text"
                value={nameDraft}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  setNameError("");
                  setError("");
                }}
                className={inputClass}
                maxLength={80}
                autoComplete="name"
                aria-invalid={Boolean(nameError)}
              />
            </FormField>

            {error && (
              <div className="mt-4">
                <ErrorState message={error} />
              </div>
            )}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={cancelEditing} disabled={savingProfile}>
                Cancel
              </Button>
              <Button type="submit" loading={savingProfile}>
                <Save className="h-4 w-4" aria-hidden="true" />
                Save changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-card">
          <p className="text-2xl font-semibold tracking-tight text-fg">
            {ideas.length}
          </p>
          <p className="mt-1 text-xs font-medium text-fg-subtle">Ideas saved</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-card">
          <p className="text-2xl font-semibold tracking-tight text-fg">
            {analyzed}
          </p>
          <p className="mt-1 text-xs font-medium text-fg-subtle">
            AI analyses
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-card">
          <p className="text-2xl font-semibold tracking-tight text-fg">
            {categories}
          </p>
          <p className="mt-1 text-xs font-medium text-fg-subtle">Categories</p>
        </div>
      </div>

      <Card className="mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-fg">Ideanalyze AI</h2>
            <p className="mt-1 text-xs leading-5 text-fg-muted">
              Designed &amp; developed by{" "}
              <span className="font-semibold text-fg">
                Sajal Chaulagain (Mr. Chaule)
              </span>
              .
            </p>
          </div>
        </div>
        <a
          href="https://sajalchaulagain.com.np/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border-strong bg-surface px-4 text-sm font-semibold text-fg transition-colors hover:bg-surface-muted"
        >
          Portfolio
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </Card>

      <Card className="mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-fg-muted">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-fg">Session</h2>
            <p className="mt-1 text-xs leading-5 text-fg-muted">
              Sign out of this device. Your saved ideas stay in your account.
            </p>
          </div>
        </div>
        <Button variant="danger-outline" onClick={handleLogout} className="shrink-0">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </Button>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-xs text-fg-subtle">
        <Badge tone="success">Private workspace</Badge>
        <span>Only you can see your ideas and analyses.</span>
      </div>
    </div>
  );
}
