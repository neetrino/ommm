# SSE Realtime — Implementation Plan

**Status:** Planned  
**Date:** 2026-06-09  
**Goal:** Replace ad-hoc polling and same-browser-only `CustomEvent` refresh with a single **thin-event SSE** layer. REST remains the source of truth; clients refetch only what changed.

---

## 1. Architecture decision

### Chosen approach

```
REST (read + mutations)  +  SSE (invalidation signals)  +  polling fallback (disconnect only)
```

| Layer | Role |
|-------|------|
| **REST** | Initial load, mutations, paginated admin tables |
| **SSE** | Push thin invalidation events (type + safe IDs only) |
| **Client** | Map event → debounced/deduped refetch of affected REST endpoints |
| **Fallback** | Slow poll (60s) only while SSE is disconnected |

### Why SSE (not WebSocket)

- 95% of needs are **server → client** (spot changed, waitlist offer, booking changed).
- Simpler proxy and ops than WebSocket for this project size.
- Event types stay stable if WebSocket is added later for chat/admin tooling.

### Why thin events (not full payloads)

- Avoids duplicating REST DTOs and cache logic on the wire.
- Public schedule already has Redis cache (`schedule.service` → `RedisCacheService`).
- Smaller payloads, easier versioning.

### General booking rule

**Any code path** that creates, cancels, moves, confirms, expires, or promotes a booking must:

1. Invalidate the same caches as the normal booking flow (`invalidatePublicCache` where applicable).
2. Emit the same realtime events as `book` / `cancel`.

This includes `adminCancel`, `moveBooking`, `promoteToBooking`, and payment confirmation paths that create bookings.

### Important constraints

1. **Do not proxy SSE through Next.js rewrites** — long-lived streams buffer/break. Browser connects **directly** to `NEXT_PUBLIC_API_ORIGIN`.
2. **Cancel-intent holds** are in-process (`BookingCancelIntentService` Map). SSE must emit on register/clear so other users see spot holds without polling.
3. **Emit only after** DB transaction commit and cache invalidation (see §7 Testing — cache race).
4. **Multi-instance production** (later): fan-out via Redis pub/sub; single instance needs no adapter.

---

## 2. Event catalog

Events are delivered as **SSE frames** (not raw JSON lines). The JSON object lives inside the `data` field.

### 2.1 SSE frame format

Each event uses standard SSE fields:

| Field | Required | Purpose |
|-------|----------|---------|
| `event` | Yes | Event type name (e.g. `schedule.invalidate`) |
| `id` | Recommended | Monotonic event id for reconnect bookkeeping |
| `data` | Yes | Single-line JSON payload |

Example frame:

```txt
event: schedule.invalidate
id: 12345
data: {"sessionId":"abc"}

```

Heartbeat (no event name):

```txt
: ping

```

### 2.2 Event types

| `event` | `data` payload | Who should react | REST refetch |
|---------|----------------|------------------|--------------|
| `schedule.invalidate` | `{ sessionId?: string }` | Public schedule / home banner viewers | `GET /schedule/public` |
| `booking.changed` | `{ userId: string, sessionId?: string }` | That user + staff on bookings UI | User: `GET /bookings/me`; Admin: bookings list query |
| `waitlist.changed` | `{ userId: string, sessionId?: string }` | That user + staff on waitlist UI | User: `GET /waitlist/me`; Admin: waitlist active list |
| `waitlist.offer` | `{ userId: string, sessionId: string }` | That user (header bell) | `GET /waitlist/me` |
| `session.changed` | `{ sessionId: string }` | Schedule surfaces (capacity, status, time) | `GET /schedule/public` + admin schedule if open |
| `dashboard.invalidate` | `{}` | Admin/manager home dashboard | `GET /reports/dashboard` |
| `cancel-intent.changed` | `{ sessionId: string }` | Public schedule viewers | `GET /schedule/public` |

Optional later: `payment.changed`, `notification.broadcast`.

**Public channel rule:** `booking.changed`, `waitlist.*`, and any payload containing `userId` are **never** sent on `/v1/realtime/public`. Public frames may include only safe values such as `sessionId` or empty `{}` for generic invalidation.

### 2.3 Audience scopes and connections

