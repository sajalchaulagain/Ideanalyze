import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Layers3,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useIdeas } from "../context/IdeasContext";
import Button from "../components/Button";
import IdeaList from "../components/IdeaList";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { ideaCategories } from "../data/ideaCategories";
import { inputClass, selectClass } from "../components/ui/formStyles";
import { hasAnalysis } from "../lib/format";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const statStyles =
  "rounded-2xl border border-border bg-surface p-4 shadow-card";

export default function Dashboard() {
  const { user } = useAuth();
  useDocumentMeta("Your ideas · Ideanalyze AI", "All your saved ideas and analyses.");

  const {
    ideas,
    loadingIdeas,
    ideasLoaded,
    ideasError,
    reloadIdeas,
  } = useIdeas();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ideas.filter((idea) => {
      const matchesQuery =
        !query ||
        `${idea.title || ""} ${idea.description || ""}`
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        !categoryFilter || idea.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [ideas, search, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: ideas.length,
      analyzed: ideas.filter((idea) => hasAnalysis(idea.aiAnalysis)).length,
      categories: new Set(
        ideas.map((idea) => idea.category).filter(Boolean)
      ).size,
    }),
    [ideas]
  );

  const filtering = Boolean(search.trim() || categoryFilter);
  const showSkeleton = loadingIdeas && !ideasLoaded;
  const showFatalError = Boolean(ideasError) && ideas.length === 0;
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Builder";

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">
            Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-fg-muted">
            Pick up a saved plan, search your workspace, or turn the next rough
            idea into something testable.
          </p>
        </div>
        <Link to="/create" className="shrink-0">
          <Button size="lg">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create idea
          </Button>
        </Link>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className={statStyles}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
              Ideas saved
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-fg-muted">
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">
            {stats.total === 1 ? "One idea in your workspace" : "In your private workspace"}
          </p>
        </div>

        <div className={statStyles}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
              AI analyzed
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {stats.analyzed}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">
            {stats.total === 0
              ? "Run your first analysis"
              : `${Math.round((stats.analyzed / stats.total) * 100)}% of saved ideas`}
          </p>
        </div>

        <div className={statStyles}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
              Categories
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-fg-muted">
              <Layers3 className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {stats.categories}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">
            {stats.categories === 1 ? "One area explored" : "Areas explored so far"}
          </p>
        </div>
      </div>

      {ideasError && ideas.length > 0 && (
        <div className="mt-5">
          <ErrorState
            message={ideasError}
            onRetry={reloadIdeas}
            retryLabel="Reload ideas"
            retryDisabled={loadingIdeas}
          />
        </div>
      )}

      <div className="mt-7 rounded-2xl border border-border bg-surface p-3 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="idea-search" className="sr-only">
              Search ideas
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
              aria-hidden="true"
            />
            <input
              id="idea-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description"
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="sm:w-60">
            <label htmlFor="category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={selectClass}
            >
              <option value="">All categories</option>
              {ideaCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {filtering && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-fg">
          {filtering
            ? `${filtered.length} matching idea${filtered.length === 1 ? "" : "s"}`
            : "Your ideas"}
        </h2>
        {!filtering && stats.total > 0 && (
          <p className="text-xs text-fg-subtle">
            Sorted by most recently created
          </p>
        )}
      </div>

      {showSkeleton ? (
        <LoadingState message="Loading your saved ideas..." variant="cards" count={3} />
      ) : showFatalError ? (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <ErrorState
            message={ideasError}
            onRetry={reloadIdeas}
            retryLabel="Try loading again"
            retryDisabled={loadingIdeas}
          />
        </div>
      ) : (
        <IdeaList
          ideas={filtered}
          isFiltering={filtering}
          onClearFilters={clearFilters}
        />
      )}
    </div>
  );
}
