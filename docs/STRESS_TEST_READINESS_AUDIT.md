# Ommm — Stress Test Readiness Audit

**Date:** 2026-07-07  
**Scope:** Full-stack performance, reliability, security, and load audit  
**Repository:** `neetrino/ommm`  
**Stack:** Next.js (Vercel) · NestJS (Cloud Run) · PostgreSQL/Prisma · pnpm monorepo  
**Mode:** Read-only analysis — no code changes applied

---

## A. Executive Summary

### Overall health

The codebase has a **solid baseline**: Helmet, CORS delegate, global `ValidationPipe`, JWT + role guards on admin paths, argon2 passwords, interactive transactions on booking/package/payment flows, Redis caching for public marketing reads, and structured HTTP logging (pino, headers/cookies stripped).

Under load, the weakest areas are **unbounded or large database reads**, **frontend API amplification on home/schedule**, **auth/abuse protection gaps**, and **Cloud Run–specific risks** (SSE, graceful shutdown, in-process crons).

### Top 5 risks

| # | Risk | Severity |
|---|------|----------|
| 1 | Blocked users can still authenticate — `isBlocked` not enforced in login or JWT validation | **Critical** |
| 2 | Public coach list exposes coach emails (PII), cached in Redis | **High** |
| 3 | `GET /classes/sessions` has no date-range clamp (unlike `/schedule/public` which caps at 30 days) | **High** |
| 4 | Home + `/schedule` amplify traffic: SSR fetch + client idle refresh + member bookings/waitlist + SSE per tab | **High** |
| 5 | No graceful shutdown (`enableShutdownHooks`), shallow health check, SSE holds instances — Cloud Run reliability risk | **High** |

### What will break first under load

1. **PostgreSQL** — unbounded `findMany` on public sessions, finance reports without `take`, admin management board (6 parallel heavy queries), JWT DB lookup on every authenticated request.
2. **Home and `/schedule` pages** — each member tab triggers 3+ API calls on mount plus SSE; schedule data re-fetched even when SSR data exists.
3. **Auth endpoints** — global 120 req/min/IP is insufficient for credential-stuffing protection; password reset can be abused for email spam.
4. **Cloud Run instances** — long-lived SSE connections, no shutdown drain, in-process crons duplicate across replicas.
5. **Connection pool** — `DATABASE_CONNECTION_LIMIT` documented in `.env.example` but not wired into Prisma; risk of pool exhaustion when Cloud Run scales out.

### Must fix before stress testing

| Priority | Item |
|----------|------|
| **P0** | Enforce `isBlocked` in `login` + `JwtStrategy.validate` |
| **P0** | Remove coach emails from public `/coaches` response |
| **P0** | Clamp `GET /classes/sessions` date range (mirror 30-day cap on `/schedule/public`) |
| **P1** | Add `take` to unbounded `payment.findMany` in finance summary |
| **P1** | Auth-specific rate limits (login/register/password-reset: 5–10/min) |
| **P1** | Enable `app.enableShutdownHooks()` + DB-aware health check |
| **P1** | Frontend: remove duplicate waitlist SSE handler; skip redundant client schedule refresh when SSR data is fresh |
| **P2** | Wire or document DB connection pool limits for Cloud Run scaling |
| **P2** | Fix N+1 in coach salary summaries |
| **P2** | Ensure Upstash Redis is configured in staging (otherwise every public read hits DB) |

---

## B. Detailed Findings

Each finding includes severity, area, file path, problem, impact, safe fix, and timing.

---

### B.1 Security

#### B.1.1 Blocked users can authenticate

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Security |
| **File** | `apps/api/src/auth/auth.service.ts` (login), `apps/api/src/auth/jwt.strategy.ts` (validate) |
| **Problem** | `isBlocked` is never checked during login or JWT validation. Blocked flag exists and is used in clients admin, but not in auth path. |
| **Why it matters** | Blocked members retain full API access until caught elsewhere. Under abuse or support scenarios this bypasses account suspension. |
| **Safe fix** | After credential verification in `login`, throw `UnauthorizedException` if `user.isBlocked`. In `JwtStrategy.validate`, same check after `findUnique`. No business-logic change to booking/payments. |
| **When** | **Now** — before any load test |

#### B.1.2 Coach emails exposed on public API

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Security |
| **File** | `apps/api/src/coaches/coaches-public.service.ts:29` |
| **Problem** | `listPublic()` selects `user.email` and caches result in Redis. Single-coach endpoint correctly omits email. |
| **Why it matters** | PII leak on unauthenticated endpoint; amplified by Redis cache TTL. |
| **Safe fix** | Remove `email: true` from public list `select`. No flow change. |
| **When** | **Now** |

