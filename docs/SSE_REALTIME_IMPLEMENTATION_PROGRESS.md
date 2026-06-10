# SSE Realtime — Implementation Progress

**Source of truth:** [`SSE_REALTIME_IMPLEMENTATION.md`](./SSE_REALTIME_IMPLEMENTATION.md)  
**Started:** 2026-06-10  
**Last updated:** 2026-06-10 (Phase 1 backend + web P0 complete)

---

## Phase overview

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | Analysis + tracking | **DONE** |
| 1 | Backend P0 + Web P0 | **DONE** |
| 2 | Verification scenarios | TODO |
| 3 | Cleanup (fallback-only poll, doc updates) | TODO |

---

## Phase 0 — Analysis and tracking

| Task | Status | Notes |
|------|--------|-------|
| Read `SSE_REALTIME_IMPLEMENTATION.md` | DONE | Plan reviewed; REST + thin SSE + disconnect fallback confirmed |
| Inspect backend modules/services | DONE | See implementation map below |
| Inspect frontend schedule/booking/waitlist/notification/polling | DONE | See implementation map below |
| Create this progress file | DONE | — |
| Write discovered implementation map | DONE | — |

### Discovered implementation map

#### Backend (existing)

| Concern | Actual path | Notes |
|---------|-------------|-------|
| App bootstrap / CORS | `apps/api/src/main.ts`, `apps/api/src/cors-origin.ts` | `credentials: true`; cookie JWT via `ACCESS_TOKEN_COOKIE` |
| JWT cookie auth | `apps/api/src/auth/jwt.strategy.ts`, `apps/api/src/common/constants.ts` | Cookie + Bearer extractors |
| Public schedule cache | `apps/api/src/schedule/schedule.service.ts` | `invalidatePublicCache()` exists |
| Cancel-intent (in-process) | `apps/api/src/cache/booking-cancel-intent.service.ts` | Map TTL 10 min; applied in schedule public read |
| Bookings mutations | `apps/api/src/bookings/bookings.service.ts` | `book`/`cancel` invalidate cache; **`adminCancel`/`moveBooking` do not** |
| Waitlist mutations | `apps/api/src/waitlist/waitlist.service.ts` | Cron `expireOffersCron` gated by `ENABLE_WAITLIST_BACKGROUND_JOBS` |
| Payment → booking | `apps/api/src/payments/payments.service.ts` | `fulfillDropInPayment` in tx; **no cache invalidation or realtime today** |
| Realtime module | *(none)* | Greenfield under `apps/api/src/realtime/` |
| API prefix | `apps/api/src/common/constants.ts` | `v1` → endpoints `/v1/realtime/...` |

#### Backend gaps (plan §3.8 — confirmed in code)

| Issue | Location | Action |
|-------|----------|--------|
| Admin cancel skips public cache | `bookings.service.ts` → `adminCancel` | Add `invalidatePublicCache` before emit |
| Move booking skips public cache | `bookings.service.ts` → `moveBooking` | Add `invalidatePublicCache` (both sessions) before emit |
| Promote waitlist skips public cache | `waitlist.service.ts` → `promoteToBooking` | Add `invalidatePublicCache` before emit |
| Payment drop-in confirm skips cache/realtime | `payments.service.ts` → `confirmPayment` (DROPIN) | Add cache + same events as `book` |
| Cancel-intent cross-instance | `booking-cancel-intent.service.ts` | Document only (Redis phase 3) |

#### Frontend (existing refresh mechanisms)

