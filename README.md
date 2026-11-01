# Ideanalyze AI

Ideanalyze AI turns a rough startup idea into a structured, hackathon-ready plan:
problem, solution, target users, features, suggested tech stack, risks, and future
improvements. Users sign up, generate analyses with an AI provider, and save their
ideas privately — every idea query is scoped to the authenticated user.

The repository contains two deployable pieces:

- **`frontend/`** — React 19 + Vite 8 + Tailwind CSS v4 single-page app (Netlify)
- **`server/`** — Express + Mongoose + JWT REST API with an AI provider adapter (Render)

## Architecture

```text
                        ┌─────────────────────────────────────────┐
                        │              Browser (React)            │
                        │  React Router · Axios · Tailwind CSS    │
                        └───────────────┬─────────────────────────┘
                                        │ HTTPS + Bearer JWT
                       ┌────────────────▼──────────────────┐
                       │        Netlify (static host)      │
                       │  frontend/ → Vite build → dist/   │
                       │  SPA fallback: /* → /index.html   │
                       └────────────────┬──────────────────┘
                                        │ /api/* (CORS allowlist)
                       ┌────────────────▼──────────────────┐
                       │         Render (Node web)         │
                       │  server/ · Express · JWT · Helmet │
                       │  /api/auth · /api/ideas · /api/ai │
                       └───────┬───────────────────┬───────┘
                               │                   │
                  ┌────────────▼────────┐   ┌──────▼─────────────────┐
                  │  MongoDB Atlas      │   │  AI provider           │
                  │  users + ideas      │   │  Gemini or OpenAI-     │
                  │  (owner: user _id)  │   │  compatible endpoint   │
                  └─────────────────────┘   └────────────────────────┘
```

Request flow: React calls `/api/*` with `Authorization: Bearer <token>`. Express
verifies the JWT, loads the user, and filters every idea query by `req.user._id`.
MongoDB Atlas stores users and ideas; AI calls happen only server-side so no key is
ever shipped to the browser.

## Requirements

- **Node.js 22** (matches Netlify `NODE_VERSION` and Render)
- npm 10+
- MongoDB Atlas cluster (or a local MongoDB for development)

## Local setup

```bash
# 1. Install root, frontend, and server dependencies
npm run install:all

# 2. Create the API environment file
cp server/.env.example server/.env
#    Then fill in MONGO_URI, JWT_SECRET, and (optionally) AI_API_KEY.

# 3. Start frontend + API together
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

Useful individual scripts from the repository root:

| Script | What it does |
| --- | --- |
| `npm run dev` | Run the API and Vite dev server together |
| `npm run dev:frontend` | Run only Vite |
| `npm run dev:server` | Run only the API with nodemon |
| `npm run build` | Production build of `frontend/` |
| `npm run lint` | ESLint over both `frontend/` and `server/` |
| `npm run install:all` | Install dependencies in all three package locations |

The API refuses to start when `MONGO_URI` is missing or unreachable, and in
production it also refuses to start with a missing/placeholder `JWT_SECRET`. See
[`server/.env.example`](server/.env.example) for every variable.

## Deployment: Netlify + Render + MongoDB Atlas

### 1. MongoDB Atlas

1. Create a cluster and a database user.
2. Under **Network Access**, allow Render's egress IPs (or `0.0.0.0/0` for a demo).
3. Copy the connection string into `MONGO_URI`. URL-encode special characters in
   the password.

### 2. API on Render

`render.yaml` defines a single Node web service:

- Root directory: `server`
- Build: `npm install`
- Start: `npm start`
- Health check: `/api/health`
- `MONGO_URI`, `JWT_SECRET`, `AI_API_KEY`, and `CLIENT_URL` are marked `sync: false`,
  so Render prompts for them instead of storing values in the blueprint.

Set `CLIENT_URL` to the deployed Netlify origin, for example
`https://your-site.netlify.app`. Local `http://localhost:5173` is always allowed.

### 3. Frontend on Netlify

`netlify.toml` sets:

- Base directory `frontend`, build `npm run build`, publish `dist`
- Node.js 22
- SPA redirect `/* → /index.html` (200)
- Immutable caching for `/assets/*` and revalidation for `/index.html`
- Basic security headers

Add the API origin as a Netlify environment variable (or leave the default for
local development), then deploy the repository root. Do not put any API keys in
Netlify — only the public API base URL belongs in the browser build.

| Netlify variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `https://ideanalyze-api.onrender.com/api` | API base URL used by Axios |

## Environment variables

### Server (`server/.env` locally, Render environment in production)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | Production | `development` | `production` disables Mongoose auto-indexing and enables startup safety checks |
| `PORT` | No | `5000` | HTTP port; Render supplies this automatically |
| `MONGO_URI` | Yes | — | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | — | Long random secret used to sign JWTs; placeholders are rejected in production |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime (jsonwebtoken duration syntax) |
| `CLIENT_URL` | Production | `http://localhost:5173` | Comma-separated CORS allowlist of frontend origins |
| `AI_BASE_URL` | Conditional | — | OpenAI-compatible base URL; required for `sk-` keys |
| `AI_API_KEY` | For AI | — | Gemini key or provider key; never exposed to the browser |
| `AI_MODEL` | No | `gemini-flash-lite-latest` | Provider model ID, or a full endpoint URL in legacy setups |
| `AI_MODEL_NAME` | No | `gpt-3.5-turbo` | Model used when `AI_MODEL` is a full URL |

`AI_BASE_URL` and a Gemini key cannot both be absent: without them the AI endpoint
returns `503 AI not configured` and no key is sent to a third party.

### Frontend (Netlify / `frontend/.env`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | Production | `http://localhost:5000/api` | Public base URL for the API |

## API surface

All successful responses use `{ success: true, data: { ... } }`. Errors use
`{ success: false, message }`.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Liveness/DB readiness (`200` connected, `503` degraded) |
| `POST` | `/api/auth/signup` | No | Create account → `{ user, token }` |
| `POST` | `/api/auth/login` | No | Log in → `{ user, token }` |
| `GET` | `/api/auth/me` | Yes | Current user |
| `GET` | `/api/ideas` | Yes | List the current user's ideas |
| `POST` | `/api/ideas` | Yes | Create an idea |
| `GET` | `/api/ideas/:id` | Yes | Read one owned idea |
| `PUT` | `/api/ideas/:id` | Yes | Update one owned idea |
| `DELETE` | `/api/ideas/:id` | Yes | Delete one owned idea |
| `POST` | `/api/ai/analyze` | Yes | Generate (but do not save) an analysis |

## Repository layout

```text
.
├── frontend/            React + Vite SPA
│   ├── public/          favicon.svg, _redirects
│   └── src/
├── server/              Express API
│   ├── config/          db.js (Atlas connection + hints)
│   ├── controllers/     auth, ideas, AI
│   ├── middleware/      JWT guard, error handler
│   ├── models/          User, Idea
│   ├── routes/          /api/auth, /api/ideas, /api/ai
│   └── services/        aiService.js
├── netlify.toml         Frontend hosting config
├── render.yaml          API hosting blueprint
└── package.json         Root dev/build/lint scripts
```

## License

Built as a learning project for full-stack development practice.