#### B.1.3 Auth endpoints share global 120 req/min throttle

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Security |
| **File** | `apps/api/src/app.module.ts:69-74,105`; `apps/api/src/auth/auth.controller.ts` |
| **Problem** | `ThrottlerGuard` is global (120 req/min/IP). No stricter limits on `/auth/login`, `/auth/register`, `/auth/request-password-reset`. |
| **Why it matters** | Credential stuffing and password-reset email abuse under load test or attack. |
| **Safe fix** | Add `@Throttle({ default: { ttl: 60000, limit: 5 } })` on auth mutation routes. Keep global limit for other routes. |
| **When** | **Now** |

#### B.1.4 Password reset email abuse

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Security |
| **File** | `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.service.ts` |
| **Problem** | Returns `{ ok: true }` even when email missing (good for enumeration), but no per-email rate limit — attacker can trigger emails to arbitrary addresses at 120/min. |
| **Why it matters** | Email provider quota exhaustion, spam complaints, Resend costs. |
| **Safe fix** | Stricter throttle on reset endpoint; optional per-email cooldown in DB/cache. |
| **When** | Before stress test |

#### B.1.5 Access token returned in JSON body alongside httpOnly cookie

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Security |
| **File** | `apps/api/src/auth/auth.controller.ts:106,119` |
| **Problem** | Login/register set httpOnly cookie **and** return `accessToken` in response body. Web app uses cookies only. |
| **Why it matters** | Unnecessary XSS/exfiltration surface if any client reads body. |
| **Safe fix** | Omit `accessToken` from JSON when cookie is set (verify mobile clients first). |
| **When** | Later — requires client compatibility check |

#### B.1.6 Register issues JWT before email verification

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Security |
| **File** | `apps/api/src/auth/auth.service.ts:113-114` |
| **Problem** | Full session JWT issued immediately; `emailVerified` not checked on protected routes. |
| **Why it matters** | Unverified accounts have full member access. May be intentional product decision. |
| **Safe fix** | Guard or middleware rejecting unverified users on sensitive routes — **requires product approval**. |
| **When** | Later — business decision |

#### B.1.7 Static uploads publicly readable

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Security |
| **File** | `apps/api/src/main.ts:45-48` |
| **Problem** | `/v1/uploads/` served without auth. UUID paths provide obscurity only. |
| **Why it matters** | Anyone with URL can access uploaded images. |
| **Safe fix** | Require R2 in production (`R2_HOME_IMAGE_REQUIRED`); signed URLs for sensitive assets. |
| **When** | Later |

#### B.1.8 Upload validation is MIME-only

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Security |
| **File** | `apps/api/src/users/`, `apps/api/src/gift-cards/`, `apps/api/src/content/` upload services |
| **Problem** | No magic-byte/content sniffing; client-declared MIME only. |
| **Why it matters** | Malicious file upload if MIME spoofed. |
| **Safe fix** | Add file-type detection library at upload boundary. |
| **When** | Later |

#### B.1.9 CORS allows missing Origin

| Field | Value |
|-------|-------|
| **Severity** | Low–Medium |
| **Area** | Security |
| **File** | `apps/api/src/cors-origin.ts` |
| **Problem** | Requests without `Origin` header are allowed (mobile OK; also enables direct server-side abuse). |
| **Why it matters** | Load tests from scripts bypass browser CORS model anyway; production abuse vector for unauthenticated endpoints. |
| **Safe fix** | Document; optionally restrict in production for non-mobile user-agents. |
| **When** | Later |

#### B.1.10 No CSRF tokens (SameSite=Lax mitigation)

| Field | Value |
|-------|-------|
| **Severity** | Info |
| **Area** | Security |
| **File** | `apps/api/src/auth/auth.controller.ts`, `apps/web/src/lib/api.ts` |
| **Problem** | No explicit CSRF tokens; mitigated by SameSite=Lax + same-origin BFF proxy. |
| **Why it matters** | Acceptable for current architecture; Bearer header path bypasses cookie CSRF model. |
| **Safe fix** | None required if web stays cookie-only same-origin. |
| **When** | Monitor |

---

### B.2 Backend API Performance

#### B.2.1 Unbounded public session listing

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Database |
| **File** | `apps/api/src/classes/classes-sessions-public.service.ts:15-37`, `apps/api/src/classes/classes.controller.ts:57-71` |
| **Problem** | `findMany` with no `take`; accepts arbitrary `from`/`to` with no max window. Includes classType, coach.user, booking counts. |
| **Why it matters** | Single request can scan entire session table + relations. Primary abuse vector during load test. |
| **Safe fix** | Reuse `resolvePublicScheduleRange()` from `apps/api/src/schedule/public-schedule-range.ts`; add `take` safety cap. |
| **When** | **Now** |

