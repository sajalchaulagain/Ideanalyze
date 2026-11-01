# Ideanalyze AI — Frontend

The React 19 + Vite 8 + Tailwind CSS v4 single-page app for Ideanalyze AI. It talks
to the Express API in [`../server`](../server) and is deployed as static files on
Netlify. See the [root README](../README.md) for the full-stack architecture and
deployment guide.

## Requirements

- Node.js 22
- npm 10+

## Run locally

From the repository root:

```bash
npm run install:all
npm run dev
```

The app runs at http://localhost:5173 and expects the API at
http://localhost:5000/api. To run only the frontend:

```bash
npm run dev
```

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL for all Axios requests |

Only public values belong here. API keys and other secrets live in the server
environment, never in Vite variables.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint for this package |

## Structure

```text
frontend/
├── public/
│   ├── _redirects       # SPA fallback for Netlify: /* → /index.html 200
│   └── favicon.svg
├── src/
│   ├── components/      Reusable UI
│   ├── context/         Auth, ideas, and theme providers
│   ├── layout/          Public and authenticated layouts
│   ├── page/            Route-level pages
│   ├── service/api.js   Axios instance and API calls
│   └── main.jsx         Entry point
├── index.html
└── vite.config.js
```

Routing is client-side, so the host must serve `index.html` for unknown paths.
`netlify.toml` at the repository root configures that fallback, asset caching, and
security headers.
