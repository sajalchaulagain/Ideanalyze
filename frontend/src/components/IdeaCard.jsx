import { Link } from "react-router-dom";
import { Check, Sparkles, Target } from "lucide-react";
import Badge from "./ui/Badge";
import { DEFAULT_CATEGORY } from "../data/ideaCategories";
import { formatRelativeTime, hasAnalysis } from "../lib/format";

export default function IdeaCard({ idea }) {
  const analyzed = hasAnalysis(idea.aiAnalysis);

  return (
    <Link
      to={`/idea/${idea._id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-brand-300 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{idea.category || DEFAULT_CATEGORY}</Badge>
        <time
          dateTime={idea.createdAt || undefined}
          className="ml-auto text-xs font-medium text-fg-subtle"
        >
          {formatRelativeTime(idea.createdAt)}
        </time>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-6 tracking-tight text-fg transition-colors group-hover:text-accent">
        {idea.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-fg-muted">
        {idea.description}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4 text-xs">
        {idea.targetAudience && (
          <span className="flex min-w-0 items-center gap-1.5 text-fg-subtle">
            <Target className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span className="truncate">{idea.targetAudience}</span>
          </span>
        )}
        <span
          className={`ml-auto inline-flex items-center gap-1.5 font-semibold ${
            analyzed ? "text-success-ink" : "text-fg-subtle"
          }`}
        >
          {analyzed ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              AI analyzed
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              No analysis yet
            </>
          )}
        </span>
      </div>
    </Link>
  );
}
