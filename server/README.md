# Ideanalyze AI — API

Express + Mongoose/Supabase + JWT API for Ideanalyze AI. Deployed as a single Node web
service on Render. The React frontend lives in
[`../frontend`](../frontend); see the [root README](../README.md) for the full
architecture.

## Requirements

- Node.js 22
- MongoDB Atlas or Supabase credentials, depending on `DB_PROVIDER`

## Run locally

```bash
npm install
cp .env.example .env
# Set DB_PROVIDER=mongo and fill in MONGO_URI and JWT_SECRET, then:
npm run dev
```

For Supabase mode, set `DB_PROVIDER=supabase`, `SUPABASE_URL`, and
`SUPABASE_SERVICE_ROLE_KEY`. MongoDB is not contacted in this mode. To roll
back during migration, set `DB_PROVIDER=mongo` and restore `MONGO_URI`.

Or from the repository root:

```bash
npm run install:all
npm run dev:server
```

The API listens on http://localhost:5000 by default.

## Startup behaviour

- With `DB_PROVIDER=mongo` (the default), the server connects to MongoDB before
  it starts listening. A failed or missing connection exits with status `1` and
  prints Atlas-specific hints.
- With `DB_PROVIDER=supabase`, MongoDB is skipped and the server starts; health
  uses a bounded Supabase `ideas` probe.
- In production, startup is refused when `JWT_SECRET` is missing, empty, or a
  known placeholder.
- `SIGTERM`/`SIGINT` close the HTTP server and MongoDB connection gracefully.
- Unhandled rejections and uncaught exceptions exit non-zero instead of leaving a
  half-running process.

## Health check

`GET /api/health` reports the active provider. Mongo mode reads Mongoose's local
`readyState`; Supabase mode uses a `head` count query with a two-second budget.

| State | Status | Body |
| --- | --- | --- |
| Connected | `200` | `{ "status": "ok", "db": "connected", "provider": "...", "timestamp": "..." }` |
| Disconnected | `503` | `{ "status": "degraded", "db": "disconnected", "provider": "..." }` |

## Environment variables

See [`.env.example`](.env.example) for the full annotated list.

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Production | `production` disables auto-indexing and enables secret checks |
| `PORT` | No | HTTP port (Render supplies it) |
| `DB_PROVIDER` | No | `mongo` (default) or `supabase` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `SUPABASE_URL` | Yes for Supabase | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for Supabase | Server-only Supabase service-role key |
| `JWT_SECRET` | Yes | Signing secret; placeholders are rejected in production |
| `JWT_EXPIRES_IN` | No | Token lifetime, default `7d` |
| `CLIENT_URL` | Production | Comma-separated CORS allowlist; `http://localhost:5173` is always allowed |
| `AI_BASE_URL` | Conditional | OpenAI-compatible base URL; required for `sk-` keys |
| `AI_API_KEY` | For AI | Gemini or provider key; server-side only |
| `AI_MODEL` | No | Model ID, default `gemini-flash-lite-latest` |
| `AI_MODEL_NAME` | No | Model used when `AI_MODEL` is a full URL |

## Endpoints

Responses use `{ success: true, data: { ... } }` on success and
`{ success: false, message }` on error.

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health and DB readiness |
| `POST` | `/api/auth/signup` | No | Create account → `{ user, token }` |
| `POST` | `/api/auth/login` | No | Log in → `{ user, token }` |
| `GET` | `/api/auth/me` | Yes | Current user |
| `GET` | `/api/ideas` | Yes | List the current user's ideas |
| `POST` | `/api/ideas` | Yes | Create an idea |
| `GET` | `/api/ideas/:id` | Yes | Read one owned idea |
| `PUT` | `/api/ideas/:id` | Yes | Update one owned idea |
| `DELETE` | `/api/ideas/:id` | Yes | Delete one owned idea |
| `POST` | `/api/ai/analyze` | Yes | Generate an analysis without saving it |

Every idea query includes `user: req.user._id`, so users can only read or mutate
their own ideas. Unknown `/api/*` routes return a JSON `404`.

## Security notes

- `helmet` sets standard security headers and `x-powered-by` is disabled.
- JSON bodies are limited to `100kb`.
- CORS rejects unknown origins with a JSON `403`.
- `trust proxy` is set to `1` so Render's proxy headers are handled correctly.
- AI keys never leave the server. If `AI_BASE_URL` and a Gemini key are both
  missing, `/api/ai/analyze` returns `503 AI not configured` instead of calling a
  third-party host.

## Deploying

The root [`render.yaml`](../render.yaml) defines the Render web service with
`rootDir: server`, `npm start`, and health check `/api/health`. Set `MONGO_URI`,
`JWT_SECRET`, `AI_API_KEY`, `CLIENT_URL` (and `AI_BASE_URL` if you use an
OpenAI-compatible provider) in the Render dashboard.
