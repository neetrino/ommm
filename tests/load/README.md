# Local load smoke tests (k6)

**Local-only.** These scripts must never target production, Vercel production, or Cloud Run production URLs.

## Prerequisites

- Node.js ≥ 20, pnpm
- PostgreSQL reachable via project `.env` (`DATABASE_URL`)
- [k6](https://k6.io/) installed locally

### Install k6

| OS | Command |
|----|---------|
| Windows | `winget install k6` |
| macOS | `brew install k6` |
| Linux | See [k6 installation docs](https://grafana.com/docs/k6/latest/set-up/install-k6/) |

Verify: `k6 version`

## 1. Build production artifacts

From repo root:

```bash
pnpm install
pnpm run build:api
pnpm run build:web
```

## 2. Start local production servers

**Terminal A — API** (default port `4000`, see `apps/api/src/common/resolve-api-port.ts`):

```bash
cd apps/api
$env:NODE_ENV="production"   # PowerShell
# export NODE_ENV=production  # bash
pnpm run start:prod
```

**Terminal B — Web**:

```bash
cd apps/web
pnpm run start
```

Defaults:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/v1`

If `PORT` or `API_PORT` is set in `.env`, use that value for `API_URL`.

## 3. Manual curl smoke (optional)

PowerShell example:

```powershell
curl.exe -w "`nTotal: %{time_total}s`nTTFB: %{time_starttransfer}s`n" -o NUL -s http://localhost:4000/v1/health
```

bash example:

```bash
curl -w "\nTotal: %{time_total}s\nTTFB: %{time_starttransfer}s\n" -o /dev/null -s http://localhost:4000/v1/health
```

## 4. Run k6 smoke test

From repo root:

```bash
pnpm run load:local:smoke
```

Or with custom URLs:

```bash
$env:WEB_URL="http://localhost:3000"
$env:API_URL="http://localhost:4000"
k6 run tests/load/local-smoke.js
```

### Load profile

| Stage | Duration | VUs |
|-------|----------|-----|
| Warm-up | 30s | 2 |
| Steady | 60s | 5 |
| Peak | 30s | 10 |
| Ramp down | 30s | 0 |

**Max 10 VUs** — safe for local dev only.

### Thresholds

| Metric | Target |
|--------|--------|
| `http_req_failed` | < 1% |
| Overall `http_req_duration` p95 | < 1500 ms |
| API requests p95 (`type:api`) | < 1000 ms |
| Web pages p95 (`type:web`) | < 1500 ms |

## What is tested

### Safe web pages (GET)

- `/en`, `/en/schedule`, `/en/package`, `/en/coaches`, `/en/contact`
- `/en/story`, `/en/privacy`, `/en/terms`, `/en/refund`, `/en/explore`

### Safe API endpoints (GET)

- `/v1/health`
- `/v1/coaches` (checks no `user.email` in response)
- `/v1/packages/plans`
- `/v1/studio`, `/v1/studio/home-sections`
- `/v1/schedule/public?from=2026-07-07&to=2026-07-14`
- `/v1/classes/sessions?from=2026-07-07` (no `to` — verifies clamp)
- `/v1/classes/types`

## Intentionally excluded

Do **not** add these to local smoke without explicit approval:

- Auth mutations (login, register, password reset)
- Booking create/cancel/update
- Payment endpoints
- Waitlist mutations
- Package subscribe
- Gift cards
- Uploads
- Admin mutations
- Notification broadcast
- Package reconcile
- CSV exports
- SSE / realtime flood

## Reports

After a run, see `docs/performance/local-load-test-report.md` for the latest audit write-up.
