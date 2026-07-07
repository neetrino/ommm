# Local Load Test Report — Ommm

**Date/time:** 2026-07-07, ~14:24 UTC+4 (Asia/Yerevan)  
**Scope:** Local-only safe smoke/load test after [STRESS_TEST_SAFE_FIXES_REPORT.md](../STRESS_TEST_SAFE_FIXES_REPORT.md)  
**Targets:** `http://localhost:3000` (web), `http://localhost:4000` (API) — **not production**

---

## A. Environment

| Item | Value |
|------|-------|
| Machine | Windows 11 Pro x64, Build 26200 |
| CPU | AMD Ryzen 7 8745HX with Radeon Graphics |
| RAM | 32 GB |
| Node.js | v24.6.0 |
| pnpm | 10.28.2 |
| k6 | v2.1.0 (installed via `winget install k6` during this session) |
| API URL | `http://localhost:4000` (`/v1` prefix) |
| Web URL | `http://localhost:3000` |
| API production mode | Yes — `NODE_ENV=production`, `pnpm run start:prod` |
| Web production mode | Yes — `pnpm run start` (Next.js 16.2.4 prod server) |
| API port source | `apps/api/src/common/resolve-api-port.ts` — default **4000** |
| Database | Local PostgreSQL via project `.env` (`DATABASE_URL`) |
| Redis cache | Upstash Redis enabled (log: `RedisCacheService` on API start) |

---

## B. Build / Start Status

### Commands run

```bash
pnpm run build:api   # PASS
pnpm run build:web   # PASS
```

### API start

```powershell
cd apps/api
$env:NODE_ENV="production"
pnpm run start:prod
```

| Result | Detail |
|--------|--------|
| **PASS** | Listening on `http://127.0.0.1:4000/v1` (health: `/v1/health`) |
| Warnings | None fatal; structured JSON logs in production mode |

### Web start

```powershell
cd apps/web
pnpm run start
```

| Result | Detail |
|--------|--------|
| **PASS** | Ready in ~142 ms on `http://localhost:3000` |
| Build notes | 311 static pages generated; no build errors |

---

## C. Manual Smoke Check Results

Timing via `curl.exe -w` (PowerShell, output to `NUL`).

| URL | Status | Total | TTFB | Pass/Fail | Notes |
|-----|--------|-------|------|-----------|-------|
| `GET /v1/health` | 200 | 0.333 s | 0.333 s | **PASS** | `{ status: "ok", database: "ok" }` |
| `GET /v1/coaches` | 200 | 0.797 s | 0.797 s | **PASS** | No `"email"` field in response body |
| `GET /v1/schedule/public?from=2026-07-07&to=2026-07-14` | 200 | 0.819 s | 0.819 s | **PASS** | 6 schedule items returned |
| `GET /v1/classes/sessions?from=2026-07-07` (no `to`) | 200 | 0.685 s | 0.685 s | **PASS** | 1 session; `maxStartsAt=2026-07-31` — within 30-day clamp |
| `GET /en` | 200 | 1.462 s | 0.189 s | **PASS** | ~407 KB HTML; cold/first-render latency |
| `GET /en/schedule` | 200 | 0.031 s | 0.029 s | **PASS** | ~289 KB HTML; warm/cached SSR |

**Clamp verification:** Omitting `to` on `/v1/classes/sessions` did **not** scan unlimited data. Latest session returned was **2026-07-31**, consistent with the 30-day public window from **2026-07-07**.

**PII verification:** Public coaches list returned **no `user.email`** fields.

---

## D. k6 Result Summary

**Script:** `tests/load/local-smoke.js`  
**Command:** `k6 run tests/load/local-smoke.js`  
**Raw summary export (local only, gitignored):** `tests/load/last-run-summary.json` when using `--summary-export`

### VU profile

| Stage | Duration | Target VUs |
|-------|----------|------------|
| Warm-up | 30 s | 2 |
| Steady | 60 s | 5 |
| Peak | 30 s | 10 |
| Ramp down | 30 s | 0 |

**Max VUs:** 10 (within local safety limit)

### Aggregate metrics

