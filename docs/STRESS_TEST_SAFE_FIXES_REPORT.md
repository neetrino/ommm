# Stress Test Safe Fixes — Implementation Report

**Date:** 2026-07-07  
**Scope:** Approved safe fixes from [STRESS_TEST_READINESS_AUDIT.md](./STRESS_TEST_READINESS_AUDIT.md)  
**Repository:** [neetrino/ommm](https://github.com/neetrino/ommm.git)

---

## Summary

Eight approved reliability/security hardening changes were implemented without altering business logic, user flows, database schema, payment/booking/email/admin behavior, or UI design.

---

## A. Files Changed

| File | Change |
|------|--------|
| `apps/api/src/auth/auth.service.ts` | Reject login when `user.isBlocked` |
| `apps/api/src/auth/jwt.strategy.ts` | Reject JWT validation when `user.isBlocked` |
| `apps/api/src/auth/auth.controller.ts` | Stricter throttling on auth mutation routes |
| `apps/api/src/auth/auth-blocked-user.spec.ts` | **New** — blocked-user unit tests |
| `apps/api/src/coaches/coaches-public.service.ts` | Removed `email` from public coach list select |
| `apps/api/src/classes/classes.controller.ts` | Clamps `from`/`to` via `resolvePublicScheduleRange` |
| `apps/api/src/classes/classes-sessions-public.service.ts` | Requires bounded `to`, adds defensive `take` |
| `apps/api/src/classes/classes.service.ts` | Updated type signature (`to` required) |
| `apps/api/src/classes/classes-sessions-public.service.spec.ts` | **New** — take/range query test |
| `apps/api/src/main.ts` | `app.enableShutdownHooks()` |
| `apps/api/src/app.controller.ts` | DB-aware health check (`SELECT 1`) |
| `apps/api/src/app.controller.spec.ts` | Updated health tests |
| `apps/web/src/components/marketing/schedule/use-marketing-schedule-member-state.ts` | Removed duplicate waitlist SSE handler; skip idle refresh when SSR data exists |

**Not changed:** `apps/api/src/app.module.ts` — global throttle remains 120 req/min; per-route `@Throttle` override is sufficient.

---

## B. Fixes Implemented

### 1. Enforce blocked user protection

- **Files:** `auth.service.ts`, `jwt.strategy.ts`
- After successful credential verification in `login`, if `user.isBlocked === true` → `UnauthorizedException`.
- In `JwtStrategy.validate`, after loading the user, same check.
- Tests added in `auth-blocked-user.spec.ts`.

### 2. Remove public coach email exposure

- **File:** `coaches-public.service.ts`
- `listPublic()` no longer selects `user.email`.
- `getPublic()` already omitted email — unchanged.

### 3. Clamp public class sessions date range

- **Files:** `classes.controller.ts`, `classes-sessions-public.service.ts`, reuses `schedule/public-schedule-range.ts`
- `GET /classes/sessions` uses `resolvePublicScheduleRange()` — same 30-day studio-timezone window as `/schedule/public`.
- Queries always include both `gte` and `lte` on `startsAt`.
- Defensive `take: 2000` via `PUBLIC_CLASS_SESSIONS_LIST_LIMIT`.

### 4. Add stricter auth throttling

- **File:** `auth.controller.ts`
- Global throttle unchanged (120/min).
- `@Throttle({ default: { limit: 10, ttl: 60_000 } })` on:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/request-password-reset`
  - `POST /auth/reset-password`

### 5. Enable Cloud Run graceful shutdown hooks

- **File:** `main.ts`
- Added `app.enableShutdownHooks()` in bootstrap.
- Prisma already disconnects via `onModuleDestroy` in `PrismaService`.

### 6. Improve health check safely

- **File:** `app.controller.ts`
- `GET /v1/health` runs lightweight `SELECT 1` via Prisma.
- Healthy: `{ status: 'ok', database: 'ok' }`
- Unhealthy: HTTP 503 with `{ status: 'unhealthy', database: 'unavailable' }`
- Redis not required for health to pass.

### 7. Remove duplicate waitlist SSE refetch handler

- **Files:** `use-marketing-schedule-member-state.ts`, `use-member-waitlist-data.ts`
- Removed `REALTIME_REFETCH_KEYS.WAITLIST_ME` registration from `useMarketingScheduleMemberState`.
- Single registration kept in `useMemberWaitlistData`.

### 8. Skip redundant client schedule refresh when SSR data is fresh

- **File:** `use-marketing-schedule-member-state.ts`
- When `initialItems.length > 0`, no idle/timeout `refreshSchedule` on mount.
- SSE (`SCHEDULE_PUBLIC`), `useScheduleLiveSync`, and post-booking/cancel refreshes still active.

---

## C. Tests and Checks Run

| Check | Result |
|-------|--------|
| Targeted API tests (`auth-blocked-user`, `app.controller`, `classes-sessions-public`, `public-schedule-range`) | **8/8 passed** |
| Full API test suite | **96/97 passed** — 1 pre-existing failure in `resolve-api-port.spec.ts` |
| `pnpm run build:api` | **Passed** |
| `pnpm run lint` (api) | **Passed** |
| `pnpm run lint` (web) | **Passed** |
| Public coaches email grep | **No `email` in `coaches-public.service.ts`** |
| `isBlocked` auth coverage | **Service + strategy + unit tests** |
| Unlimited `/classes/sessions` range | **Clamped via `resolvePublicScheduleRange` + required `to`** |
| New DB migrations | **None created** |

---

## D. Intentionally Not Changed

- Booking, payment, email sending, admin mutation, package subscription, waitlist mutation, upload, gift card logic
- Google OAuth flow (`isBlocked` not added to OAuth completion — audit scoped login + JWT only)
- UI/design, production env files, architecture
- Global throttle config in `app.module.ts`
- Unapproved audit items (legal page ISR, finance query `take`, cache tags, header account dedup, etc.)
- `complete-google-signup` throttling (not in approved list)

---

## E. Risks and Follow-Up Items

| # | Item | Notes |
|---|------|-------|
| 1 | Existing JWTs for blocked users | Tokens issued before block are rejected on next request via JWT validate; no revocation list added (audit marked that as risky) |
| 2 | `GET /classes/sessions` without `to` | Previously unbounded upward; now defaults to today + 30 days. Mobile/web 14-day clients unaffected |
| 3 | `take: 2000` cap | Extremely dense schedules within 30 days could hit limit; normal load should be well below |
| 4 | Health check behavior | Load balancers now receive 503 when DB is down; confirm Cloud Run probe config |
| 5 | Pre-existing test failure | `resolve-api-port.spec.ts` — unrelated to this work |
| 6 | Optional follow-up (not approved) | Block `isBlocked` in Google OAuth; throttle `complete-google-signup`; invalidate Redis coach cache after email removal from cached shape |

---

## Verification Checklist

- [x] Public coaches no longer expose email in unauthenticated API
- [x] Auth blocked-user behavior covered by tests
- [x] `/classes/sessions` cannot query unlimited date ranges
- [x] No database migration created
- [x] No business logic, UI, payment, booking, email, or admin mutation behavior changed

---

## Related Documents

- [STRESS_TEST_READINESS_AUDIT.md](./STRESS_TEST_READINESS_AUDIT.md) — source audit
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — API endpoint reference
