# Ideanalyze AI

Ideanalyze AI helps founders turn rough product ideas into clear, testable opportunities. Describe an idea, receive a focused analysis, and keep the thinking organized in one private workspace.

## Features

### Idea workspace

Create, edit, browse, and revisit ideas from a focused dashboard. Each idea remains tied to its authenticated owner.

### AI analysis

Generate a structured seven-part breakdown covering the problem, proposed solution, target users, key features, suggested tech stack, possible challenges, and future improvements. AI output is clearly labelled as a draft, and saved analyses are only replaced after a new analysis succeeds.

### Honest feedback

Analysis errors explain whether the provider is busy or today's free allowance is exhausted, with retry and reset guidance where appropriate.

### Private by default

Protected routes, signed sessions, ownership checks, and server-side AI credentials keep personal work out of the browser's reach.

### Responsive console

The interface is designed for quick capture on a phone and precise review on a large screen, with keyboard-friendly controls and clear loading states.

## Technology

Ideanalyze AI uses a React and Vite frontend, an Express API, Supabase persistence, and an OpenAI-compatible AI provider. Tailwind CSS supplies the interface primitives, while the API owns validation, authentication, and provider safety.

## Deployment

See [docs/DEPLOY.md](docs/DEPLOY.md).
