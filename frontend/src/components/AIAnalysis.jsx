import {
  CircleAlert,
  Lightbulb,
  ListChecks,
  Rocket,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { hasAnalysis } from "../lib/format";

function asText(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function asList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function Section({ icon: Icon, title, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-5 shadow-card ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
      </div>
      <div className="mt-3 text-sm leading-6 text-fg-muted">{children}</div>
    </section>
  );
}

function TextBlock({ value }) {
  const text = asText(value);
  if (!text) {
    return <p className="italic text-fg-subtle">Not provided by the model.</p>;
  }
  return <p className="whitespace-pre-line break-words">{text}</p>;
}

function ListBlock({ value }) {
  const items = asList(value);
  if (!items.length) {
    return <p className="italic text-fg-subtle">Not provided by the model.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />
          <span className="break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TechBlock({ value }) {
  const items = asList(value);
  if (!items.length) {
    return <p className="italic text-fg-subtle">Not provided by the model.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-fg-muted"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function AIAnalysis({ analysis, compact = false }) {
  if (!hasAnalysis(analysis)) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center">
        <Sparkles
          className="mx-auto h-6 w-6 text-fg-subtle"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium text-fg">
          No AI analysis saved for this idea yet.
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          Run the analysis to generate the seven-part breakdown.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs font-medium text-fg-subtle">
        <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        AI-generated draft. Treat it as a starting point, not verified research.
      </div>

      <div
        className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}
        aria-label="AI analysis sections"
      >
        <Section icon={CircleAlert} title="Problem">
          <TextBlock value={analysis.problem} />
        </Section>
        <Section icon={Lightbulb} title="Proposed solution">
          <TextBlock value={analysis.solution} />
        </Section>
        <Section icon={Users} title="Target users">
          <TextBlock value={analysis.targetUsers} />
        </Section>
        <Section icon={ListChecks} title="Key features">
          <ListBlock value={analysis.features} />
        </Section>
        <Section icon={Wrench} title="Suggested tech stack">
          <TechBlock value={analysis.techStack} />
        </Section>
        <Section icon={ShieldAlert} title="Possible challenges">
          <TextBlock value={analysis.challenges} />
        </Section>
        <Section icon={Rocket} title="Future improvements">
          <TextBlock value={analysis.futureImprovements} />
        </Section>
      </div>
    </div>
  );
}