| Metric | Value | Threshold | Result |
|--------|-------|-----------|--------|
| Total HTTP requests | **1,526** | — | — |
| Iterations | **763** | — | — |
| Checks passed | **1,739** | — | **PASS** |
| Checks failed | **0** | — | **PASS** |
| `http_req_failed` | **0%** | < 1% | **PASS** |
| Overall p50 | **47 ms** | — | — |
| Overall p90 | **361 ms** | — | — |
| Overall p95 | **418 ms** | < 1500 ms | **PASS** |
| Overall max | **1,468 ms** | — | Single slow request |
| API p95 (`type:api`) | **571 ms** | < 1000 ms | **PASS** |
| Web p95 (`type:web`) | **20 ms** | < 1500 ms | **PASS** |

### HTTP errors

| Code | Count |
|------|-------|
| 500 | 0 |
| 502 | 0 |
| 503 | 0 |
| Timeouts | 0 |

### k6 custom checks (all passed)

- All web pages returned 2xx
- All API endpoints returned 2xx
- `health reports database ok` — 99/99
- `coaches response has no user.email leak` — 114/114

### Slowest observed behavior

- **Max request duration:** ~1,468 ms (overall); likely a cold API cache miss or first-hit DB/Redis path under concurrent load
- **Manual cold home page:** ~1.46 s total (TTFB ~0.19 s) on first curl — typical for local prod Next.js first request

---

## E. Endpoint / Page Analysis

### Web pages (GET, SSR/static)

| Page | k6 checks | Observed behavior |
|------|-----------|-------------------|
| `/en` | 80× 2xx | Highest manual cold latency (~1.46 s once); k6 p95 ~20 ms when warm |
| `/en/schedule` | 76× 2xx | Fast when warm (~31 ms manual); schedule SSR + API fan-out on cold start |
| `/en/package` | 83× 2xx | Stable 2xx under load |
| `/en/coaches` | 78× 2xx | Stable 2xx |
| `/en/contact` | 64× 2xx | Stable 2xx |
| `/en/story` | 66× 2xx | Stable 2xx |
| `/en/privacy`, `/en/terms`, `/en/refund` | 248× combined | Stable 2xx |
| `/en/explore` | 68× 2xx | Stable 2xx; low API amplification |

**Frontend summary:** All marketing pages healthy at 10 VUs locally. Cold-start home latency is the main watch item before Preview testing.

### API endpoints (GET, public)

| Endpoint | k6 2xx checks | Notes |
|----------|---------------|-------|
| `/v1/health` | 99 | DB check adds ~200–330 ms on cold manual curl; stable under k6 |
| `/v1/coaches` | 114 | No email leak; slower on cache miss (~0.8 s manual) |
| `/v1/packages/plans` | 82 | Stable |
| `/v1/studio` | 97 | Stable |
| `/v1/studio/home-sections` | 90 | Stable |
| `/v1/classes/types` | 89 | Stable |

### Schedule-related endpoints

| Endpoint | Result | Notes |
|----------|--------|-------|
| `/v1/schedule/public?from=2026-07-07&to=2026-07-14` | **PASS** | 98× 2xx; bounded 7-day window |
| `/v1/classes/sessions?from=2026-07-07` (no `to`) | **PASS** | 94× 2xx; clamp confirmed — no unlimited scan |

### Health / database endpoint

| Check | Result |
|-------|--------|
| HTTP 200 when DB up | **PASS** |
| `database: "ok"` in body | **PASS** |
| Failure mode (503 when DB down) | Not exercised in this run (would need controlled DB stop) |

---

## F. Risk Assessment

| Area | Status | Rationale |
|------|--------|-----------|
| Safe fixes validation (blocked auth, email removal, session clamp, health) | **Green** | Manual + k6 checks confirm expected behavior |
| Public GET API under 10 VUs local | **Green** | 0% errors; API p95 571 ms |
| Public marketing pages under 10 VUs local | **Green** | 0% errors; web p95 20 ms when warm |
| Cold-start / first-request latency | **Yellow** | Home ~1.5 s and some API ~0.8 s on first hit — monitor on staging |
| Staging API-only load test | **Green** | Ready to proceed with same k6 script pointed at staging URL |
| Vercel Preview + staging API | **Yellow** | Proceed after staging API smoke; watch SSR cold starts and cross-origin latency |
| Production smoke test | **Yellow** | Not yet — complete staging + Preview first |

---

