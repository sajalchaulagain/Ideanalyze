import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIdeas } from "../context/IdeasContext";
import Button from "../components/Button";
import IdeaList from "../components/IdeaList";
import { ideaCategories } from "../data/ideaCategories";

export default function Dashboard() {
  const { user } = useAuth();
  const { ideas } = useIdeas();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ideas.filter((idea) => {
      const matchesSearch =
        !query ||
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || idea.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [ideas, search, categoryFilter]);

  const isFiltering = search.trim() !== "" || categoryFilter !== "";
  const totalIdeas = ideas.length;
  const categoriesUsed = new Set(ideas.map((idea) => idea.category).filter(Boolean)).size;

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-800 sm:text-3xl dark:text-text-hi">
            Welcome back, {user?.name || "Builder"} Ã°Å¸â€˜â€¹
          </h1>
          <p className="mt-1 text-sm text-text-lo dark:text-text-mid">
            Here are your analyzed ideas. Pick up an existing plan or analyze a new one.
          </p>
        </div>
        <Link to="/create" className="shrink-0">
          <Button size="lg">+ Create New Idea</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-600/80 bg-text-hi p-5 shadow-xs transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/90">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-lo dark:text-text-mid">Total Ideas</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-800 dark:text-text-hi">{totalIdeas}</p>
        </div>
        <div className="rounded-2xl border border-surface-600/80 bg-text-hi p-5 shadow-xs transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/90">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-lo dark:text-text-mid">Recent Ideas</p>
          <p className="mt-2 text-3xl font-extrabold text-accent-500 dark:text-accent-300">{Math.min(totalIdeas, 3)}</p>
        </div>
        <div className="rounded-2xl border border-surface-600/80 bg-text-hi p-5 shadow-xs transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/90">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-lo dark:text-text-mid">Categories Explored</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-800 dark:text-text-hi">{categoriesUsed}</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-mid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ideas by title or descriptionÃ¢â‚¬Â¦"
            className="w-full rounded-xl border border-surface-600 bg-text-hi py-2.5 pl-10 pr-3.5 text-sm text-surface-800 placeholder:text-text-mid focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-surface-600 transition-colors dark:border-surface-700 dark:bg-surface-800 dark:text-surface-700 dark:placeholder:text-text-lo dark:focus:ring-accent-600"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-surface-600 bg-text-hi px-3.5 py-2.5 text-sm text-surface-600 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-surface-600 sm:w-56 transition-colors dark:border-surface-700 dark:bg-surface-800 dark:text-surface-600 dark:focus:ring-accent-600"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {ideaCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-surface-800 dark:text-text-hi">
          {isFiltering ? `Results (${filteredIdeas.length})` : "Your Ideas"}
        </h2>
        <IdeaList ideas={filteredIdeas} isFiltering={isFiltering} />
      </div>
    </div>
  );
}
