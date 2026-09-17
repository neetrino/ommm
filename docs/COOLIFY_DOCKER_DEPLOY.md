# Coolify + Hetzner — Docker only (no Nixpacks)

**Canonical production path for Ommm.** Nixpacks is unsupported for this monorepo.

## Why Docker only

| | Nixpacks | Docker (this repo) |
|---|---|---|
| Build | Guesses pnpm / Next / Nest | Explicit `Dockerfile` + `Dockerfile.api` |
| Monorepo | Often builds wrong app | `--filter web...` / `--filter api...` |
| Prisma / argon2 | Flaky | Generate + native build in image |
| Image size | Bloated | Web = Next standalone |
| Repeatability | Changes with Nixpacks version | Same result every deploy |

Repo artifacts:

- `Dockerfile` — Next.js web (`:3000`)
- `Dockerfile.api` — Nest API (`:8080`, health `/v1/health`)
- `compose.yaml` — both services on one Docker network
- `.dockerignore` — keeps build context small

## Recommended: one Coolify app with Docker Compose

1. Coolify → New Resource → **Docker Compose** (or Application with Compose).
2. Connect the Git repo / branch you deploy from.
3. **Compose file:** `compose.yaml`
4. **Build Pack:** Docker Compose (not Nixpacks).
5. Set env vars in Coolify (see table below). Secrets never go in Git.
6. Domains:
   - `web` → `www.ommm.am` (and apex if you want)
   - `api` → `api.ommm.am`
7. Deploy.

`API_INTERNAL_URL` is already `http://api:8080` in `compose.yaml` (service DNS). Do not override it to `https://api.ommm.am`.

### Build-time vars (web)

Mark these as available at **build** time in Coolify (build args), then redeploy after changing them:

| Key | Example |
|-----|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.ommm.am` |
| `NEXT_PUBLIC_API_URL` | `https://api.ommm.am` |
| `NEXT_PUBLIC_API_ORIGIN` | `https://api.ommm.am` |

## Alternative: two Coolify applications

Use only if you already run split services.

### API service

| Setting | Value |
|---------|--------|
| Build Pack | **Dockerfile** |
| Dockerfile | `Dockerfile.api` |
| Port | `8080` |
| Healthcheck path | `/v1/health` |
| `PORT` | `8080` |
| `API_LISTEN_HOST` | `0.0.0.0` |
| `RUN_DB_MIGRATE` | `true` (default in image) |

### Web service

| Setting | Value |
|---------|--------|
| Build Pack | **Dockerfile** |
| Dockerfile | `Dockerfile` |
| Port | `3000` |
| Same Docker network as API | required |
| `API_INTERNAL_URL` | `http://<api-service-name>:8080` |

## Environment checklist (API)

Copy values from your root `.env` into Coolify — never commit secrets.

Required:

- `DATABASE_URL`, `DIRECT_URL`
- `JWT_SECRET`, `JWT_EXPIRES_SEC`
- `WEB_APP_URL` (e.g. `https://www.ommm.am`)

Usually required in prod:

- `ENABLE_BOOKING_BACKGROUND_JOBS=true`
- Resend / R2 / Google OAuth / Upstash keys as used by the app
- `GOOGLE_CALLBACK_URL=https://www.ommm.am/api/v1/auth/google/callback`

Full key placement notes: [`DEPLOY_ENV_PLACEMENT.md`](./DEPLOY_ENV_PLACEMENT.md).

## Migrations

Image entrypoint runs `prisma migrate deploy` when `RUN_DB_MIGRATE=true` (default). Prisma uses DB advisory locks, so concurrent boots are safe.

To migrate manually instead: set `RUN_DB_MIGRATE=false` and run once against prod DB:

```bash
pnpm run db:migrate:deploy
```

## Local smoke (optional)

With Docker Desktop running and a filled `.env`:

```bash
pnpm run docker:build
pnpm run docker:up
# web http://localhost:3000  ·  api http://localhost:8080/v1/health
pnpm run docker:down
```

## Hard rules (avoid the old breakage)

1. **Never** set Coolify Build Pack to Nixpacks.
2. **Never** point `API_INTERNAL_URL` at the public Cloudflare API URL.
3. After changing any `NEXT_PUBLIC_*`, **rebuild** web (not only restart).
4. Keep Node at **20** (images use `node:20-bookworm-slim`).
5. Prune old images on the Hetzner host when disk is tight (`docker system prune` from Coolify / SSH).

## Success checks after deploy

- `https://api.ommm.am/v1/health` → `{ "status": "ok" }`
- `https://www.ommm.am/` loads
- Browser network: SSE under same-origin `/api/v1/realtime/*` (not direct to `api.` for cookie auth)
- Admin login + schedule load without 500s on realtime proxy
