# Deployment

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
- `AI_API_KEY` and optional AI settings when analysis is enabled.

Render supplies `PORT`. The service uses `/api/health` for health checks.

## 3. Netlify frontend

Set `VITE_API_URL` to the Render API URL with the `/api` suffix, for example
`https://ideanalyze-api.example.com/api`. Do not put Supabase service keys or
JWT signing secrets in Netlify or any `VITE_*` variable.

Deploy the `frontend/` directory with the checked-in `netlify.toml`. It sets
Node 22, the Vite build command, SPA fallback, and cache headers.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| CORS 403 | Set Render `CLIENT_URL` to the exact Netlify origin; the API also allows `http://localhost:5173` during local development. |
| Health 503 | Confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then check Supabase availability. |
| Cold start | Wait for the Render service to wake, then retry; health checks are bounded to two seconds. |
| Wrong API URL | Confirm Netlify `VITE_API_URL` ends in `/api`, rebuild, and reload the deployed site. |
