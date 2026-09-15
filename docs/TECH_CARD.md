# Ommm — TECH_CARD (confirmed stack)

**Project:** Ommm studio platform  
**Size:** C — monorepo  
**Status:** Confirmed for implementation (aligned with repo)

## Stack

| Area | Choice |
|------|--------|
| Monorepo | pnpm workspaces — `apps/web`, `apps/api`, `apps/mobile`, `packages/database` |
| Web | Next.js App Router, next-intl, Tailwind |
| API | NestJS, Prisma, JWT cookie/Bearer, ScheduleModule (cron) |
| Mobile | Expo (expo-router), native + web targets |
| Database | PostgreSQL (Neon-compatible), Prisma migrations |

## Notes

- Push: Expo Push API + optional `EXPO_ACCESS_TOKEN`; device tokens in `PushDeviceToken` table.
- Payments: Internal/manual payment requests with admin confirmation.

## 7.6 Realtime (SSE)

| Parameter | Decision |
|-----------|----------|
| Transport | SSE thin invalidation events |
| Browser URL | Same-origin `/api/v1/realtime/*` (host-only `ommm_access` cookie) |
| Web BFF | Dedicated App Router handlers (`…/realtime/events`, `…/realtime/public`) — **not** Next rewrite |
| `API_INTERNAL_URL` | Coolify/Docker: Nest on the **internal** Docker network (not public `https://api.*` via Cloudflare) |
| Web auth | httpOnly JWT cookie + `EventSource` with `withCredentials: true` |
| Guest channel | `GET /v1/realtime/public` — `schedule.invalidate`, `session.changed`, `cancel-intent.changed` only |
| Auth channel | `GET /v1/realtime/events` — public events plus user-scoped private events (one connection per tab) |
| Client behavior | Map event → debounced/deduped REST refetch; forced refetch on SSE reconnect `open` |
| Fallback | 60s poll on schedule surfaces only while SSE is disconnected |
| Scale path | Redis pub/sub when API runs multi-instance; cancel-intent in Redis (phase 3) |
| Avoid | Cookie `Domain=.ommm.am` + direct browser→API SSE unless planned session migration (option B) |