#### B.2.2 Finance summary loads all payments without date filter

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Database |
| **File** | `apps/api/src/reports/reports-export.service.ts:83-92` |
| **Problem** | `payment.findMany` has no `take` when date range omitted. Gift cards capped at 10k; payments are not. |
| **Why it matters** | Admin dashboard can OOM or timeout as payment history grows. |
| **Safe fix** | Require date range or add `take` + pagination. Admin-only but still risky under load. |
| **When** | Before stress test (admin endpoints excluded from public load test) |

#### B.2.3 Admin bookings management — 6 parallel heavy queries

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Database |
| **File** | `apps/api/src/bookings/bookings-admin-management.service.ts:87-172` |
| **Problem** | Parallel `findMany`: bookings (1000), waitlists (500), sessions (1000), payments (5000), plus classTypes/coaches. Deep includes. `@SkipThrottle()`. |
| **Why it matters** | Single admin page load can saturate DB connections. |
| **Safe fix** | Paginate all legs; remove `@SkipThrottle()` or use higher limit instead of none. |
| **When** | Later — admin path |

#### B.2.4 N+1 coach salary computation

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Database |
| **File** | `apps/api/src/coaches/coaches-panel.service.ts:110-137` |
| **Problem** | `mapProfile` calls `salarySummary()` per coach — each does `findUnique` + `findMany` sessions. |
| **Why it matters** | Admin salary page scales O(coaches × queries). |
| **Safe fix** | Batch salary computation in single query or pre-aggregated view. |
| **When** | Later — admin path |

#### B.2.5 JWT validation hits DB on every request

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend |
| **File** | `apps/api/src/auth/jwt.strategy.ts:49-56` |
| **Problem** | `findUnique` on every authenticated request. |
| **Why it matters** | Under load, auth overhead dominates; also reintroduces blocked-user bypass until fixed. |
| **Safe fix** | Cache user status briefly (Redis) or embed `isBlocked`/`role` in JWT with short TTL + revocation list. |
| **When** | Later |

#### B.2.6 Member bookings list unbounded

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend / Database |
| **File** | `apps/api/src/bookings/bookings-client-list.service.ts:35-53` |
| **Problem** | `listMineAll` and `listMineUpcoming` have no pagination. Past scope is paginated. |
| **Why it matters** | Long-term members with many bookings get large payloads on every `/bookings/me` call (triggered on schedule mount). |
| **Safe fix** | Default to paginated scope or cap with `take`. |
| **When** | Later |

#### B.2.7 Sequential email broadcast blocks request

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Deployment |
| **File** | `apps/api/src/notifications/notifications-broadcast.service.ts:70-85` |
| **Problem** | Up to 500 sequential `sendEmail` + audit log in request handler. |
| **Why it matters** | Exceeds Cloud Run request timeout; blocks instance. |
| **Safe fix** | Background job queue (Cloud Tasks / Bull). **Do not stress-test this endpoint.** |
| **When** | Later |

#### B.2.8 Package reconcile scans all active memberships

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Backend / Database |
| **File** | `apps/api/src/packages/package-usage-maintenance.service.ts:38-80` |
| **Problem** | Without `userId`, loads all ACTIVE `userPackage` rows and sequential updates. |
| **Why it matters** | Admin-triggered full reconcile can timeout. **Do not stress-test.** |
| **When** | Later |

#### B.2.9 Gift card admin board fallback loads all cards

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend / Database |
| **File** | `apps/api/src/gift-cards/gift-cards-admin-board.service.ts:204-210` |
| **Problem** | When `GiftCardBatch` table missing (P2021), fallback loads all gift cards. |
| **Why it matters** | Edge case but unbounded. |
| **Safe fix** | Add `take` to fallback path. |
| **When** | Later |

#### B.2.10 bcrypt/argon2 CPU on auth path

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend |
| **File** | `apps/api/src/common/password-crypto.ts`, `apps/api/src/auth/auth.service.ts:87,124-133` |
| **Problem** | Password hash (cost 12) and legacy rehash on login are CPU-bound. |
| **Why it matters** | Login storm consumes CPU; amplifies Cloud Run scaling costs. |
| **Safe fix** | Stricter auth rate limits (primary); consider async rehash. |
| **When** | Auth rate limits now; rehash later |

#### B.2.11 Many routes bypass throttling entirely

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend / Security |
| **File** | Multiple controllers — `@SkipThrottle()` on studio, `/users/me`, admin lists, SSE, reports |
| **Problem** | 10+ routes skip global throttle completely instead of higher limits. |
| **Why it matters** | Burst traffic on skipped routes is unbounded. |
| **Safe fix** | Replace `@SkipThrottle()` with `@Throttle({ limit: 300 })` or similar. |
| **When** | Later |

#### B.2.12 Redis cache optional — DB fallback

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Backend |
| **File** | `apps/api/src/cache/redis-cache.service.ts:17-30` |
| **Problem** | Without Upstash env vars, all public reads hit PostgreSQL directly. |
| **Why it matters** | Staging load test without Redis will not reflect production caching behavior. |
| **Safe fix** | Ensure Upstash configured in staging before load test. |
| **When** | Staging setup |

