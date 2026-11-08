import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import AIAnalysis from "../components/AIAnalysis";
import { mockAnalysis } from "../data/mockAnalysis";

const features = [
  {
    title: "Structured breakdowns",
    text: "Every idea becomes a clear plan: problem, solution, target users, features, and tech stack  ready to build or pitch.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Hackathon-ready output",
    text: "Get a scoped MVP, suggested stack, and honest risks  exactly what judges and teammates look for.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "All ideas in one place",
    text: "Save, search, and revisit every analysis from your personal dashboard. Your startup notebook, upgraded.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "1",
    title: "Describe your idea",
    text: "Write a few sentences about the problem you want to solve and who it helps.",
  },
  {
    number: "2",
    title: "AI analyzes it",
    text: "Ideanalyze AI processes your idea and structures the response into clear, actionable sections.",
  },
  {
    number: "3",
    title: "Build with clarity",
    text: "Save the breakdown, share it with teammates, and start building your MVP with confidence.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-800 transition-colors duration-300 dark:bg-surface-900 dark:text-surface-700">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface-700/80 via-transparent to-transparent dark:from-accent-600/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:px-8">
          
          {/* Developer badge */}
          <a
            href="https://sajalchaulagain.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-accent-300 bg-text-hi/90 px-4 py-1.5 text-xs font-semibold text-accent-500 shadow-xs transition-all hover:border-accent-300 hover:shadow-md dark:border-accent-600 dark:bg-surface-800/90 dark:text-accent-300"
          >
            <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
            Designed & Developed by Sajal Chaulagain (Mr. Chaule) 
          </a>

          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-surface-800 sm:text-5xl lg:text-6xl dark:text-text-hi">
            Turn rough ideas into <span className="bg-gradient-to-r from-accent-500 to-accent-500 bg-clip-text text-transparent dark:from-accent-300 dark:to-accent-300">structured plans</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-text-mid dark:text-surface-600">
            Describe your startup or project idea in plain words. Ideanalyze AI breaks it
            down into problem statement, solution, target users, features, tech stack, and future roadmaps.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button size="lg">Start Building  it&apos;s free</Button>
            </Link>
            <a href="#example">
              <Button size="lg" variant="outline">See an example</Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-text-lo dark:text-text-mid">No credit card required  Free developer quota available</p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-800 dark:text-text-hi">Everything you need to evaluate an idea</h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-mid dark:text-text-mid">
            Stop keeping ideas scattered. Analyze each one into a structured plan you can act on.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`animate-fade-up rounded-2xl border border-surface-600/80 bg-text-hi p-6 shadow-xs transition-all duration-300 hover:shadow-md animate-delay-${index + 1} dark:border-surface-700 dark:bg-surface-800/80`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-500 to-accent-500 text-text-hi shadow-md shadow-accent-500/20">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-surface-800 dark:text-text-hi">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-mid dark:text-text-mid">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-surface-600/80 bg-surface-700/50 transition-colors duration-300 dark:border-surface-700 dark:bg-surface-800/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-surface-800 dark:text-text-hi">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-text-mid dark:text-text-mid">From a single sentence to a structured plan in seconds.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-surface-600/80 bg-text-hi p-6 shadow-xs dark:border-surface-700 dark:bg-surface-800/80">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-600 text-base font-bold text-accent-500 dark:bg-accent-600 dark:text-accent-300">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-surface-800 dark:text-text-hi">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-mid dark:text-text-mid">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE ANALYSIS */}
      <section id="example" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-800 dark:text-text-hi">See what an analysis looks like</h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-mid dark:text-text-mid">
            Example input: <em>&ldquo;An AI system that helps Kathmandu manage waste collection.&rdquo;</em>
          </p>
        </div>
        <div className="mt-8">
          <AIAnalysis analysis={mockAnalysis} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-surface-800 via-accent-600 to-surface-800 px-6 py-14 text-center shadow-xl sm:px-12 border border-surface-700">
          <h2 className="text-3xl font-bold tracking-tight text-text-hi">Have an idea worth building?</h2>
          <p className="mx-auto mt-3 max-w-xl text-surface-600">
            Create a free account and run your first AI analysis in less than a minute.
          </p>
          <Link to="/signup" className="mt-8 inline-block">
            <Button size="lg">Start Building</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