| User state | Endpoint | Events received |
|------------|----------|-----------------|
| **Guest** | `GET /v1/realtime/public` | `schedule.invalidate`, `session.changed`, `cancel-intent.changed` only |
| **Logged-in member/staff** | `GET /v1/realtime/events` | Public events **plus** private events scoped to user/role |

**One connection per tab:**

- Guests → `/public` only.
- Authenticated users → `/events` only. The authenticated stream **includes public events**, so logged-in users do **not** open a second public connection.
- Avoid duplicate public + auth connections unless there is a documented, exceptional reason.

Staff (`ADMIN` / `MANAGER` / `COACH`) use the same `/events` endpoint with broader server-side filtering in phase 2. Phase 1 focuses on member/public P0; staff admin UIs may still use `router.refresh` until phase 2.

---

## 3. Backend implementation

### 3.1 New module (files)

```
apps/api/src/realtime/
  realtime.module.ts
  realtime.types.ts              # RealtimeEvent union
  realtime-publisher.service.ts  # emit(event), subscriber registry
  realtime-sse.controller.ts     # @Sse() streams
  realtime-auth.guard.ts         # reuse session/JWT from REST
```

Register `RealtimeModule` in `app.module.ts`.

### 3.2 Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/realtime/events` | Required | Member + staff SSE stream (includes public events) |
| `GET` | `/v1/realtime/public` | None | Public schedule invalidation only |

#### Required response headers

```http
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

Heartbeat every 30s: `: ping\n\n`.

#### Proxy, compression, and routing rules

| Rule | Reason |
|------|--------|
| **Do not gzip** SSE responses | Compression buffers the stream |
| **Disable buffering** on the SSE route (nginx `proxy_buffering off`, `X-Accel-Buffering: no`) | Events must flush immediately |
| **Do not proxy SSE through Next.js rewrites** | Next dev/prod proxy breaks long-lived streams |
| Browser connects to **`NEXT_PUBLIC_API_ORIGIN`** directly | Bypasses `apps/web/next.config.ts` `/api/v1` rewrite |
| Emit **after** DB commit + cache invalidation | Prevents stale refetch race (see §7) |

### 3.3 Authentication for SSE

#### Native `EventSource` limitation

**Native browser `EventSource` does not support custom `Authorization` headers.**

This is a hard browser constraint, not a project bug.

#### Preferred web auth strategy

This project already uses an **httpOnly JWT cookie** (`ACCESS_TOKEN_COOKIE` via `jwt.strategy.ts`). SSE should reuse it:

| Requirement | Value |
|-------------|-------|
| Transport | Native `EventSource` with `withCredentials: true` |
| Cookie | httpOnly session/access cookie sent automatically |
| CORS | `Access-Control-Allow-Credentials: true` + explicit web origin (not `*`) |
| API origin | Direct `NEXT_PUBLIC_API_ORIGIN` (e.g. `http://localhost:4000`, `https://api.example.com`) |

#### Bearer token clients (mobile, non-browser)

If a client relies on `Authorization: Bearer …` and cannot use cookies, native `EventSource` **will not work**. Alternatives:

| Option | Use when |
|--------|----------|
| **Fetch-based SSE client** | Full control over headers (mobile, custom clients) |
| **Short-lived signed SSE token** | Query param `?sseToken=…` with tight TTL and scoped permissions |
| **Cookie-based session for web** | Preferred for browser — no custom headers needed |

Phase 1 web implementation: **cookie + native EventSource**. Mobile SSE (phase 3): fetch-based client or signed token.

#### Auth expiry while connected

When the session expires, the authenticated stream must stop delivering private events. Client should detect 401 on reconnect or stream close, stop private refetch, and route to re-login. See §7 — Auth expired test.

### 3.4 Public endpoint protection

`/v1/realtime/public` is unauthenticated. Mandatory safeguards:

| Safeguard | Requirement |
|-----------|-------------|
| Rate limiting | Throttle new connections per IP |
| Max connections | Cap concurrent public SSE connections per IP |
| Event allowlist | Only `schedule.invalidate`, `session.changed`, `cancel-intent.changed` |
| Payload allowlist | Only `sessionId` or `{}` — **never** `userId`, `bookingId`, name, email, phone, or private booking details |
| No user targeting | Public channel broadcasts capacity/session invalidation only |