#### B.2.13 Positive: public read caching exists

| Field | Value |
|-------|-------|
| **Severity** | Info |
| **Area** | Backend |
| **File** | `apps/api/src/cache/public-cache-keys.ts`, coaches/content/studio/schedule services |
| **Problem** | N/A — this is a strength. |
| **When** | Keep |

---

### B.3 Database Resilience

#### B.3.1 Connection pool not wired in code

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Database / Deployment |
| **File** | `.env.example` (L35-36), `apps/api/src/prisma/prisma.service.ts` |
| **Problem** | `DATABASE_CONNECTION_LIMIT` and `DATABASE_POOL_TIMEOUT` documented but Prisma uses default client with no URL param injection. |
| **Why it matters** | Cloud Run scales instances → each holds connections → Neon pool exhaustion → 503/500 cascade. |
| **Safe fix** | Append `connection_limit` to `DATABASE_URL` or use Prisma datasource URL params; document Neon pooler requirement. |
| **When** | Before stress test |

#### B.3.2 Missing indexes (report only — no migrations without approval)

| Index need | Severity | Justification | File |
|------------|----------|---------------|------|
| `AuditLog (entityType, action, createdAt)` | High | Cron/analytics query audit table repeatedly; no indexes in schema | `packages/database/prisma/models/studio.prisma:85-94` |
| `WaitlistEntry (status, offerExpiresAt)` | Medium | Cron stale-offer query | `apps/api/src/waitlist/waitlist-offers.service.ts:97-101` |
| `ClassSession (coachId, startsAt)` | Medium | Coach panel date-range queries | `apps/api/src/coaches/coaches-panel.service.ts` |
| `ContactMessage (subject, createdAt)` | Medium | Duplicate check on account deletion | `apps/api/src/users/users.service.ts:265-271` |

**When:** Later — requires migration approval and prod impact assessment.

#### B.3.3 AuditLog schema/migration drift risk

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Database |
| **File** | `packages/database/prisma/models/studio.prisma` |
| **Problem** | `AuditLog` model in schema; verify `CREATE TABLE "AuditLog"` exists in applied migrations for target environment. |
| **Why it matters** | Audit writes may fail silently (swallowed in `audit.service.ts`). |
| **Safe fix** | Verify migration status on staging DB before test. |
| **When** | Staging setup |

#### B.3.4 Positive: booking/package transactions

| Field | Value |
|-------|-------|
| **Severity** | Info |
| **Area** | Database |
| **File** | `apps/api/src/bookings/bookings-client.service.ts`, `packages-public.service.ts`, `payments-confirm.service.ts` |
| **Problem** | N/A — interactive `$transaction` with extended timeout on booking create. |
| **When** | Keep |

#### B.3.5 Low-risk race: gift checkout outside transaction

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Database |
| **File** | `apps/api/src/payments/payments-checkout.service.ts:58-80` |
| **Problem** | Pending payment created outside transaction with batch validation. |
| **Why it matters** | Inventory race under concurrent checkout — business logic concern, not load test target. |
| **When** | Later — requires approval |

---

### B.4 Frontend Performance

#### B.4.1 Home and schedule are highest-traffic amplification paths

| Field | Value |
|-------|-------|
| **Severity** | Critical (for load test planning) |
| **Area** | Frontend |
| **File** | `apps/web/src/app/[locale]/(marketing)/page.tsx`, `schedule/page.tsx`, `use-marketing-schedule-member-state.ts` |
| **Problem** | Per member tab: SSR 30-day schedule + idle client refresh + `/bookings/me` + `/waitlist/me` + SSE + 15s visibility timer. |
| **Why it matters** | 1 page view → 3–5 API calls + persistent SSE. Under load test this multiplies through Next BFF rewrite. |
| **Safe fix** | See B.4.3, B.4.4. |
| **When** | Before stress test |

#### B.4.2 Marketing layout forces dynamic rendering via `headers()`

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Frontend |
| **File** | `apps/web/src/components/marketing/marketing-layout-path-boundary.tsx:42`, `apps/web/src/i18n/request.ts`, `apps/web/src/server/cached-users-me.ts` |
| **Problem** | `headers()` in layout/i18n/auth prevents static/ISR HTML caching for public pages. |
| **Why it matters** | Every guest request rebuilds HTML on Vercel even when API data is cached (60s). |
| **Safe fix** | Isolate dynamic auth/pathname into parallel routes or middleware props; keep marketing shell static. |
| **When** | Later (larger refactor) |

