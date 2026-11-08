import IdeaCard from "./IdeaCard";
import EmptyState from "./EmptyState";

/*
  IdeaList Ã¢â‚¬â€ renders the grid of IdeaCard items on the Dashboard.
  Shows appropriate empty states when the user has no ideas or
  when a search/filter returns no results.
*/

export default function IdeaList({ ideas, isFiltering }) {
  if (ideas.length === 0) {
    if (isFiltering) {
      return (
        <EmptyState
          title="No ideas match your search"
          message="Try a different keyword or clear the category filter."
        />
      );
    }
    return (
      <EmptyState
        title="No ideas yet"
        message="Create your first idea and get an AI-powered breakdown in seconds."
        actionLabel="+ Create New Idea"
        actionTo="/create"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <IdeaCard key={idea._id} idea={idea} />
      ))}
    </div>
  );
}
