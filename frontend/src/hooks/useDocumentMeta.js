import { useEffect } from "react";

/*
  The app is a single HTML document, so the static tags in index.html are only
  the defaults. Pages call this hook to describe themselves, and navigate away
  to have the defaults restored.
*/
export const DEFAULT_TITLE =
  "Ideanalyze AI — Turn Ideas Into Structured Startup Plans";

export const DEFAULT_DESCRIPTION =
  "Turn a rough idea into a structured startup plan in seconds. Ideanalyze AI breaks any idea into problem, solution, target users, features, tech stack, challenges and next steps. Free to use.";

const MAX_DESCRIPTION = 155;
const MAX_TITLE_TEXT = 60;

/** Collapse whitespace and cut to a hard character budget, ending in an ellipsis. */
export function trimToLength(value, max = MAX_DESCRIPTION) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.length <= max) return text;

  let cut = text.slice(0, max - 1).trimEnd();
  // Never leave half of a surrogate pair (for example an emoji) behind.
  if (/[\uD800-\uDBFF]$/.test(cut)) cut = cut.slice(0, -1);
  return `${cut}…`;
}

/** Titles use the same budget, but a longer one is fine for the idea name. */
export function trimTitle(value) {
  return trimToLength(value, MAX_TITLE_TEXT);
}

function setDescription(content) {
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.setAttribute("content", content);
}

export function useDocumentMeta(
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION
) {
  useEffect(() => {
    document.title = title;
    setDescription(description);

    return () => {
      document.title = DEFAULT_TITLE;
      setDescription(DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
