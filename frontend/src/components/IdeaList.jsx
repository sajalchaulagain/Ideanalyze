import IdeaCard from "./IdeaCard";
import EmptyState from "./EmptyState";

/*
  IdeaList renders the grid of saved ideas on the dashboard. It distinguishes
  between a workspace with no ideas and a search/filter with no matches so the
  empty state always offers the right next step.
*/
export default function IdeaList({ ideas, isFiltering, onClearFilters }) {
  if (ideas.length === 0) {
    if (isFiltering) {
      return (
        <EmptyState
          title="No ideas match those filters"
          message="Try a different keyword, or clear the filters to see everything in your workspace."
          actionLabel="Clear filters"
          onAction={onClearFilters}
        />
      );
    }

    return (
      <EmptyState
        title="Start with one idea"
        message="Describe a problem you want to solve and Ideanalyze AI will turn it into a structured, seven-part starting point."
        actionLabel="Create your first idea"
        actionTo="/create"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard key={idea._id} idea={idea} />
      ))}
    </div>
  );
}
