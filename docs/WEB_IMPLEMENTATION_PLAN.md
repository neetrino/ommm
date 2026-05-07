# Ommm — Web implementation plan (CRM coverage)

**Աղբյուր.** [`CRM - Ommm - code.md`](../CRM%20-%20Ommm%20-%20code.md)  
**Ստեկ.** `docs/TECH_CARD.md`, `docs/01-ARCHITECTURE.md`  
**Վերջին թարմացում.** 2026-05-07 — checklist sync (implementation pass; deploy / some CRM-depth UI still follow-up).

Այս փաստաթուղթը քարտեզագրում է **ամբողջ web-շրջանակը**՝ հանրային կայք, member zone, Admin / Manager / Coach / Content UI, backend API, ինտեգրացիաներ։ Նպատակը՝ **ոչ մի ֆունկցիոնալ բաժին չմոռանալ**՝ ըստ CRM-ի։

---

## Ապագա — մոբայլ հավելված (սառեցված)

**Չի մտնում** ներքևի փուլերի մեջ այս պահին։

- **React Native + Expo** հավելվածը՝ միայն երբ web-ը **ամբողջությամբ պատրաստ** լինի (marketing + account + բոլոր backoffice դերերը + վճարումներ/ծանուցումների հիմնական հոսքերը production-ready)։
- Push-երը՝ Expo փուլից հետո, նույն API-ի վրա։
- Կանոններ՝ `.cursor/rules/22-mobile-frozen.mdc`, `docs/TECH_CARD.md` §11։

CRM ֆայլի սկզբում նկարագրված **Mobile APP** էկրանները **նույնանման** պետք է իրականացվեն web-ում **`[locale]/(account)`** ուղիներով մինչև մոբայլ փուլը։

---

## Ընդհանուր կարգ (ֆազեր)

| Ֆազա | Նպատակ |
|------|--------|
| 0 | Monorepo, env, DB migrations, API shell, web shell, i18n միացում |
| 1 | Auth (գրանցում, մուտք, JWT cookie/header, password reset, email verify — փուլերով) |
| 2 | Studio settings, public studio/contact տվյալներ |
| 3 | Coaches + Class types + Sessions (CRUD admin, հանրային ցուցադրում) |
| 4 | Bookings + cancellation policy + coach attendance + ներքին նշումներ |
| 5 | Waitlist (queue, offer window, notify, admin actions) |
| 6 | Membership plans + Stripe subscription + session debit |
| 7 | Drop-in վճարով booking + Payment history |
| 8 | Gift cards (գնում, redeem, balance, admin) |
| 9 | Content CMS (events, blog, news, updates, knowledge) + marketing էջեր |
| 10 | Member zone UI (Home-like dashboard, Classes, My Bookings, Account բոլոր ենթաբաժինները) |
| 11 | Admin dashboard + Reports/CSV + Notifications (email; push՝ մոբայլից հետո) |
| 12 | Coach panel + Manager RBAC մատրից + Content Admin |
| 13 | QA, a11y, performance, E2E, production deploy |

Ֆազերը կարող են **մասամբ համընկնել**, բայց հերթականությունը պահպանել է ռիսկը ցածր պահելու համար։

---

## Ֆազա 0 — Հիմք

- [x] `packages/*` workspace, `@ommm/database` build/generate, CI-ում migrate
- [x] Nest՝ Prisma, Config, ValidationPipe, throttler, helmet, CORS+credentials, Pino logger
- [x] Next՝ `next-intl` (`hy`, `ru`, `en`), route groups `(marketing)`, `(account)`, `(admin)`, `(coach)`
- [x] API client helper web-ում (same-origin `/api/v1` proxy + `apiFetch`), error handling
- [x] Seed (dev)՝ plans, achievements, demo users

---

## Ֆազա 1 — Auth

CRM՝ գրանցում, մուտք, verification, password reset, session։

- [x] Credentials + argon2 + JWT (httpOnly cookie + `Authorization: Bearer`)
- [x] RBAC guard-եր (USER, COACH, MANAGER, CONTENT_ADMIN, ADMIN)
- [x] Email verify (Resend)
- [x] Password reset հոսք (API; dedicated reset page optional)
- [x] Web՝ login/register; account routes session-backed

---

## Ֆազա 2 — Studio & Contact

CRM՝ Contact form, phone, WhatsApp, email, address, map, hours, socials։

- [x] `StudioSettings` API (public read, admin write)
- [x] Contact form → email կամ DB + notification
- [x] Marketing Contact էջ

---