| Mechanism | Path | Behavior |
|-----------|------|----------|
| **15s schedule poll** | `apps/web/src/hooks/use-schedule-live-sync.ts` | Polls while tab visible; listens `NOTIFICATIONS_REFRESH_EVENT` |
| Poll interval constant | `apps/web/src/lib/public-schedule-constants.ts` | `SCHEDULE_LIVE_POLL_INTERVAL_MS = 15_000` |
| Local clock tick | `marketing-schedule-view.tsx` | `SCHEDULE_CLOCK_TICK_MS` — hides past sessions, no network |
| Same-browser CustomEvent | `apps/web/src/lib/notifications-refresh-event.ts` | `ommm:notifications-refresh` |
| Schedule view integration | `apps/web/src/components/marketing/schedule/marketing-schedule-view.tsx` | Poll + CustomEvent + optimistic spot delta on book |
| Waitlist data hook | `apps/web/src/hooks/use-member-waitlist-data.ts` | GET `/waitlist/me`; listens CustomEvent |
| Header notifications | `apps/web/src/components/shell/header-notifications-menu.tsx` | Uses waitlist hook; `dispatchNotificationsRefresh` on book |
| Cancel-intent client | `apps/web/src/lib/booking-cancel-intent.ts`, `cancel-booking-button.tsx` | POST/DELETE cancel-intent; relies on poll for cross-user |
| REST client | `apps/web/src/lib/api.ts` | Proxied `/api/v1` — **SSE must bypass via `NEXT_PUBLIC_API_ORIGIN` (not present yet)** |
| Next rewrite | `apps/web/next.config.ts` | `/api/v1/*` → API internal URL |
| Realtime client infra | *(none)* | Planned under `apps/web/src/lib/realtime/` |
| Shell wiring | `marketing-site-header-with-client-account.tsx`, `workspace-shell.tsx` | No RealtimeProvider yet |

#### Path deviations from plan doc

| Plan reference | Actual |
|----------------|--------|
| `apps/api/src/cache/booking-cancel-intent.service.ts` | Correct |
| Schedule module name | `ScheduleItemsModule` in `apps/api/src/schedule/schedule.module.ts` |
| `NEXT_PUBLIC_API_ORIGIN` | Not in repo yet — required for Phase 2 web |

---

## Phase 1 — Backend P0

| Task | Status | Notes |
|------|--------|-------|
| Create `RealtimeModule` | DONE | `apps/api/src/realtime/realtime.module.ts` (`@Global()`) |
| Create realtime event types | DONE | `realtime.types.ts` — plan §2.2 event names + payloads |
| Create `RealtimePublisherService` | DONE | Registry, emit API, booking/waitlist helpers |
| Authenticated SSE `GET /v1/realtime/events` | DONE | `realtime-sse.controller.ts`; `JwtAuthGuard` + cookie auth |
| Public SSE `GET /v1/realtime/public` | DONE | Allowlisted public events only; IP connection cap (5) |
| SSE headers + heartbeat + cleanup | DONE | Manual Express stream; `: ping` comments every 30s; `close`/`error` detach |
| CORS credentialed SSE | DONE | Reuses `main.ts` CORS (`credentials: true`); browser verify in Phase 3 |
| Register module in `app.module.ts` | DONE | `RealtimeModule` imported after `CacheModule` |
| Emit: `book` | DONE | `bookings.service.ts` after `invalidatePublicCache` |
| Emit: `cancel` | DONE | `bookings.service.ts` |
| Emit: `adminCancel` + cache fix | DONE | Added `invalidatePublicCache` + emit |
| Emit: `moveBooking` + cache fix | DONE | Invalidates cache; emits target + old session public events |
| Emit: cancel-intent register/clear | DONE | `cancel-intent.changed` |
| Emit: waitlist join/leave/offer/promote/cron | DONE | `waitlist.service.ts`; cron path via `offerNextIfSlot` |
| Emit: payment drop-in confirm paths | DONE | `payments.service.ts` → `confirmPayment` DROPIN branch |
| API typecheck/lint | DONE | `pnpm exec tsc --noEmit` + `pnpm run build` pass; updated `payments.service.spec.ts` mocks |

---

## Phase 1 — Web P0

| Task | Status | Notes |
|------|--------|-------|
| Shared realtime event types | DONE | `apps/web/src/lib/realtime/realtime-event-types.ts` |
| EventSource wrapper | DONE | `realtime-sse-client.ts` — no permanent close on `onerror` |
| API origin resolver | DONE | `resolve-api-origin.ts` — `NEXT_PUBLIC_API_ORIGIN` → fallback `NEXT_PUBLIC_API_URL` |
| Realtime provider (one tab connection) | DONE | `components/realtime/realtime-provider.tsx` |
| Refetch registry (debounce/dedupe) | DONE | `realtime-refetch-registry.ts` — 200ms debounce, in-flight dedupe |
| Subscription hook | DONE | `hooks/use-realtime-refetch.ts` (plan `use-realtime-subscription.ts` equivalent) |
| Reconnect forced refetch | DONE | `onOpen` → `forceRefetchAllRegistered()` |
| Fallback poll while disconnected (60s) | DONE | `use-schedule-live-sync.ts` + `SCHEDULE_FALLBACK_POLL_MS`; enabled when SSE not connected |
| Wire marketing schedule view | DONE | `marketing-schedule-view.tsx` |
| Wire header notifications + waitlist hook | DONE | `use-member-waitlist-data.ts` registers `waitlist/me` |
| Wire cancel-intent flow | DONE | Via `cancel-intent.changed` → `schedule/public` refetch (no button change) |
| Mount RealtimeProvider in shell | DONE | `marketing-realtime-root.tsx` in marketing layout; `workspace-shell.tsx` for authenticated workspace |
| Web typecheck | BLOCKED | Pre-existing `.next/types` missing notifications page; new files lint-clean |