#### B.4.3 Duplicate client schedule refresh after SSR

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Frontend |
| **File** | `apps/web/src/components/marketing/schedule/use-marketing-schedule-member-state.ts:111-145` |
| **Problem** | When `initialItems.length > 0`, hook still schedules `refreshSchedule()` via idle callback. |
| **Why it matters** | Doubles schedule API traffic for every page load. |
| **Safe fix** | Skip refresh when SSR data exists and is within revalidate window; rely on SSE for updates. |
| **When** | **Now** — safe, no business logic change |

#### B.4.4 Duplicate waitlist SSE refetch handlers

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Frontend |
| **File** | `use-marketing-schedule-member-state.ts:158-162`, `apps/web/src/hooks/use-member-waitlist-data.ts:86-90` |
| **Problem** | Both register `REALTIME_REFETCH_KEYS.WAITLIST_ME`; registry runs all handlers → 2× `/waitlist/me` per SSE event. |
| **Why it matters** | Doubles waitlist API calls on every realtime event. |
| **Safe fix** | Remove waitlist registration from `useMarketingScheduleMemberState`; keep only in `useMemberWaitlistData`. |
| **When** | **Now** |

#### B.4.5 Public schedule lacks cache tag for on-demand revalidation

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Frontend |
| **File** | `apps/web/src/components/marketing/schedule/marketing-schedule-data.ts` |
| **Problem** | Schedule fetch has no Next cache tags (unlike packages/coaches/studio). Admin edits propagate only within 60s TTL. |
| **Safe fix** | Add `PUBLIC_CACHE_TAGS.schedule` + admin revalidation hook. |
| **When** | Later |

#### B.4.6 Only `story` page has explicit `revalidate`

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Area** | Frontend |
| **File** | `apps/web/src/app/[locale]/(marketing)/story/page.tsx` |
| **Problem** | `privacy`, `terms`, `refund`, `explore` could use `revalidate = 86400` but don't. |
| **Safe fix** | Add page-level revalidate to static legal pages. |
| **When** | **Now** — safe |

#### B.4.7 ~200+ client components; schedule tree fully client-hydrated

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Frontend |
| **File** | `apps/web/src/components/marketing/schedule/*` |
| **Problem** | Full schedule grid is client component; large JS bundle on critical path. |
| **Why it matters** | TTFB + hydration cost under traffic; Vercel function duration. |
| **Safe fix** | Incremental: server skeleton + client row actions only. |
| **When** | Later |

#### B.4.8 API traffic routed through Next rewrite

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Frontend / Deployment |
| **File** | `apps/web/next.config.ts` (rewrite `/api/v1/*` → Nest) |
| **Problem** | Browser client calls hit Vercel first, then proxy to Cloud Run. |
| **Why it matters** | Load test of web UI loads both Vercel and Cloud Run. SSE correctly uses direct API origin per TECH_CARD. |
| **Safe fix** | Monitor both layers; for API-only load test, hit Cloud Run directly. |
| **When** | Test planning |

#### B.4.9 Positive: server-side patterns

| Field | Value |
|-------|-------|
| **Severity** | Info |
| **Area** | Frontend |
| **File** | `apps/web/src/lib/server-api.ts`, `public-cache-tags.ts` |
| **Problem** | N/A — React `cache()` dedupe, 60s ISR on public reads, tagged revalidation for packages/coaches/studio. |
| **When** | Keep |

---

### B.5 Deployment & Cloud Readiness

#### B.5.1 No graceful shutdown hooks

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Deployment |
| **File** | `apps/api/src/main.ts` |
| **Problem** | `app.enableShutdownHooks()` not called. SSE in-memory map not drained on SIGTERM. |
| **Why it matters** | Cloud Run sends SIGTERM on scale-down; in-flight requests and SSE connections dropped abruptly. |
| **Safe fix** | Add `enableShutdownHooks()`; drain SSE connections in `onModuleDestroy` of realtime module. |
| **When** | **Now** |

#### B.5.2 Shallow health check

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Deployment |
| **File** | `apps/api/src/app.controller.ts:5-8` |
| **Problem** | `GET /v1/health` returns `{ status: 'ok' }` — no DB or Redis check. |
| **Why it matters** | Cloud Run routes traffic to instances that cannot reach database. |
| **Safe fix** | Add `@nestjs/terminus` or lightweight `$queryRaw` SELECT 1 + Redis ping. |
| **When** | Before stress test |

#### B.5.3 SSE on Cloud Run

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Area** | Deployment |
| **File** | `apps/api/src/realtime/realtime-sse.controller.ts`, `realtime.constants.ts` |
| **Problem** | Long-lived connections; `@SkipThrottle()`; max 5 public connections/IP; in-memory connection map not shared across instances. |
| **Why it matters** | Holds Cloud Run instances; multi-instance realtime inconsistent; load test with many SSE tabs will exhaust instances. |
| **Safe fix** | Document limits; consider min instances; future: Redis pub/sub. **Limit SSE connections in load test.** |
| **When** | Test planning |

