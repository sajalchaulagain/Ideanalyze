function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-surface-600/80 bg-text-hi p-5 shadow-xs transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/90">
      <h3 className="text-xs font-bold uppercase tracking-wider text-accent-500 dark:text-accent-300">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-surface-600 dark:text-surface-600">{children}</div>
    </section>
  );
}

export default function AIAnalysis({ analysis }) {
  if (!analysis) {
    return (
      <p className="rounded-2xl border border-dashed border-surface-600 bg-text-hi p-6 text-center text-sm text-text-lo dark:border-surface-700 dark:bg-surface-800 dark:text-text-mid">
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
                className="rounded-lg bg-surface-800 px-2.5 py-1 text-xs font-semibold text-text-hi dark:bg-accent-600 dark:text-accent-300 dark:border dark:border-accent-600"
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
