# LABX — Production Deployment Guide

This guide outlines production deployment instructions for React frontend, Flask backend, and Supabase production setup.

---

## 1. Supabase Production Configuration

1. **Production Project**: Create a production project in Supabase.
2. **Run Migrations**: Run migration scripts `001_profiles.sql` through `020_seed_sample_quests.sql` in the Supabase SQL Editor.
3. **Enable Realtime**: Ensure Realtime is enabled on the `guild_messages` table under **Database -> Realtime**.
4. **Storage Buckets**: Create buckets:
   - `avatars` (Public viewable)
   - `quest-submissions` (Private authenticated)
   - `post-images` (Public viewable)

---

## 2. Flask Backend Deployment (Render / Railway / AWS / Heroku)

1. Use `gunicorn` as WSGI server:
   ```bash
   gunicorn run:app --bind 0.0.0.0:5000 --workers 4
   ```
2. Configure Production Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SECRET_KEY` (Strong random string)
   - `CORS_ORIGINS` (Set to production frontend domain, e.g., `https://labx.vercel.app`)

---

## 3. React Frontend Deployment (Vercel / Netlify)

1. Set Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
2. Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (Set to live Flask backend URL, e.g., `https://api.labx.com/api`)

---

## 4. Security & CORS Checklist

- Verify `SUPABASE_SERVICE_ROLE_KEY` is NEVER bundled into React build artifacts.
- Verify RLS policies are active on all 25 tables.
- Restrict CORS origins in Flask to authorized domains only.

## 5. Existing LabX Vercel Projects: Registration Connection Fix

### Confirmed live behavior (2026-09-15)

- The frontend's deployed JavaScript embeds `https://labx-7csc.vercel.app/api`.
- Registration flows through `Register.jsx`, `AuthContext.jsx`, and `api.register`
  to JSON `POST https://labx-7csc.vercel.app/api/auth/register`.
- Flask registers the auth blueprint at `/api/auth` and its register route at
  `/register`; the prefix is correct. JSON requests require an OPTIONS preflight.
- `GET /api/health` returns HTTP 200 and healthy JSON. Registration OPTIONS returns
  HTTP 200 without redirects or a Vercel authentication challenge.
- OPTIONS with `Origin: https://labx-azure.vercel.app` lacks
  `Access-Control-Allow-Origin`. The same request with `Origin: http://localhost:5173`
  receives that header, allowed methods, and allowed headers. The deployed backend
  therefore does not allow the production frontend origin. A 200 preflight alone
  is insufficient: the browser blocks the POST and fetch rejects, producing the
  frontend's generic connection message.
- The exact backend environment value and deployment revision were not inspected.
  Supabase credentials and successful registration remain unverified; no users
  were created and no database operations were performed during diagnosis.

### Settings and redeployment

In Vercel **Settings > Environment Variables**, select the **Production** environment
for these production domains. Enter plain values, without quotes or Markdown:

| Project | Variable | Value | Action |
| --- | --- | --- | --- |
| Backend (`labx-7csc`) | `CORS_ORIGINS` | `https://labx-azure.vercel.app` | Set/correct, then redeploy Production |
| Frontend (`labx-azure`) | `VITE_API_URL` | `https://labx-7csc.vercel.app/api` | Already correct in the live bundle; retain |

If local development must access this backend, explicitly use
`https://labx-azure.vercel.app,http://localhost:5173` for `CORS_ORIGINS`.
Preview deployments need their own corresponding URL/origin settings.
Keep existing backend `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SECRET_KEY`;
this connection fix does not require changing them.

Redeploy the backend to Production after saving the variable. Redeploying without
correcting the setting repeats the failure. The frontend only needs a rebuild if
its API URL changes, because Vite substitutes `import.meta.env.VITE_API_URL` at
build time; changing a dashboard variable does not update an existing bundle.

The expected project root directories are `backend` and `frontend`, respectively.
Frontend uses the Vite preset, `npm run build`, and output directory `dist`.
The repository currently exports the Flask instance from `backend/run.py` and has
no tracked Vercel entrypoint override or `vercel.json`. Live health proves the
existing deployment routes to Flask, but does not establish its dashboard build
configuration. Preserve that working configuration for this environment fix.
For a fresh import, `run.py` is not a documented automatic Flask entrypoint; use
a supported entrypoint or an explicit `tool.vercel.entrypoint` as described in
[Vercel's Flask documentation](https://vercel.com/docs/frameworks/backend/flask).

### Verify without creating a user

Run these in PowerShell (`curl.exe` avoids the PowerShell curl alias):

```powershell
curl.exe -i --max-time 30 "https://labx-7csc.vercel.app/api/health" -H "Origin: https://labx-azure.vercel.app"
curl.exe -i --max-time 30 -X OPTIONS "https://labx-7csc.vercel.app/api/auth/register" -H "Origin: https://labx-azure.vercel.app" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"
```

Expect healthy JSON for GET, a 2xx OPTIONS response, no redirect, and
`Access-Control-Allow-Origin: https://labx-azure.vercel.app` on both responses.
OPTIONS must also allow `POST`, `content-type`, and `authorization` (the client
adds Authorization when a saved token exists). Do not submit registration merely
to test connectivity: the handler creates a Supabase user and profile.

If the expected headers still do not appear, check the backend's active Production
deployment, its source revision, and the environment scope of `CORS_ORIGINS`.
For a remaining browser failure, collect only the request URL, OPTIONS/POST status,
response CORS headers, any Location header, and the exact console error. If there
is a backend 5xx, collect the corresponding Vercel function error and timestamp.
Redact passwords, tokens, cookies, keys, and request bodies; do not share real .env files.

### Direct frontend links returning 404

Follow-up checks on 2026-09-15 confirmed that `/` returned the frontend HTML with
HTTP 200, while `/register` returned Vercel `404 NOT_FOUND`. React Router defines
`/register`, but Vercel needs to serve `index.html` before React can handle it.
`frontend/vercel.json` now supplies the SPA rewrite recommended by
[Vercel for Vite](https://vercel.com/docs/frameworks/frontend/vite).

Deploy a revision containing this file to the frontend Production project, with
Root Directory set to `frontend`. Redeploying the old revision will not include
the fix. Verify direct visits and refreshes at `/register` and `/login`, and check
that JavaScript, CSS, and the intro video still load. Until deployed, open
`https://labx-azure.vercel.app/` and navigate through the app instead of directly
opening `/register`.

The production backend CORS health and preflight checks passed after the environment
correction. Use the stable frontend domain above; deployment-specific frontend
domains require their exact origins to be explicitly allowed by the backend.