#### B.5.4 In-process crons duplicate on multi-instance

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Deployment |
| **File** | `apps/api/src/notifications/notifications-cron.service.ts`, `apps/api/src/waitlist/waitlist-offers.service.ts` |
| **Problem** | `@Cron` runs in every Cloud Run replica — no leader election. |
| **Why it matters** | Duplicate reminder emails, duplicate waitlist processing under scale-out. |
| **Safe fix** | External scheduler (Cloud Scheduler → single endpoint) or distributed lock. |
| **When** | Later |

#### B.5.5 Docker image builds entire monorepo

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Deployment |
| **File** | `Dockerfile.api` |
| **Problem** | Single-stage; copies full repo including web/mobile; no multi-stage slim image. |
| **Why it matters** | Larger image → slower cold starts on Cloud Run. |
| **Safe fix** | Multi-stage build copying only api + packages/database. |
| **When** | Later |

#### B.5.6 Prisma connects on module init (cold start)

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Deployment |
| **File** | `apps/api/src/prisma/prisma.service.ts:33-35` |
| **Problem** | `$connect()` on startup adds cold-start latency. |
| **Why it matters** | First request after scale-from-zero is slow. |
| **Safe fix** | Vercel warm-api cron exists (`apps/web/src/app/api/cron/warm-api/route.ts`); configure Cloud Run min instances for staging test. |
| **When** | Staging setup |

#### B.5.7 No APM/metrics integration

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Area** | Deployment |
| **File** | Repo-wide |
| **Problem** | Pino logging only; no Sentry/OpenTelemetry/Prometheus. |
| **Why it matters** | Hard to interpret load test results without p95/p99 dashboards. |
| **Safe fix** | Enable Cloud Run metrics + Neon dashboard; optional Sentry for staging. |
| **When** | Before stress test (observability setup) |

#### B.5.8 Positive: logging and warm cron

| Field | Value |
|-------|-------|
| **Severity** | Info |
| **Area** | Deployment |
| **File** | `apps/api/src/logging/http-log-serializers.ts`, `apps/web/vercel.json`, `warm-api/route.ts` |
| **Problem** | N/A — headers/cookies stripped from logs; warm cron protected by `CRON_SECRET`. |
| **When** | Keep |

---

## C. Safe Quick Wins

Changes that do **not** alter business logic, user flows, or database schema:

| # | Change | File(s) | Impact |
|---|--------|---------|--------|
| 1 | Remove `email` from public coaches list select | `coaches-public.service.ts` | Stops PII leak |
| 2 | Enforce `isBlocked` in login + JWT validate | `auth.service.ts`, `jwt.strategy.ts` | Closes auth bypass |
| 3 | Clamp `GET /classes/sessions` to 30-day window + add safety `take` | `classes.controller.ts`, `classes-sessions-public.service.ts` | Stops DB scan abuse |
| 4 | Add `@Throttle({ limit: 5-10 })` on auth routes | `auth.controller.ts` | Brute-force protection |
| 5 | `app.enableShutdownHooks()` in bootstrap | `main.ts` | Graceful Cloud Run shutdown |
| 6 | Remove duplicate waitlist SSE handler | `use-marketing-schedule-member-state.ts` | Halves waitlist refetches |
| 7 | Skip client schedule refresh when SSR data present | `use-marketing-schedule-member-state.ts` | Halves schedule API calls |
| 8 | Add `revalidate = 86400` to legal/static pages | `privacy`, `terms`, `refund`, `explore` pages | Reduces Vercel compute |
| 9 | Add `take` to finance summary payments query | `reports-export.service.ts` | Caps admin query size |
| 10 | DB-aware health check (SELECT 1) | `app.controller.ts` or Terminus | Better load balancer decisions |
| 11 | Pass `headerAccount` from layout boundary to header slot | `marketing-layout-path-boundary.tsx` | Removes duplicate auth resolution work |
| 12 | Add cache tag for public schedule fetch | `marketing-schedule-data.ts`, `public-cache-tags.ts` | Faster admin invalidation |

---

## D. Risky Changes Requiring Approval

These may affect business logic, auth behavior, schema, or production:

| # | Change | Risk | Approval needed from |
|---|--------|------|---------------------|
| 1 | Require email verification before member actions | Changes member onboarding flow | Product |
| 2 | Remove `accessToken` from login/register JSON body | May break mobile/API clients | Mobile team |
| 3 | Add DB indexes (AuditLog, WaitlistEntry, ClassSession) | Migration + prod lock time | DBA / DevOps |
| 4 | Paginate `/bookings/me` default scopes | UI may expect full list | Product / Frontend |
| 5 | Move email broadcast to background queue | Changes admin UX (async) | Product |
| 6 | Replace SSE with polling-only on Cloud Run | Changes realtime UX | Product |
| 7 | Enforce email verification guard globally | Blocks unverified users | Product |
| 8 | Gift checkout transaction wrapping | Payment inventory semantics | Payments owner |
| 9 | JWT claims cache (skip DB per request) | Stale role/block status window | Security |
| 10 | Static marketing layout refactor (remove `headers()`) | Routing/auth architecture | Frontend lead |
| 11 | Split schedule server/client boundary | Booking UI refactor | Frontend lead |
| 12 | Cloud Run min instances > 0 | Cost increase | DevOps / Finance |
| 13 | External cron / leader election | Infrastructure change | DevOps |
| 14 | Per-email password reset cooldown | Slightly changes reset UX | Product |

