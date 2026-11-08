import { Link } from "react-router-dom";

export default function IdeaCard({ idea }) {
  const formattedDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/idea/${idea._id}`}
      className="group block rounded-2xl border border-surface-600/80 bg-text-hi p-5 shadow-xs transition-all duration-300 hover:border-accent-300 hover:shadow-md dark:border-surface-700 dark:bg-surface-800/90 dark:hover:border-accent-500"
    >
      <div className="flex flex-wrap items-center gap-2">
        {idea.category && (
          <span className="rounded-full bg-surface-700 px-2.5 py-1 text-xs font-semibold text-accent-500 dark:bg-accent-600 dark:text-accent-300">
            {idea.category}
          </span>
        )}
        <time className="ml-auto text-xs text-text-mid dark:text-text-lo">{formattedDate}</time>
      </div>
      <h3 className="mt-2 text-base font-semibold text-surface-800 transition-colors group-hover:text-accent-500 dark:text-text-hi dark:group-hover:text-accent-300">
        {idea.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-mid dark:text-text-mid">
        {idea.description}
      </p>
      {idea.targetAudience && (
        <p className="mt-3 text-xs text-text-mid dark:text-text-lo">
          Target: <span className="font-medium text-surface-600 dark:text-surface-600">{idea.targetAudience}</span>
        </p>
      )}
    </Link>
  );
}