---

## Phase 2 — Verification

| Scenario | Status | Notes |
|----------|--------|-------|
| Cross-user spot update | TODO | — |
| Cancel-intent hold visible cross-user | TODO | — |
| Waitlist offer badge via SSE | TODO | — |
| Admin cancel → public schedule + offer | TODO | — |
| Booking move both sessions | TODO | — |
| Payment-created booking | TODO | — |
| Reconnect forced refetch | TODO | — |
| Duplicate event burst dedupe | TODO | — |
| Public SSE privacy | TODO | — |
| Subscriber memory cleanup | TODO | — |
| CORS credentials | TODO | — |
| Cache invalidation before emit | TODO | — |

---

## Phase 3 — Cleanup

| Task | Status | Notes |
|------|--------|-------|
| Reduce 15s poll to 60s fallback-only | TODO | After verification |
| Keep local clock tick | TODO | — |
| Keep optimistic CustomEvent where useful | TODO | — |
| Remove duplicate refresh mechanisms | TODO | — |
| Update `docs/TECH_CARD.md` §7.6 | TODO | — |

---

## Deviations and issues log

| Date | Item | Detail |
|------|------|--------|
| 2026-06-10 | Analysis | No existing realtime code; full greenfield backend module |
| 2026-06-10 | `NEXT_PUBLIC_API_ORIGIN` | Uses `NEXT_PUBLIC_API_URL` fallback (already in `.env`); optional alias documented |
| 2026-06-10 | Subscription hook filename | Implemented as `use-realtime-refetch.ts` instead of `use-realtime-subscription.ts` |
| 2026-06-10 | Schedule module import name | Use `ScheduleItemsModule` not `ScheduleModule` (Nest cron) |

---

## Completed work log

*(Updated after each meaningful task.)*

### 2026-06-10 — Phase 0 analysis

- **Status:** Phase 0 tasks marked DONE after codebase inspection
- **Files:** Created `docs/SSE_REALTIME_IMPLEMENTATION_PROGRESS.md`
- **Checks:** Manual read of plan + grep/semantic search across `apps/api` and `apps/web`

### 2026-06-10 — Phase 1 backend P0

- **Status:** All Phase 1 backend P0 tasks DONE
- **New files:** `apps/api/src/realtime/realtime.constants.ts`, `realtime.types.ts`, `realtime-sse.util.ts`, `realtime-publisher.service.ts`, `realtime-sse.controller.ts`, `realtime.module.ts`
- **Modified:** `app.module.ts`, `bookings.service.ts`, `waitlist.service.ts`, `waitlist.module.ts`, `payments.service.ts`, `payments.module.ts`, `payments.service.spec.ts`
- **Checks:** `pnpm exec tsc --noEmit`, `pnpm run build` (api) — pass
- **Behavior:** Thin SSE frames only; public channel never receives `userId`; authenticated stream receives public + user-scoped private events; emit after cache invalidation on booking paths

### 2026-06-10 — Phase 1 web P0

- **Status:** All Phase 1 web P0 tasks DONE
- **New files:** `apps/web/src/lib/realtime/*`, `apps/web/src/components/realtime/*`, `apps/web/src/hooks/use-realtime-refetch.ts`
- **Modified:** `marketing-schedule-view.tsx`, `use-member-waitlist-data.ts`, `use-schedule-live-sync.ts`, `public-schedule-constants.ts`, `(marketing)/layout.tsx`, `marketing-site-header-with-client-account.tsx`, `workspace-shell.tsx`
- **Checks:** ESLint clean on touched files; `tsc` blocked by unrelated missing notifications page in `.next/types`
- **Behavior:** Direct SSE to API origin with credentials; 15s primary poll replaced by SSE + 60s fallback when disconnected; local `CustomEvent` kept for same-browser UX
