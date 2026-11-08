# Deployment

Deploy: Netlify frontend, Render API, and Supabase database.

## 1. Supabase

Apply the migrations in `supabase/migrations/` to the project. Confirm the
`ideas.user_id` column is `text` before starting the API.

## 2. Render API

Create a Node web service from this repository using the checked-in
`render.yaml`. In Render, set these secret values:

- `SUPABASE_URL`: the project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the service-role key; keep it server-side.
- `JWT_SECRET`: a long random signing secret.
- `CLIENT_URL`: the Netlify site URL, without a trailing slash.
- `AI_API_KEY` and optional AI settings when analysis is enabled:
  - `AI_MODEL` (defaults to `gemini-flash-lite-latest` for Gemini).
  - `AI_BASE_URL` and `AI_MODEL` when using an OpenAI-compatible provider.
  - `AI_MODELS` for a comma-separated fallback list.
  - `AI_RATE_LIMIT_MAX` and `IDEA_WRITE_LIMIT` to tune hourly limits.

Render supplies `PORT`. The service uses `/api/health` for health checks. The
API never logs API keys; provider logs include only the model and endpoint.

## 3. Netlify frontend

Set `VITE_API_URL` to the Render API URL with the `/api` suffix, for example
`https://ideanalyze-api.example.com/api`. Do not put Supabase service keys or
JWT signing secrets in Netlify or any `VITE_*` variable.

Deploy the `frontend/` directory with the checked-in `netlify.toml`. It sets
Node 22, the Vite build command, SPA fallback, and cache headers.

## Local checks

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix server test
```

Integration tests create and delete real records, so only run them against a
dedicated test project:

```bash
npm --prefix server run test:integration
```

## Troubleshooting

| Symptom | Check |
| --- | --- |
| CORS 403 | Set Render `CLIENT_URL` to the exact Netlify origin; the API also allows `http://localhost:5173` during local development. |
| Health 503 | Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then check Supabase availability. |
| Cold start | Wait for the Render service to wake, then retry; health checks are bounded to two seconds. |
| Wrong API URL | Confirm Netlify `VITE_API_URL` ends in `/api`, rebuild, and reload the deployed site. |
