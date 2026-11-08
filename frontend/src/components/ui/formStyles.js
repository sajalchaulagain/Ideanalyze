/*
  Shared form styling. Keeping these strings in one place prevents inputs,
  selects and textareas from drifting apart across pages.
*/
export const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-fg shadow-xs transition-colors placeholder:text-fg-subtle focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClass = `${inputClass} py-3 leading-6`;

export const selectClass = `${inputClass} cursor-pointer pr-10`;

export const labelClass = "block text-sm font-medium text-fg";

export const hintClass = "mt-1.5 block text-xs leading-5 text-fg-subtle";

export const errorTextClass = "mt-1.5 block text-xs font-medium text-danger-ink";

export const cardClass =
  "rounded-2xl border border-border bg-surface shadow-card";

export const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle";
