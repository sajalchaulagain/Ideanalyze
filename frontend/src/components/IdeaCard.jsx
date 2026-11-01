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
      className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500"
    >
      <div className="flex flex-wrap items-center gap-2">
        {idea.category && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {idea.category}
          </span>
        )}
        <time className="ml-auto text-xs text-slate-400 dark:text-slate-500">{formattedDate}</time>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
        {idea.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {idea.description}
      </p>
      {idea.targetAudience && (
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Target: <span className="font-medium text-slate-700 dark:text-slate-300">{idea.targetAudience}</span>
        </p>
      )}
    </Link>
  );
}
