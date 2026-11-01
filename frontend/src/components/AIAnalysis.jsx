function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/90">
      <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default function AIAnalysis({ analysis }) {
  if (!analysis) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No AI analysis available for this idea yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Problem">{analysis.problem}</Section>
        <Section title="Proposed Solution">{analysis.solution}</Section>
      </div>

      <Section title="Target Users">{analysis.targetUsers}</Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Key Features">
          <ul className="list-disc space-y-1.5 pl-5">
            {analysis.features?.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </Section>

        <Section title="Suggested Tech Stack">
          <div className="flex flex-wrap gap-2">
            {analysis.techStack?.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-indigo-950 dark:text-indigo-200 dark:border dark:border-indigo-800"
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Possible Challenges">{analysis.challenges}</Section>
        <Section title="Future Improvements">{analysis.futureImprovements}</Section>
      </div>
    </div>
  );
}