---

## E. Stress Test Readiness Checklist

### E.1 Safe pages to test (GET, public, read-only)

| Page | Notes |
|------|-------|
| `/[locale]/` (home) | High traffic; monitor schedule SSR + SSE |
| `/[locale]/schedule` | Highest API amplification |
| `/[locale]/coaches` | Cached 60s |
| `/[locale]/package` | Cached 60s |
| `/[locale]/contact` | Cached studio info |
| `/[locale]/story` | ISR 3600s — good baseline |
| `/[locale]/privacy`, `/terms`, `/refund` | Low API; good static baseline |
| `/[locale]/explore` | No API — ideal static test |

### E.2 Safe GET endpoints to test (staging backend, direct)

| Endpoint | Rate limit | Notes |
|----------|------------|-------|
| `GET /v1/health` | 120/min | Baseline latency only |
| `GET /v1/studio` | SkipThrottle | Cached |
| `GET /v1/studio/home-sections` | SkipThrottle | Cached |
| `GET /v1/coaches` | 120/min | Cached; verify no email after fix |
| `GET /v1/coaches/:id` | 120/min | Single resource |
| `GET /v1/packages/plans` | 120/min | Small payload |
| `GET /v1/content/posts` | 120/min | Cached |
| `GET /v1/content/posts/:slug` | 120/min | Single post |
| `GET /v1/schedule/public?from=&to=` | 120/min | Clamped 30 days; primary test target |
| `GET /v1/classes/sessions/:id` | 120/min | Single session |
| `GET /v1/classes/types` | SkipThrottle | Small; enumeration only |

**Use clamped date params** on schedule/sessions. Do not test with year-wide ranges until B.2.1 is fixed.

### E.3 Forbidden endpoints — DO NOT stress test

| Category | Endpoints | Reason |
|----------|-----------|--------|
| **Auth mutations** | `POST /auth/login`, `/register`, `/request-password-reset`, `/reset-password` | Email cost, bcrypt CPU, account side effects |
| **Booking mutations** | `POST/PATCH/DELETE /bookings/*` | Consumes package credits, changes capacity |
| **Payment** | All `/payments/*`, `/payments/arca/*` | Financial side effects |
| **Waitlist mutations** | `POST/DELETE /waitlist/*` | Business state changes |
| **Package subscribe** | `POST /packages/subscribe` | Creates memberships |
| **Gift cards** | All `/gift-cards/*` | Financial + code generation |
| **Uploads** | All `*-image*` POST routes | Disk/R2 writes |
| **Admin mutations** | All `POST/PATCH/DELETE` under admin/coach/manager | Data corruption risk |
| **Notifications broadcast** | `POST /notifications/admin/broadcast` | Sends real emails |
| **Package reconcile** | `POST /packages/admin/reconcile-sessions` | Mass DB writes |
| **CSV exports** | `GET /reports/*.csv` | Large reads |
| **Admin management board** | `GET /bookings/admin/management` | 6 parallel heavy queries |
| **Coach salary** | `GET /coaches/admin/salary-summaries` | N+1 queries |
| **SSE load flood** | `GET /realtime/public`, `/realtime/events` | Limited to 5/IP; holds instances — test separately with cap |

### E.4 Required staging setup

- [ ] Dedicated **staging database** (Neon branch) — never load test against production DB
- [ ] **Upstash Redis** configured (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) to match prod caching behavior
- [ ] **Cloud Run staging** service with documented min/max instances
- [ ] **Vercel preview** frontend pointed at staging API (`API_INTERNAL_URL`)
- [ ] **Connection pool** verified: Neon pooler URL in `DATABASE_URL`, connection limit documented
- [ ] **CRON_SECRET** set; verify warm-api cron does not hit prod
- [ ] **Resend/email** disabled or sandboxed in staging (prevent accidental sends)
- [ ] **Arca/payment** sandbox or disabled (`NEXT_PUBLIC_ARCA_CHECKOUT_ENABLED=false`)
- [ ] Apply P0 fixes (blocked user, coach email, session clamp) before test
- [ ] Baseline metrics captured for 24h normal staging traffic

### E.5 Staged load testing plan

