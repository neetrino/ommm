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
- Payments: Stripe (optional in env).
