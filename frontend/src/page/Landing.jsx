import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  PenLine,
  Route,
  Save,
  ScanSearch,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AIAnalysis from "../components/AIAnalysis";
import { mockAnalysis } from "../data/mockAnalysis";

const features = [
  {
    icon: Target,
    title: "Frame the problem",
    text: "Clarify who has the pain, why it matters, and what the idea actually changes.",
  },
  {
    icon: Layers3,
    title: "Shape the solution",
    text: "Turn a sentence into a practical product direction with features and a stack.",
  },
  {
    icon: Route,
    title: "Choose the next move",
    text: "Leave with a focused validation plan instead of a vague list of maybes.",
  },
];

const steps = [
  {
    icon: PenLine,
    title: "Describe the idea",
    text: "Write it in plain language. A title, a short description, and who it is for is enough.",
  },
  {
    icon: ScanSearch,
    title: "Review the breakdown",
    text: "Get a seven-part analysis covering the problem, users, features, risks, and more.",
  },
  {
    icon: Save,
    title: "Save and iterate",
    text: "Keep each idea in your private workspace, edit it, or run a fresh analysis.",
  },
];

const trustPoints = [
  "No credit card required",
  "Seven-part breakdown",
  "Private saved workspace",
];

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/15 via-transparent to-brand-500/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Sample output
          </span>
          <span className="text-xs font-medium text-fg-subtle">
            AI-generated draft
          </span>
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight text-fg">
          Smart waste collection for Kathmandu
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-fg-muted">
          A dashboard that predicts fill levels and suggests efficient
          collection routes.
        </p>

        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-border bg-surface-muted p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
              Problem
            </p>
            <p className="mt-1 text-sm leading-6 text-fg-muted">
              Collection teams lose time on fixed routes and delayed reports.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-muted p-3.5">
              <Target className="h-4 w-4 text-accent" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-fg">
                Municipal teams
              </p>
              <p className="mt-0.5 text-[11px] text-fg-subtle">Target users</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-3.5">
              <Layers3 className="h-4 w-4 text-accent" aria-hidden="true" />
              <p className="mt-2 text-xs font-semibold text-fg">
                7 clear sections
              </p>
              <p className="mt-0.5 text-[11px] text-fg-subtle">
                From problem to next step
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-pop sm:flex">
        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
        <span className="text-xs font-semibold text-fg">
          Ready to save and edit
        </span>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const primaryTo = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <div className="min-h-screen bg-canvas text-fg">
      <Navbar />
      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(55rem_28rem_at_50%_-8rem,color-mix(in_oklab,var(--color-brand-500)_12%,transparent),transparent)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-24 lg:px-8">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-accent shadow-card">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI-assisted idea analysis
              </p>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                Turn a rough idea into a plan you can test.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-fg-muted sm:text-lg">
                Ideanalyze AI gives founders a sharper view of the problem,
                customer, product, and next step before they spend a week
                building.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to={primaryTo}>
                  <Button size="lg" className="w-full sm:w-auto">
                    {isAuthenticated ? "Open dashboard" : "Analyze an idea"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <a
                  href="#example"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-fg transition-colors hover:bg-surface-muted"
                >
                  See an example
                </a>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-fg-subtle">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-success"
                      aria-hidden="true"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <HeroPreview />
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 border-y border-border bg-surface"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
                What you get
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                A useful first pass, not empty hype.
              </h2>
              <p className="mt-3 text-sm leading-6 text-fg-muted sm:text-base">
                Each analysis is designed to make the next conversation,
                prototype, or validation step easier to start.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-border bg-canvas p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-fg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">
                      {feature.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              From a sentence to a structured plan.
            </h2>
          </div>

          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-border bg-surface p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-fg-subtle">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-fg">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-fg-muted">
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section
          id="example"
          className="scroll-mt-24 border-y border-border bg-surface"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
                Example output
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
                See the shape of a useful analysis.
              </h2>
              <p className="mt-3 text-sm leading-6 text-fg-muted sm:text-base">
                This is a sample idea, not real market research. Use it to see
                how the seven sections fit together.
              </p>
            </div>
            <div className="mt-10">
              <AIAnalysis analysis={mockAnalysis} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 text-center shadow-pop sm:px-12 lg:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Have an idea worth testing?
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75 sm:text-base">
                Start with the sentence in your head. We will help you find the
                shape underneath it.
              </p>
              <Link
                to={isAuthenticated ? "/create" : "/signup"}
                className="mt-7 inline-block"
              >
                <Button
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-white/90"
                >
                  Start building
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