| Stage | Target | Goal | Max concurrency |
|-------|--------|------|-----------------|
| **1. Local prod build** | `pnpm build:web && pnpm start` + local API | Validate SSR + hook behavior | 5–10 VUs |
| **2. API-only staging** | Cloud Run staging direct | Measure p95 on safe GET endpoints | 20–50 VUs |
| **3. Vercel preview + staging API** | Full page loads (home, schedule) | Measure BFF amplification | 10–30 VUs |
| **4. Staging soak** | Stage 3 for 30–60 min | Connection pool + memory leak detection | 20 VUs sustained |
| **5. Production smoke** | Prod home + health only | Verify no regression | 1–2 VUs, 1 min max |

**Tooling suggestion:** k6 or Artillery with scenario files per stage. Never run destructive or mutation scenarios.

### E.6 Metrics to monitor

| Metric | Source | Alert threshold (staging) |
|--------|--------|---------------------------|
| **p95 latency** | Cloud Run / k6 | > 2s on `GET /schedule/public` |
| **p99 latency** | Cloud Run / k6 | > 5s on any safe GET |
| **Error rate** | Cloud Run logs | > 1% |
| **HTTP 500/502/503** | Cloud Run + Vercel | Any sustained > 0.5% |
| **DB connection usage** | Neon dashboard | > 80% of pool limit |
| **Cloud Run CPU/RAM** | GCP metrics | CPU > 85% sustained |
| **Vercel function duration** | Vercel analytics | p95 > 10s |
| **Slowest endpoint** | Pino access logs | Identify top 3 by duration |
| **Prisma query count** | Enable query log in staging only | Spike per request on schedule page |
| **Redis hit rate** | Upstash dashboard | < 50% on public reads = misconfiguration |
| **SSE active connections** | Custom log/metric | > 100 per instance |

---

## F. Final Recommendation

### Fix first (before any stress test)

1. **Security P0:** Enforce `isBlocked` in auth path.
2. **Security P0:** Remove coach emails from public API.
3. **Database P0:** Clamp `GET /classes/sessions` date range (same 30-day rule as schedule).
4. **Frontend P1:** Remove duplicate waitlist SSE handler + skip redundant schedule client refresh.
5. **Backend P1:** Auth-specific rate limits on login/register/password-reset.
6. **Deployment P1:** `enableShutdownHooks()` + DB health check.
7. **Database P1:** Cap finance summary payments query with `take`.
8. **Staging P1:** Configure Upstash Redis + verify Neon pooler connection limits.

### Then run staged load test

Start with **API-only staging** on safe GET endpoints (`/health`, `/schedule/public`, `/coaches`, `/studio`) to establish baseline p95/p99. Then add **Vercel preview + home/schedule** at low concurrency (10–20 VUs). Only after staging soak passes, run a **1–2 VU production smoke** on home + health.

### Do not stress test until fixed

- `GET /classes/sessions` with wide date ranges (until clamp applied)
- Any auth, booking, payment, waitlist, upload, broadcast, or admin endpoint
- SSE connection floods without instance limits documented

### Expected first failure modes (if testing without fixes)

1. PostgreSQL connection pool exhaustion (Cloud Run scale-out + no pool limits)
2. `GET /classes/sessions` or unclamped queries causing slow queries and timeouts
3. Home/schedule member traffic multiplying `/bookings/me` + schedule calls
4. Cloud Run instance hold from SSE during concurrent page load test
5. Auth endpoint abuse causing bcrypt CPU saturation

---

## Appendix: Key file reference

| Area | Path |
|------|------|
| API bootstrap | `apps/api/src/main.ts` |
| Global throttle | `apps/api/src/app.module.ts` |
| JWT validation | `apps/api/src/auth/jwt.strategy.ts` |
| Auth service | `apps/api/src/auth/auth.service.ts` |
| Public coaches | `apps/api/src/coaches/coaches-public.service.ts` |
| Public sessions | `apps/api/src/classes/classes-sessions-public.service.ts` |
| Schedule range cap | `apps/api/src/schedule/public-schedule-range.ts` |
| Prisma service | `apps/api/src/prisma/prisma.service.ts` |
| Redis cache | `apps/api/src/cache/redis-cache.service.ts` |
| SSE controller | `apps/api/src/realtime/realtime-sse.controller.ts` |
| Schedule member hook | `apps/web/src/components/marketing/schedule/use-marketing-schedule-member-state.ts` |
| Server API fetch | `apps/web/src/lib/server-api.ts` |
| Marketing layout | `apps/web/src/components/marketing/marketing-layout-path-boundary.tsx` |
| Docker | `Dockerfile.api` |
| Vercel cron | `apps/web/vercel.json`, `apps/web/src/app/api/cron/warm-api/route.ts` |
| Prisma schema | `packages/database/prisma/schema.prisma` |

---

*Generated by read-only codebase audit. No changes applied. Approve fixes before implementation.*
