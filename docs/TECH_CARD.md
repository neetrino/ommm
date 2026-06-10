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
| Transport | SSE thin invalidation events; browser connects directly to API origin |
| Web env | `NEXT_PUBLIC_API_ORIGIN` (preferred) or `NEXT_PUBLIC_API_URL` — not Next `/api/v1` rewrite |
| Web auth | httpOnly JWT cookie + `EventSource` with `withCredentials: true` |
| Guest channel | `GET /v1/realtime/public` — `schedule.invalidate`, `session.changed`, `cancel-intent.changed` only |
| Auth channel | `GET /v1/realtime/events` — public events plus user-scoped private events (one connection per tab) |
| Client behavior | Map event → debounced/deduped REST refetch; forced refetch on SSE reconnect `open` |
| Fallback | 60s poll on schedule surfaces only while SSE is disconnected |
| Scale path | Redis pub/sub when API runs multi-instance; cancel-intent in Redis (phase 3) |