### 3.5 Subscriber lifecycle cleanup (mandatory)

On client disconnect (`req.close`, aborted stream, tab closed):

- [ ] Remove subscriber from public / per-user / per-role maps
- [ ] Complete or unsubscribe the RxJS `Subject` / `Observable` for that connection
- [ ] Clear heartbeat `setInterval` / timer for that connection
- [ ] Prevent memory leaks from orphaned subscribers
- [ ] Optionally log connect/disconnect counts for debugging

This is **required for production stability**. Repeated open/close without cleanup will leak memory and exhaust connection limits.

### 3.6 Publisher API

```ts
// realtime-publisher.service.ts (conceptual)
emit(event: RealtimeEvent): void;
emitToUser(userId: string, event: RealtimeEvent): void;
emitPublic(event: PublicRealtimeEvent): void;
```

Inject `RealtimePublisherService` into services below. Call **only after** successful DB transaction **and** cache invalidation.

### 3.7 Emit points

#### P0 — phase 1 (mandatory)

| File | Method | Events | Notes |
|------|--------|--------|-------|
| `bookings/bookings.service.ts` | `book` | `booking.changed`, `schedule.invalidate`, `session.changed` | |
| `bookings/bookings.service.ts` | `cancel` | same; may trigger `waitlist.offer` | |
| `bookings/bookings.service.ts` | `adminCancel` | `booking.changed`, `schedule.invalidate`, `session.changed`; may trigger waitlist offer | **Fix:** add `invalidatePublicCache` (missing today) |
| `bookings/bookings.service.ts` | `moveBooking` | `schedule.invalidate`, `session.changed` (both sessions), `booking.changed` | **Fix:** add `invalidatePublicCache` (missing today) |
| `bookings/bookings.service.ts` | `registerCancelIntent` | `cancel-intent.changed` | |
| `bookings/bookings.service.ts` | `clearCancelIntent` | `cancel-intent.changed` | |
| `waitlist/waitlist.service.ts` | `join` | `waitlist.changed` | |
| `waitlist/waitlist.service.ts` | `leave` | `waitlist.changed`; may call `offerNextIfSlot` | |
| `waitlist/waitlist.service.ts` | `offerNextIfSlot` | `waitlist.offer`, `waitlist.changed` | |
| `waitlist/waitlist.service.ts` | `expireStaleOffersAndPromote` (cron) | `waitlist.offer`, `waitlist.changed` per affected user | Only when `ENABLE_WAITLIST_BACKGROUND_JOBS` enabled |
| `waitlist/waitlist.service.ts` | `promoteToBooking` | `booking.changed`, `waitlist.changed`, `schedule.invalidate` | |
| `payments/payments.service.ts` | `confirmDropInPayment`, `confirmDropInCashPayment`, `fulfillDropInPayment` | Same as `book` when booking is created/confirmed | Payment-created bookings must not skip realtime |

#### P1 — phase 2

| File | Method | Events |
|------|--------|--------|
| `classes/classes.service.ts` | `createSession`, `updateSession`, `updateSessionStatus`, `cancelSession`, `deleteSession` | `session.changed`, `schedule.invalidate`; admin cancel also emits `booking.changed` per affected member and `waitlist.changed` for open waitlist rows | Admin class cancel restores package sessions (no 24h penalty) |
| `schedule/schedule.service.ts` | `create`, `update`, `delete` (marketing items) | `schedule.invalidate` |
| `waitlist/waitlist.service.ts` | `remove`, `manualNotify` | `waitlist.changed` |

#### P2 — optional

| File | Method | Events |
|------|--------|--------|
| `reports/reports.service.ts` | aggregate change hook | `dashboard.invalidate` |
| `notifications/notifications.service.ts` | broadcast dispatched | staff notification UI refresh |

### 3.8 Known gaps to fix in phase 1

| Issue | Location | Action |
|-------|----------|--------|
| Admin cancel / move skip public cache | `bookings.service.ts` | Add `invalidatePublicCache` before emit |
| Cancel-intent not shared across API instances | `booking-cancel-intent.service.ts` | Document; move to Redis TTL in phase 3 |
| Payment booking paths | `payments.service.ts` | Wire same emit + cache invalidation as `book` |

---

## 4. Web client implementation

### 4.1 New shared infrastructure