## G. Findings

### F1 — Cold first load on `/en` is slower than steady-state

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Frontend |
| **Evidence** | Manual curl: 1.462 s total (TTFB 0.189 s); k6 web p95 20 ms when warm |
| **Likely cause** | First production Next.js request after `next start`; SSR + data fetching |
| **Recommendation** | Re-measure on Vercel Preview; use warm-api cron pattern if needed |
| **Code change now?** | No |

### F2 — `/v1/health` TTFB ~330 ms on manual check

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Backend / Database |
| **Evidence** | Manual curl TTFB 0.333 s; k6 health checks 99/99 passed |
| **Likely cause** | Prisma `SELECT 1` round-trip; acceptable for real health probing |
| **Recommendation** | Ensure Cloud Run startup/liveness probes allow ≥1 s timeout |
| **Code change now?** | No |

### F3 — Public coaches API ~800 ms on first manual hit

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Backend / Cache |
| **Evidence** | Manual curl 0.797 s; k6 p95 API 571 ms under concurrent load |
| **Likely cause** | Redis cache miss + DB + serialization on first request |
| **Recommendation** | Confirm Redis hit rate on staging; optional cache warm before test |
| **Code change now?** | No |

### F4 — Session clamp without `to` works as designed

| Field | Value |
|-------|-------|
| **Severity** | Informational (positive) |
| **Area** | Backend |
| **Evidence** | `maxStartsAt=2026-07-31` with `from=2026-07-07`; 94 k6 passes |
| **Likely cause** | `resolvePublicScheduleRange()` applied in controller |
| **Recommendation** | Include this case in staging regression checklist |
| **Code change now?** | No |

### F5 — No coach email in public API

| Field | Value |
|-------|-------|
| **Severity** | Informational (positive) |
| **Area** | Backend / Security |
| **Evidence** | Manual body grep + k6 check 114/114 |
| **Recommendation** | Keep in staging checklist |
| **Code change now?** | No |

### F6 — k6 was not pre-installed

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Test setup |
| **Evidence** | `k6` not found initially; installed via `winget install k6` |
| **Recommendation** | Document k6 in developer onboarding; CI optional later |
| **Code change now?** | Done — `tests/load/README.md` + `pnpm run load:local:smoke` |

---

## H. Do-Not-Test List (Intentionally Excluded)

The following were **not** exercised by design:

- Auth mutations (login, register, password reset)
- Booking create / cancel / update
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

---

## I. Final Recommendation

| Next step | Ready? | Notes |
|-----------|--------|-------|
| **Staging API-only test** | **Yes** | Reuse `tests/load/local-smoke.js` with `API_URL=https://<staging-api>`; keep VUs ≤10 initially |
| **Vercel Preview + staging API** | **Yes, with caution** | Set `WEB_URL` to Preview URL; watch cold SSR on `/en` and `/en/schedule`; do not point at production API |
| **Production smoke test** | **Not yet** | Complete staging + Preview passes first; production remains out of scope |

### Overall local condition

The system is **healthy for local production-mode smoke testing** at up to **10 VUs**:

- **0% HTTP failures**
- **All k6 thresholds passed**
- **Recent safe fixes verified** (health DB check, coach email removal, session date clamp)

Proceed to **staging API-only** smoke using the same k6 script and thresholds before any production-facing test.

---

## Artifacts Created

| Path | Purpose |
|------|---------|
| `tests/load/local-smoke.js` | k6 local smoke script |
| `tests/load/README.md` | Setup and usage docs |
| `tests/load/last-run-summary.json` | Optional k6 `--summary-export` output (gitignored, not committed) |
| `package.json` → `load:local:smoke` | `k6 run tests/load/local-smoke.js` |

### Quick re-run

```bash
# Terminal A
cd apps/api && NODE_ENV=production pnpm run start:prod

# Terminal B
cd apps/web && pnpm run start

# Terminal C
pnpm run load:local:smoke
```

---

## Related Documents

- [STRESS_TEST_SAFE_FIXES_REPORT.md](../STRESS_TEST_SAFE_FIXES_REPORT.md)
- [STRESS_TEST_READINESS_AUDIT.md](../STRESS_TEST_READINESS_AUDIT.md)
- [tests/load/README.md](../../tests/load/README.md)