## Ֆազա 3 — Classes հիմք

CRM՝ class fields, schedule, filters, coach assign, capacity, level, status։

- [x] ClassType + ClassSession CRUD (admin/manager)
- [ ] Recurring schedule (կամ գեներատոր admin UI-ից)
- [x] Public՝ Coaches, schedule preview (member classes list); class detail route optional
- [x] Coach substitute դաշտ (schema + API)

---

## Ֆազա 4 — Bookings

CRM՝ booking flow, cancel 24h, rebook, admin move/cancel/attended։

- [x] Book session (capacity check)
- [x] Cancel + policy enforcement
- [x] Past bookings + statuses (Completed / Missed / Cancelled)
- [ ] Admin calendar (month/week/day) — table views v1
- [x] Internal notes (`BookingNote`)

---

## Ֆազա 5 — Waitlist

CRM՝ join waitlist, position, offer, expire, admin manual notify։

- [x] Join when full
- [x] Offer window (`waitlistOfferMinutes`)
- [x] Convert to booking / remove (service + admin endpoints)
- [x] Email notifications

---

## Ֆազա 6–7 — Membership & drop-in

CRM՝ plans, sessions remaining, renewal, pause, upgrade/downgrade, drop-in payment։

- [x] Stripe products/prices sync (price IDs + fallback `price_data`)
- [x] Subscribe, pause, cancel
- [x] Debit session per booking
- [x] Drop-in checkout

---

## Ֆազա 8 — Gift cards

CRM՝ purchase flow, send, redeem, balance, admin list/resend/deactivate։

- [x] Purchase + Stripe
- [x] Redeem + balance
- [x] Admin management

---

## Ֆազա 9 — Content & marketing

CRM՝ Home, Story, Explore, knowledge։

- [x] `ContentPost` types, CMS list (admin content page + API)
- [x] Home hero, previews (gift/banner depth optional)
- [x] Story, Explore list/detail, share metadata (OpenGraph via `metadata`)
- [x] SEO metadata (Explore list/detail)

---

## Ֆազա 10 — Member zone (web = CRM «app» բաժինը)

Նույն լոգիկան, ինչ CRM Mobile բաժինում, բայց Next-ում։

- [x] **Home (account)** — greeting, upcoming bookings, waitlists, explore preview, gift CTA
- [x] **Classes** — list, book / waitlist (filters/calendar UX optional)
- [x] **Booking flow** — login gate via session; Stripe drop-in when priced
- [x] **My Bookings** — upcoming/past, cancel confirm; rebook/activity summary optional
- [x] **My Account** — Achievements, Memberships & billing + payment history, Gift cards, Settings (notifications)

---

## Ֆազա 11 — Admin

CRM Admin 1–12 բաժինները։

- [x] Dashboard KPI cards
- [x] Clients / Bookings tables; Classes/Waitlists/Coaches CRUD UI follow-up
- [x] Memberships & billing (admin only, API)
- [x] Gift cards (API + admin)
- [x] Notifications broadcast (email v1; push՝ սառեցված)
- [x] Reports + CSV export (API; UI note on dashboard)
- [x] Settings (policies, templates) (API)
- [x] RBAC (API guards; web relies on API status codes)

---

## Ֆազա 12 — Coach & Manager & Content

CRM Coach panel + Manager մատրից + Content role։

- [x] **Coach** — schedule, roster, attendance (salary/analytics/profile UI follow-up)
- [x] **Manager** — մատրիցը API RBAC-ով; web-ում ամբողջական guard UX-ը ընդլայնելի է
- [x] **Content** — admin post list + public Explore

---

## Ֆազա 13 — Որակ և production

- [x] API Jest smoke; Playwright marketing smoke paths (`apps/web/e2e`; CI-ում `pnpm --filter web exec playwright install chromium`)
- [x] Rate limits (Nest throttler baseline; tune per env)
- [ ] Vercel + API hosting, env secrets (ops checklist)

---

## Քայլ առ քայլ աշխատանքի կարգ (այս պահի implementation)

1. Ֆազա 0–1 ավարտել (API+web հիմք, auth)։
2. Հանրային marketing էջերի կմախք (routing + թարգմանություն)։
3. Classes + bookings MVP։
4. Waitlist + notifications email։
5. Stripe memberships + gift cards։
6. Member zone ամբողջական UI։
7. Admin + Manager։
8. Coach + Content։
9. Reports + լաքեր։

Յուրաքանչյուր քայլից հետո թարմացնել այս checklist-ը (`[x]`) PR-երով։