```
apps/web/src/lib/realtime/
  realtime-event-types.ts       # mirror API event names + payloads
  realtime-sse-client.ts        # EventSource wrapper, reconnect, onopen refetch
  realtime-refetch-registry.ts  # endpoint-keyed debounced/deduped refetch

apps/web/src/hooks/
  use-realtime-events.ts        # one connection per tab
  use-realtime-subscription.ts  # page-level handler registration
```

**Rule:** One realtime provider per browser tab. One SSE connection per tab (public **or** auth, never both for logged-in users).

### 4.2 Connection selection

| Auth state | Endpoint | `withCredentials` |
|------------|----------|-------------------|
| Guest | `{API_ORIGIN}/v1/realtime/public` | `true` if cookies used for guest tracking; otherwise default |
| Logged-in | `{API_ORIGIN}/v1/realtime/events` | `true` (required for httpOnly cookie) |

### 4.3 Reconnect recovery (mandatory)

Thin invalidation events can be **missed while disconnected**. On SSE `open` (initial connect **and** every reconnect):

1. **Immediately refetch all currently registered/visible resources once** (forced refetch, bypass debounce).
2. Then resume event-driven refetching.

Example — user on schedule page, reconnect refetches:

- `GET /schedule/public`
- `GET /bookings/me` (if member)
- `GET /waitlist/me` (if member)

This prevents stale UI after temporary network drops.

### 4.4 `EventSource` `onerror` behavior (mandatory)

**Do not permanently close `EventSource` on transient `onerror`.**

| Action | When |
|--------|------|
| Mark connection as `disconnected` | On `onerror` |
| Enable fallback polling (60s) | While disconnected |
| Allow browser / client to reconnect | Default `EventSource` auto-reconnect or controlled retry |
| Call `eventSource.close()` | Provider unmount, logout, intentional shutdown only |

Permanent close on first error prevents recovery and forces unnecessary full page reloads.

### 4.5 Refetch registry requirements

The refetch registry (`realtime-refetch-registry.ts`) must:

| Requirement | Purpose |
|-------------|---------|
| **Debounce by endpoint/query key** | Coalesce rapid events (e.g. 200ms window per key) |
| **Dedupe in-flight requests** | Second refetch for same key awaits the first |
| **Collapse related events** | `booking.changed` + `schedule.invalidate` + `session.changed` → **one** `/schedule/public` call |
| **Abort stale requests on unmount** | `AbortController` per keyed fetch |
| **Forced refetch on reconnect** | Bypass debounce on SSE `open` |
| **Avoid request storms** | Cap burst refetch; merge keys before firing |

Example: one booking action emitting three schedule-related events must **not** produce three identical `/schedule/public` requests.

### 4.6 Replace existing mechanisms

| Current | Replace with |
|---------|--------------|
| `use-schedule-live-sync.ts` 15s poll | SSE-driven refetch + 60s fallback poll **only while disconnected** |
| `NOTIFICATIONS_REFRESH_EVENT` (same browser) | Keep as optimistic local trigger; SSE handles cross-user/tab |
| `dispatchNotificationsRefresh()` after mutations | Keep — instant local UX before SSE round-trip |

### 4.7 Environment

```env
# Browser SSE connects here directly — NOT via Next /api/v1 rewrite
NEXT_PUBLIC_API_ORIGIN=http://localhost:4000
```

Production example: web on Vercel (`https://app.example.com`), API on Render (`https://api.example.com`). CORS must allow credentials from the web origin.

Document in `docs/VERCEL_ENV.md` after implementation.

### 4.8 Integration map — Web

Priority: **P0** = phase 1, **P1** = phase 2, **P2** = later.

#### P0 — Member public

| File | Data | SSE events | Reconnect refetch |
|------|------|------------|-------------------|
| `marketing/schedule/marketing-schedule-view.tsx` | schedule, bookings, waitlist | `schedule.*`, `cancel-intent.*`, `booking.changed`, `waitlist.*` | all three endpoints |
| `marketing/auth-aware/auth-aware-schedule-booking-action.tsx` | actions | server emits; keep local `dispatchNotificationsRefresh` | — |
| `shell/header-notifications-menu.tsx` | OFFERED waitlist | `waitlist.offer`, `waitlist.changed` | `/waitlist/me` |
| `hooks/use-member-waitlist-data.ts` | `/waitlist/me` | via subscription | `/waitlist/me` |
| `account/cancel-booking-button.tsx` + `lib/booking-cancel-intent.ts` | cancel-intent | `cancel-intent.changed` | `/schedule/public` |

