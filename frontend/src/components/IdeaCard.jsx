import { Link } from "react-router-dom";
import { useState } from "react";

export default function IdeaCard({ idea }) {
  const [now] = useState(() => Date.now());
  const age = Math.max(0, now - new Date(idea.createdAt).getTime());
  const formattedDate = age < 86400000 ? `${Math.max(1, Math.floor(age / 3600000))}h ago` : `${Math.floor(age / 86400000)}d ago`;

  return (
    <Link
      to={`/idea/${idea._id}`}
      className="group block rounded-xl border border-surface-600 bg-surface-700 p-5 hover:border-accent-500/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        {idea.category && (
          <span className="rounded-full bg-surface-600 px-2.5 py-1 text-xs font-semibold text-accent-300">
            {idea.category}
          </span>
        )}
        <time className="ml-auto text-xs text-text-mid dark:text-text-lo">{formattedDate}</time>
      </div>
      <h3 className="mt-2 text-base font-semibold text-text-hi group-hover:text-accent-300">
        {idea.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-text-mid">
        {idea.description}
      </p>
      {idea.targetAudience && (
        <p className="mt-3 text-xs text-text-lo">
          Target: <span className="font-medium text-text-mid">{idea.targetAudience}</span>
        </p>
      )}
    </Link>
  );
}
