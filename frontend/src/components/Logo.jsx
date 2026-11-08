import { useState } from "react";

export default function Logo({ className = "h-8 w-8", imageClassName = "", ...props }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className={`${className} inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 text-xs font-bold text-text-hi`} aria-label="Ideanalyze AI">IA</span>;
  }

  return <img src="/logo.svg" alt="Ideanalyze AI" className={`${className} ${imageClassName}`} onError={() => setFailed(true)} {...props} />;
}