#### P1 — Member account, home, admin

| Area | Key files |
|------|-----------|
| Member account | `member-user-classes-route-content.tsx`, `session-booking-actions.tsx`, `member-user-bookings-route-content.tsx`, `member-user-waitlists-route-content.tsx`, `member-dashboard.tsx` |
| Marketing home | `home-weekly-schedule-live-grid.tsx`, `home-weekly-schedule-banner.tsx` |
| Admin / Manager | `admin-bookings-management.tsx`, `admin-waitlist-management.tsx`, `admin-schedule-management.tsx`, dashboard pages |

#### P2 — Low urgency

Coach read-only views, admin analytics, static marketing schedule slice.

### 4.9 Shell wiring

Mount `RealtimeProvider` once per tab:

| Shell | File |
|-------|------|
| Marketing + member | `marketing-site-header-with-client-account.tsx` or marketing layout |
| Workspace | `workspace-shell.tsx` or `dashboard-app-shell.tsx` |

Provider logic:

- If authenticated → open `/v1/realtime/events` only.
- If guest on pages that need live schedule → open `/v1/realtime/public` only.
- On logout → `close()` SSE, clear registry subscriptions.

### 4.10 Cleanup after SSE is stable

| Action | File |
|--------|------|
| Remove 15s primary poll | `use-schedule-live-sync.ts` → disconnect fallback only |
| Rename constant | `SCHEDULE_LIVE_POLL_INTERVAL_MS` → `SCHEDULE_FALLBACK_POLL_MS` = 60_000 |
| Single header notifications instance | `marketing-site-header.tsx` (responsive classes) |

Keep `SCHEDULE_CLOCK_TICK_MS` (15s) — local clock for hiding past sessions; no network.

---

## 5. Mobile implementation (phase 3)

| File | Plan |
|------|------|
| `useMemberHomeFeed.ts` | Fetch-based SSE client or signed token; foreground listener |
| `MemberScheduleScreen.tsx` | `schedule.invalidate`, `session.changed` |
| `memberClient.ts` | Add `realtimeClient.ts` — **not** native `EventSource` with Bearer header |

Mobile is out of phase 1 scope unless product mandates instant home-screen offers.

---

## 6. Implementation phases

### Phase 1 — definition of done (strict)

#### Backend

- [ ] `RealtimeModule` + publisher + subscriber registry
- [ ] Authenticated SSE endpoint (`/v1/realtime/events`)
- [ ] Public SSE endpoint (`/v1/realtime/public`) with rate limit + connection cap
- [ ] SSE response headers (§3.2); no gzip; no proxy buffering
- [ ] P0 emit points: `book`, `cancel`, `adminCancel`, `moveBooking`, cancel-intent, all P0 waitlist paths, payment booking confirmation paths
- [ ] Cache invalidation **before** emit on every booking-affecting path
- [ ] CORS credentials verified for web origin
- [ ] Subscriber cleanup on disconnect (§3.5)
- [ ] Public channel emits only allowlisted events with safe payloads (§3.4)

#### Frontend

- [ ] One realtime provider per tab
- [ ] Authenticated users → `/events` only (includes public events)
- [ ] Guests → `/public` only
- [ ] No duplicate public + auth connections for logged-in users
- [ ] Reconnect forced refetch of visible resources (§4.3)
- [ ] Fallback polling only during disconnect (60s)
- [ ] Debounced/deduped refetch registry (§4.5)
- [ ] `onerror` does not permanently close connection (§4.4)
- [ ] `marketing-schedule-view`, `header-notifications-menu`, cancel-intent wired
- [ ] `NEXT_PUBLIC_API_ORIGIN` documented

#### Verification

- [ ] Cross-user spot updates < 2s without primary poll
- [ ] Cancel-intent hold visible to other users
- [ ] Waitlist offer badge updates without manual refresh
- [ ] **Admin cancellation** triggers public schedule refresh + waitlist offer
- [ ] Reconnect catches missed changes (forced refetch)
- [ ] No request spam from event bursts or duplicate connections
- [ ] No subscriber memory leak after repeated page open/close
- [ ] API idle when no tabs connected

### Phase 2 — P1 surfaces

Admin/manager live tables, home weekly banner, member account pages, `classes.service` session mutations, `dashboard.invalidate`.

### Phase 3 — scale + mobile

Redis pub/sub multi-instance fan-out, cancel-intent in Redis, mobile SSE client.

---

## 7. Testing checklist

| Scenario | Steps | Expected |
|----------|-------|----------|
| Cross-user spot | A books last spot; B on `/schedule` | B sees full / waitlist without manual refresh |
| Cancel intent | A opens cancel dialog; B views same session | B does not see freed spot until confirm or dismiss |
| Waitlist offer | Admin cancels booking; waitlist has A | A header shows offer via SSE |
| Admin cancel | Staff admin-cancels a booking | Public schedule refreshes; waitlist offer emitted if applicable |
| Reconnect | Kill API briefly | Fallback poll; SSE reconnects; forced refetch on `open` |
| **Reconnect sync** | Disconnect during booking change, then reconnect | Visible resources refetch immediately; correct state |
| **Duplicate event burst** | One action emits `booking.changed` + `schedule.invalidate` + `session.changed` | One deduped `/schedule/public` refetch, not three |
| **Auth expired** | Session expires while SSE open | Private stream stops; UI handles logout/reauth; no silent private refetch |
| **Public privacy** | Guest listens to `/public` | No `userId`, `bookingId`, email, or private data in any frame |
| **Memory cleanup** | Open/close schedule page 20× | Backend subscriber count stable; no leak |
| **CORS credentials** | Web on Vercel, API on separate domain | Cookie SSE auth works with `withCredentials: true` |
| **Cache race** | Emit after book/cancel | Client refetch never returns pre-mutation cached schedule |
| Staff queue | Manager on waitlists; member joins | List updates (phase 2; optional in phase 1) |
| No connection | Close all tabs | API logs quiet (crons excepted) |

---

## 8. Related files (current state)

| Concern | Path |
|---------|------|
| Poll interval | `apps/web/src/lib/public-schedule-constants.ts` |
| Schedule live sync | `apps/web/src/hooks/use-schedule-live-sync.ts` |
| Same-browser event | `apps/web/src/lib/notifications-refresh-event.ts` |
| Waitlist deduped fetch | `apps/web/src/lib/member-waitlist-fetch.ts` |
| Public schedule cache | `apps/api/src/schedule/schedule.service.ts` |
| Cancel intent hold | `apps/api/src/cache/booking-cancel-intent.service.ts` |
| JWT cookie auth | `apps/api/src/auth/jwt.strategy.ts` |
| API prefix | `apps/api/src/common/constants.ts` |
| Next rewrite (not for SSE) | `apps/web/next.config.ts` |
| Payment → booking | `apps/api/src/payments/payments.service.ts` (`fulfillDropInPayment`) |

---

## 9. TECH_CARD update

After phase 1, update `docs/TECH_CARD.md` §7.6:

| Parameter | Decision |
|-----------|----------|
| Realtime transport | SSE thin events, direct `NEXT_PUBLIC_API_ORIGIN` |
| Web auth | httpOnly cookie + `withCredentials` |
| Non-browser auth | Fetch SSE client or signed short-lived token |
| Fallback | 60s poll during disconnect only |
| Scale path | Redis pub/sub when multi-instance |

---

## 10. Summary — integration quick list

**P0 (phase 1):**

1. `marketing-schedule-view.tsx` — schedule capacity live sync
2. `header-notifications-menu.tsx` + `use-member-waitlist-data.ts` — waitlist offers
3. Cancel-intent flow — cross-user spot holds
4. API: `bookings.service` (`book`, `cancel`, `adminCancel`, `moveBooking`, cancel-intent)
5. API: `waitlist.service` (join, leave, offer, promote, cron)
6. API: `payments.service` (booking-creating confirm flows)

**P1 (phase 2):** Home banner, member account pages, admin/manager ops, `classes.service` sessions.

**P2/P3:** Coach views, analytics, mobile, multi-instance Redis.

---

This document is the **single source of truth** for the SSE rollout. Complete phase 1 before removing primary polling.
