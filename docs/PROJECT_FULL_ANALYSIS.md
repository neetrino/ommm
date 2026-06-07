# Ommm — Պրոյեկտի ամբողջական անալիզ

**Ամսաթիվ:** 2026-06-07  
**Repo:** `ommm` monorepo (Size C)  
**Նպատակ:** wellness/studio (yoga, pilates) պլատֆորմ — հանրային կայք + member app + staff backoffice + mobile

---

## 1. Նախագծի նպատակ

**Ommm**-ը studio-ի բիզնեսը մի տեղում լուծող full-stack պլատֆորմ է.

| Շերտ | Նշանակություն |
|------|---------------|
| **Հանրային կայք** | Studio-ի brand, schedule, coaches, packages, explore/blog, contact |
| **Member (USER)** | Class booking, waitlist, memberships, payments, gift cards, progress |
| **Coach** | Իմ դասեր, roster/attendance, աշխատավարձ, analytics |
| **Manager** | Օպերացիոն կառավարում (սահմանափակ admin-ի համեմատ) |
| **Content Admin** | Explore/blog կոնտենտի workflow |
| **Admin** | Լիակատար studio backoffice — CRM, finance, analytics, settings |

---

## 2. Monorepo կառուցվածք

```
ommm/
├── apps/
│   ├── web/          # Next.js App Router (frontend + proxy to API)
│   ├── api/          # NestJS REST API
│   └── mobile/       # Expo (expo-router)
├── packages/
│   └── database/     # Prisma schema, migrations, seed, client
└── docs/             # Architecture, design, deploy docs
```

**Package manager:** `pnpm workspaces`  
**Dev commands:**

```bash
pnpm install          # postinstall → prisma generate
pnpm run dev          # web + api (dev:stack)
pnpm run dev:web      # Next.js only
pnpm run dev:api      # NestJS only
pnpm run dev:all      # web + api + mobile
pnpm run build:api    # database build + Nest build
pnpm run test         # API Jest tests
pnpm run test:e2e:web # Playwright e2e
```

---

## 3. Տեխնոլոգիական stack

| Շերտ | Տեխնոլոգիա |
|------|------------|
| Web | Next.js 16 App Router, React 19, Tailwind CSS 4, next-intl |
| API | NestJS 11, Passport JWT, class-validator, pino, helmet, throttler |
| Mobile | Expo 54, expo-router |
| DB | PostgreSQL (Neon-compatible), Prisma 6 |
| Auth | JWT httpOnly cookie + Bearer, Google OAuth, argon2 passwords |
| Email | Resend (mail abstraction) |
| Storage | Cloudflare R2 (+ local fallback uploads) |
| Cache | Redis (optional, public API cache) |
| Push | Expo Push API (`PushDeviceToken` table) |
| Payments | Manual/internal — admin confirmation (Stripe/Arca/TelCell docs կան, բայց live gateway չի միացված) |
| Testing | Jest (API), Playwright (web e2e) |

**API prefix:** `/v1` (Nest) — web client-ը օգտագործում է `/api/v1` proxy

---

## 4. Դերեր և RBAC

### 4.1. Prisma `Role` enum

| Role | Նկարագրություն |
|------|---------------|
| `USER` | Member / client |
| `COACH` | Instructor |
| `MANAGER` | Operations manager |
| `CONTENT_ADMIN` | Content editor |
| `ADMIN` | Full platform admin |

### 4.2. Post-auth home paths

**Ֆայլ:** `apps/web/src/lib/role-home.ts`

| Role | Home path | Login-ից հետո redirect |
|------|-----------|----------------------|
| `USER` | `/user` | `/user` (account dashboard) |
| `COACH` | `/coach/home` | `/coach/home` |
| `MANAGER` | `/manager/home` | `/manager/home` |
| `CONTENT_ADMIN` | `/content-admin/home` | `/content-admin/home` |
| `ADMIN` | `/admin/dashboard` | `/admin/dashboard` |

### 4.3. Auth guard

**Ֆայլ:** `apps/web/src/server/require-role-layout.ts`

1. `GET /users/me` — session validation (JWT cookie)
2. Unauthenticated → `/{locale}/login`
3. Wrong role → role home redirect
4. User profile locale ≠ URL locale → redirect preferred locale-ում

---

## 5. Web routing մոդել

### 5.1. URL կառուցվածք

```
/                    → redirect → /en (default locale)
/{locale}/...        → բոլոր էջերը
```

**Locales:** `hy` | `ru` | `en` (default: `en`)  
**Ֆայլ:** `apps/web/src/i18n/routing.ts` — `localePrefix: "always"`

### 5.2. Route groups (URL-ում չեն երևում)

| Group | Path prefix | Layout | Auth |
|-------|-------------|--------|------|
| `(marketing)` | `/`, `/story`, `/schedule`, … | Marketing shell | Public |
| `(auth)` | `/login`, `/register`, … | Auth layout | Public |
| `(account)` | `/user/*`, `/account`, `/dashboard` | Member shell | USER |
| `(admin)` | `/admin/*` | DashboardAppShell | ADMIN |
| `(coach)` | `/coach/*` | DashboardAppShell | COACH |
| `(manager)` | `/manager/*` | DashboardAppShell | MANAGER |
| `(content-admin)` | `/content-admin/*` | DashboardAppShell | CONTENT_ADMIN |
| Standalone | `/verify-email`, `/set-password` | Locale layout | Mixed |

### 5.3. Middleware

**Ֆայլ:** `apps/web/middleware.ts`

- next-intl locale routing
- UI locale cookie sync
- Account shell paths-ում cookie redirect skip

---

## 6. Բոլոր web էջերը

> Բոլոր path-երը **առանց locale prefix** — իրական URL: `/{locale}{path}`  
> Օրինակ: `/user/bookings` → `/hy/user/bookings`

### 6.1. Root

| Path | Ֆունկցիա | Տիպ |
|------|----------|-----|
| `/` (app root) | Redirect → default locale | Redirect |

### 6.2. Standalone `[locale]`

| Path | Auth | Ֆունկցիա |
|------|------|----------|
| `/verify-email` | No | Email verification (`POST /auth/verify-email`) |
| `/set-password` | Yes | Առաջին անգամ password setup (OAuth users) |

### 6.3. Marketing — հանրային

| Path | Ֆունկցիա | Տիպ |
|------|----------|-----|
| `/` | Home: hero, classes, coaches, plans, gallery, public schedule | Էջ |
| `/story` | Studio story (static i18n, ISR) | Էջ |
| `/schedule` | Public class schedule | Էջ |
| `/packages` | Membership/package plans browser | Էջ |
| `/packages/[categoryKey]` | Redirect → `/packages?category=` | Redirect |
| `/coaches` | Public coaches directory | Էջ |
| `/explore` | Blog/explore posts list | Էջ |
| `/explore/[slug]` | Single explore post detail | Էջ |
| `/contact` | Contact form → `POST /contact` | Էջ |
| `/membership` | Redirect → `/schedule` | Redirect |
| `/memberships` | Redirect → `/schedule` | Redirect |

**Marketing header nav** (`marketing-nav-links.ts`): Home, Story, Schedule, Packages, Coaches, Explore, Contact

### 6.4. Auth — հանրային

| Path | Ֆունկցիա |
|------|----------|
| `/login` | Email/password login, Google OAuth, role-based redirect |
| `/register` | Registration + validation, Google OAuth |
| `/forgot-password` | Password reset request email |
| `/reset-password` | Password reset with token |
| `/account` | OAuth return hub; authed → role home, else sign-in CTA |

### 6.5. Member account (USER)

| Path | Ֆունկցիա | API / Features |
|------|----------|----------------|
| `/dashboard` | Redirect → `/user` | — |
| `/user` | Member dashboard (նույնը ինչ `/user/dashboard`) | `/users/me`, bookings, waitlist |
| `/user/dashboard` | Dashboard widgets, upcoming bookings | `/bookings/me`, `/waitlist/me` |
| `/user/bookings` | Upcoming/past bookings + waitlist | Cancel/rebook |
| `/user/waitlists` | Waitlist entries management | `/waitlist/me` |
| `/user/classes` | Bookable sessions | Book / join waitlist |
| `/user/packages` | My memberships | `/packages/me` |
| `/user/packages/[categoryKey]` | Package category detail | Public plans API |
| `/user/payments` | Payment history | `/payments/me` |
| `/user/gift-cards` | Redeem, purchase, purchased/received | Gift card API |
| `/user/gift-cards/fake-payment` | Dev/test fake payment flow | Query params (dev only) |
| `/user/notifications` | Notification preferences | `PATCH /users/me/notifications` |
| `/user/profile` | Profile settings, avatar, password | `/users/me` PATCH |
| `/user/progress` | Achievements, member analytics | `/reports/user/analytics` |
| `/user/settings` | Redirect → `/user/profile` | Redirect |

**Member sidebar** (`dashboard-nav.ts`): Dashboard, Bookings, Waitlists, Schedule, Packages, Payments, Gift Cards, Profile  
**Header notifications:** `/user/notifications`

### 6.6. Admin (ADMIN)

| Path | Ֆունկցիա | Տիպ |
|------|----------|-----|
| `/admin` | Redirect → `/admin/dashboard` | Redirect |
| `/admin/home` | Redirect → `/admin/dashboard` | Redirect |
| `/admin/dashboard` | KPI metrics dashboard | Էջ |
| `/admin/bookings` | Full bookings management (list, move, attendance, notes) | Էջ |
| `/admin/waitlists` | Waitlist management (promote, notify, remove) | Էջ |
| `/admin/clients` | Client CRM, notes, filters, block | Էջ |
| `/admin/coaches` | Coach directory, schedule, CRUD | Էջ |
| `/admin/schedule` | Session CRUD, calendar views, recurrence | Էջ |
| `/admin/packages` | Package plan management | Էջ |
| `/admin/gift-cards` | Gift card batches, assign, deactivate | Էջ |
| `/admin/finance` | Redirect → `/admin/finance/overview` | Redirect |
| `/admin/finance/overview` | Revenue overview, finance KPIs | Էջ |
| `/admin/finance/payments` | Payment list, status confirmation | Էջ |
| `/admin/finance/members` | Member billing / package revenue | Էջ |
| `/admin/finance/coaches` | Coach salary summaries | Էջ |
| `/admin/analytics` | Redirect → `/admin/analytics/overview` | Redirect |
| `/admin/analytics/overview` | Studio analytics overview | Էջ |
| `/admin/analytics/revenue` | Revenue analytics | Էջ |
| `/admin/analytics/bookings` | Booking analytics | Էջ |
| `/admin/analytics/members` | Member analytics | Էջ |
| `/admin/analytics/coaches` | Coach performance analytics | Էջ |
| `/admin/notifications` | Broadcast, scheduled, delivery stats | Էջ |
| `/admin/content` | Explore/content posts panel (review workflow) | Էջ |
| `/admin/settings` | Studio settings | `/studio` GET/PATCH |
| `/admin/profile` | Admin profile | Էջ |
| `/admin/feedback` | Redirect → `/admin/content` | Redirect |
| `/admin/guest-users` | Redirect → `/admin/clients` | Redirect |
| `/admin/reports` | Redirect → `/admin/analytics` | Redirect |
| `/admin/memberships` | Redirect → `/admin/packages` | Redirect |

**Admin sidebar:** Dashboard, Bookings, Waitlists, Clients, Coaches, Schedule, Packages, Gift Cards, Finance, Analytics, Notifications, Content, Settings, Guest Users

### 6.7. Coach (COACH)

| Path | Ֆունկցիա | Տիպ |
|------|----------|-----|
| `/coach` | Redirect → `/coach/home` | Redirect |
| `/coach/home` | Today's sessions / roster summary | Էջ |
| `/coach/schedule` | Upcoming sessions | Էջ |
| `/coach/groups` | Attendance roster | Էջ |
| `/coach/salary` | Earnings summary | `/coaches/panel/salary` |
| `/coach/analytics` | 30-day analytics | `/reports/coach/analytics` |
| `/coach/profile` | Coach profile | Էջ |
| `/coach/notifications` | Notification preferences | Էջ |
| `/coach/settings` | Redirect → `/coach/profile` | Redirect |

**Coach sidebar:** Dashboard, Schedule, Groups, Salary, Analytics, Profile

### 6.8. Manager (MANAGER)

| Path | Ֆունկցիա | Մակարդակ |
|------|----------|----------|
| `/manager/home` | Ops overview KPIs | `/reports/dashboard` |
| `/manager/classes` | View class types + sessions | Partial (view-only) |
| `/manager/bookings` | Bookings table, limited actions | Partial |
| `/manager/waitlists` | Waitlist table, move/remove | Partial |
| `/manager/clients` | Client list + limited actions | Partial |
| `/manager/coaches` | Coach directory (no delete) | Partial |
| `/manager/gift-cards` | View cards (no create/deactivate) | Partial |
| `/manager/profile` | Manager profile | Full |
| `/manager/settings` | Redirect → `/manager/profile` | Redirect |

**Manager sidebar:** Home, Schedule, Bookings, Waitlists, Clients, Coaches, Gift Cards, Profile

### 6.9. Content Admin (CONTENT_ADMIN)

| Path | Ֆունկցիա |
|------|----------|
| `/content-admin/home` | Hub links |
| `/content-admin/content` | ContentPostsPanel — explore posts CRUD + review |
| `/content-admin/profile` | Profile |
| `/content-admin/notifications` | Notification preferences |

### 6.10. Next.js API routes (web)

| Path | Ֆունկցիա |
|------|----------|
| `/api/cron/warm-api` | Vercel cron — API warm-up |

---

## 7. Էջերի վիճակագրություն

| Խումբ | Ընդամենը | Redirects | Լիարժեք էջեր |
|-------|----------|-----------|---------------|
| Root | 1 | 1 | 0 |
| Standalone locale | 2 | 0 | 2 |
| Marketing | 11 | 3 | 8 |
| Auth | 5 | 0 | 5 |
| Account (USER) | 15 | 2 | 13 |
| Admin | 28 | 7 | 21 |
| Coach | 9 | 2 | 7 |
| Manager | 9 | 1 | 8 |
| Content-admin | 4 | 0 | 4 |
| **Ընդամենը** | **~84** | **~16** | **~68** |

---

## 8. Backend API — ամբողջական map

**Base prefix:** `/v1`  
**~105 HTTP endpoints**, 17 controllers, 21 registered modules

### 8.1. Health

| Method | Path | Roles |
|--------|------|-------|
| GET | `/health` | Public |

### 8.2. Auth (`/auth`)

| Method | Path | Նկարագրություն | Roles |
|--------|------|---------------|-------|
| POST | `/register` | Registration + JWT cookie | Public |
| POST | `/login` | Login + JWT cookie | Public |
| GET | `/google` | Google OAuth start | Public |
| GET | `/google/callback` | OAuth callback + cookie | Public |
| POST | `/logout` | Clear cookie | Public |
| POST | `/verify-email` | Email verification | Public |
| POST | `/request-password-reset` | Reset email | Public |
| POST | `/reset-password` | New password | Public |
| POST | `/session` | Current user from JWT | Authenticated |

### 8.3. Users (`/users`)

| Method | Path | Նկարագրություն | Roles |
|--------|------|---------------|-------|
| GET | `/me` | Current user profile | Authenticated |
| PATCH | `/me` | Update profile + refresh JWT | Authenticated |
| PATCH | `/me/password` | Change password | Authenticated |
| POST | `/me/home-image`, `/me/home-image-json` | Home image upload | Authenticated |
| PATCH | `/me/notifications` | Notification preferences | Authenticated |
| POST | `/me/push-token` | Register push token | Authenticated |
| DELETE | `/me` | Delete account | Authenticated |
| POST | `/me/delete-request` | Request account deletion | Authenticated |

### 8.4. Studio (`/studio`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | Public |
| PATCH | `/` | ADMIN |

### 8.5. Contact (`/contact`)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/` | Public |

### 8.6. Coaches (`/coaches`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/` | Public |
| GET | `/:id` | Public |
| GET | `/panel/summary` | COACH |
| GET | `/panel/salary` | COACH |
| GET | `/admin/list` | ADMIN, MANAGER |
| GET | `/admin/salary-summaries` | ADMIN, MANAGER |
| POST | `/` | ADMIN |
| PATCH | `/:id` | ADMIN |
| DELETE | `/:id` | ADMIN |
| POST | `/:id/photo-json` | ADMIN |

### 8.7. Classes (`/classes`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/types` | Public |
| POST/PATCH | `/types`, `/types/:id` | ADMIN, MANAGER (delete: ADMIN only) |
| DELETE | `/types/:id` | ADMIN |
| GET | `/sessions`, `/sessions/:id` | Public |
| GET | `/admin/sessions` | ADMIN |
| POST | `/sessions`, `/sessions/batch` | ADMIN |
| PATCH | `/sessions/:id` | ADMIN |
| POST | `/sessions/:id/cancel`, `/status` | ADMIN |
| DELETE | `/sessions/:id` | ADMIN |

### 8.8. Bookings (`/bookings`)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/sessions/:sessionId` | Authenticated |
| GET | `/me` | Authenticated |
| DELETE | `/:id` | Authenticated (own) |
| GET | `/admin`, `/admin/management`, `/admin/:id` | ADMIN, MANAGER, COACH |
| PATCH | `/admin/:id`, `/admin/:id/move`, `/admin/:id/attendance` | ADMIN, MANAGER, COACH |
| DELETE | `/admin/:id` | ADMIN, MANAGER |
| DELETE | `/admin/:id/permanent` | ADMIN |
| POST | `/:id/notes` | ADMIN, MANAGER, COACH |

### 8.9. Waitlist (`/waitlist`)

| Method | Path | Roles |
|--------|------|-------|
| POST/DELETE | `/sessions/:sessionId` | Authenticated |
| GET | `/me` | Authenticated |
| GET | `/admin/recent`, `/admin/active` | ADMIN, MANAGER |
| GET | `/sessions/:sessionId` | ADMIN, MANAGER, COACH |
| DELETE | `/entries/:id` | ADMIN, MANAGER |
| POST | `/entries/:id/promote`, `/notify` | ADMIN, MANAGER |

### 8.10. Schedule (`/schedule`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/public` | Public |
| GET/POST/PATCH/DELETE | `/admin/*` | ADMIN |

### 8.11. Packages (`/packages`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/plans` | Public |
| GET | `/me` | Authenticated |
| POST | `/me/subscribe` | Authenticated |
| PATCH | `/me/:id/pause`, `/cancel`, `/renew`, `/change-plan` | Authenticated |
| GET/POST/PATCH/DELETE | `/plans`, `/admin/*` | ADMIN |
| POST | `/admin/assign` | ADMIN |
| PATCH | `/admin/:id/status` | ADMIN |

### 8.12. Payments (`/payments`)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/checkout/gift` | Authenticated |
| POST | `/checkout/gift/:reference/confirm` | Authenticated |
| POST | `/checkout/dropin/:sessionId` | Authenticated |
| GET | `/me` | Authenticated |
| GET | `/admin` | ADMIN, MANAGER |
| PATCH | `/admin/:paymentId/status` | ADMIN, MANAGER |

### 8.13. Gift cards (`/gift-cards`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/me/purchased`, `/me/received` | Authenticated |
| POST | `/redeem` | Authenticated |
| GET | `/market` | Authenticated |
| GET/POST/PATCH/DELETE | `/admin/*` | ADMIN (create/delete: ADMIN; view: MANAGER) |
| POST | `/admin/:id/resend`, `/admin/batches/:id/resend` | ADMIN, MANAGER |

### 8.14. Content (`/content`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/posts`, `/posts/:slug` | Public |
| GET/POST/PATCH/DELETE | `/admin/posts/*` | ADMIN, CONTENT_ADMIN |
| POST | `/admin/posts/:id/submit-review`, `/review` | ADMIN, CONTENT_ADMIN |
| POST | `/admin/cover-image` | ADMIN, CONTENT_ADMIN |

### 8.15. Clients (`/clients`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/`, `/:id` | ADMIN, MANAGER |
| PATCH | `/:id` | ADMIN, MANAGER |
| DELETE | `/:id` | ADMIN |
| POST | `/:id/notes` | ADMIN, MANAGER |
| GET | `/:id/bookings`, `/:id/payments`, `/:id/gift-cards` | ADMIN, MANAGER |

### 8.16. Notifications (`/notifications`)

| Method | Path | Roles |
|--------|------|-------|
| POST | `/admin/broadcast` | ADMIN |
| GET | `/admin/stats`, `/deliveries`, `/analytics`, `/scheduled` | ADMIN |
| PATCH/DELETE | `/admin/scheduled/:id` | ADMIN |

### 8.17. Reports (`/reports`)

| Method | Path | Roles |
|--------|------|-------|
| GET | `/dashboard` | ADMIN, MANAGER |
| GET | `/finance/summary` | ADMIN, MANAGER |
| GET | `/bookings.csv`, `/payments.csv`, `/gift-credits.csv` | ADMIN |
| GET | `/coach/analytics` | COACH |
| GET | `/user/analytics` | USER |

---

## 9. Background jobs (Cron)

| Service | Interval | Ֆունկցիա |
|---------|----------|----------|
| `NotificationsService` | 30 min | Class reminder emails + push (BOOKED sessions, configurable env) |
| `NotificationsService` | 10 min | Scheduled broadcast dispatch |
| `WaitlistService` | 10 min | Expire stale waitlist offers + auto-promote next |

---

## 10. Database — հիմնական entities

**Schema:** `packages/database/prisma/schema.prisma`

### 10.1. Key enums

`Role`, `ClassSessionStatus`, `BookingStatus`, `BookingChannel`, `WaitlistStatus`, `ContentType`, `ContentStatus`, `PaymentStatus`, `PaymentSource`, `PackageStatus`, `ManualPaymentMethod`, `GiftCardStatus`, `AuthTokenType`, `ScheduleDayOfWeek`, `SessionRecurrencePattern`

### 10.2. Models

| Model | Նշանակություն |
|-------|---------------|
| `User` | Users, roles, locale, gift credits, block status |
| `AuthToken` | Email verify, password reset tokens |
| `OAuthAccount` | Google OAuth linkage |
| `PushDeviceToken` | Mobile push tokens |
| `CoachProfile` | Coach bio, specialization, class types |
| `CoachAvailabilitySlot` | Coach availability slots |
| `ClassType` | Yoga, Pilates, Reformer, etc. |
| `ClassSession` | Scheduled classes (recurrence support) |
| `Booking` | Member bookings + attendance |
| `BookingNote` | Staff notes on bookings |
| `WaitlistEntry` | Waitlist with offer/promote flow |
| `PackagePlan` | Membership plans catalog |
| `UserPackage` | User subscriptions (ACTIVE/PAUSED/CANCELLED/PENDING) |
| `Payment` | Manual payments (PACKAGE/DROPIN/GIFT) |
| `GiftCard`, `GiftCardBatch` | Gift cards lifecycle |
| `ContentPost`, `ContentPostTranslation` | Explore/blog (multilingual) |
| `ContactMessage` | Contact form submissions |
| `StudioSettings` | Studio config (cancellation hours, waitlist offer minutes) |
| `ScheduleItem` | Public weekly schedule templates |
| `Achievement`, `UserAchievement` | Member progress gamification |
| `NotificationPreference` | User notification settings |
| `ClientNote` | CRM notes on clients |
| `ClassReminderSendLog` | Reminder deduplication |
| `AuditLog` | Audit trail + scheduled notification storage |

---

## 11. Հիմնական բիզնես հոսքեր

### 11.1. Visitor → Member

1. Visitor մտնում է marketing pages
2. `login` / `register` (email կամ Google OAuth)
3. JWT session cookie
4. USER → `/user`; staff → respective home

### 11.2. Booking

1. Member բացում է `/user/classes` կամ public `/schedule`
2. `POST /bookings/sessions/:sessionId`
3. Capacity check → booking `BOOKED`
4. Session full → waitlist offer

### 11.3. Waitlist

1. `POST /waitlist/sessions/:sessionId` — join
2. Spot opens → auto-offer email (configurable minutes)
3. Cron expires stale offers → promote next
4. Admin manual promote/notify
5. Convert to booking կամ `EXPIRED`/`REMOVED`

### 11.4. Package / Payment

1. User ընտրում է plan / drop-in / gift card
2. API creates `PENDING` payment
3. Admin/Manager confirms (`PATCH /payments/admin/:id/status`)
4. Side-effects: package activation, gift card issue, booking unlock

### 11.5. Content workflow

1. Content admin ստեղծում է `DRAFT` post
2. `submit-review` → `IN_REVIEW`
3. Review decision → `PUBLISHED` / `REJECTED`
4. Public `/explore` ցուցադրում

### 11.6. Gift cards

1. Purchase via checkout → pending payment
2. Admin confirms → batch/card issued
3. Redeem code → `giftCreditsCents` balance
4. Assign recipient, resend email, deactivate

---

## 12. Mobile app (Expo)

**Path:** `apps/mobile/app/` — նույն `/v1` API contract

| Screen | Route | Role |
|--------|-------|------|
| Index | `/` | — |
| Welcome | `/(auth)/welcome` | Public |
| Login | `/(auth)/login` | Public |
| Register | `/(auth)/register` | Public |
| Home | `/(main)/home` | Public/mixed |
| Schedule | `/(main)/schedule` | Public |
| Plans | `/(main)/plans` | Public |
| Classes | `/(main)/classes` | Public |
| User home | `/(main)/user/home` | USER |
| User classes | `/(main)/user/classes` | USER |
| User schedule | `/(main)/user/schedule` | USER |
| User plans | `/(main)/user/plans` | USER |
| User progress | `/(main)/user/progress` | USER |
| User profile | `/(main)/user/profile` | USER |
| Coach home | `/(main)/coach/home` | COACH |
| Coach profile | `/(main)/coach/profile` | COACH |
| Manager home | `/(main)/manager/home` | MANAGER |
| Manager bookings | `/(main)/manager/bookings` | MANAGER |
| Manager clients | `/(main)/manager/clients` | MANAGER |
| Manager profile | `/(main)/manager/profile` | MANAGER |
| Admin home | `/(main)/admin/home` | ADMIN |
| Admin clients | `/(main)/admin/clients` | ADMIN |
| Admin profile | `/(main)/admin/profile` | ADMIN |

Mobile scope-ը **փոքր է** web-ի համեմատ — հիմնական member + limited staff screens

---

## 13. i18n

- **Locales:** `hy`, `ru`, `en`
- **Messages:** `apps/web/src/messages/{hy,ru,en}.json`
- **Marketing:** URL locale prefix
- **Dashboards:** User profile `locale` field overrides URL (account shell)
- **Language switcher:** Cookie + `PATCH /users/me` locale update
- **Content:** `ContentPostTranslation` — per-locale slugs/titles

---

## 14. Ինտեգրացիաներ

| Service | Status | Նշանակություն |
|---------|--------|---------------|
| Google OAuth | ✅ Live | Social login |
| Resend | ✅ | Transactional email |
| Cloudflare R2 | ✅ | Avatar, coach photos, content covers, gift card images |
| Expo Push | ✅ | Mobile push notifications |
| Redis | Optional | Public API response cache |
| Payment gateways | 📋 Docs only | Arca, TelCell, Idram, FastShift, AmeriaBank — `docs/reference/payment integration/` |

---

## 15. UI architecture (web)

| Shell | Component | Օգտագործում |
|-------|-----------|-------------|
| Marketing | `MarketingLayoutShell`, `MarketingSiteHeader` | Public pages |
| Dashboard | `DashboardAppShell` | All role panels |
| Auth | `(auth)/layout.tsx` | Login/register |

**Key libs:**

| File | Նշանակություն |
|------|---------------|
| `lib/api.ts` | Client-side API fetch |
| `lib/server-api.ts` | Server Components API fetch |
| `lib/dashboard-nav.ts` | Sidebar navigation per role |
| `lib/role-home.ts` | Role home paths |
| `middleware.ts` | Locale + cookie routing |

---

## 16. Known gaps / նշումներ

1. **Manager panel** — intentionally limited vs Admin (view-only / partial write)
2. **`/user/gift-cards/fake-payment`** — dev/test utility, not production
3. **Payments** — manual confirmation model; live payment gateway չի միացված
4. **`/user/progress`** — implemented, sidebar-ում link չկա (profile-ից հասանելի)
5. **Global search** — dashboard shell-ում placeholder
6. **`docs/BRIEF.md`** — դեռ template (business requirements չեն լրացված)
7. **Mobile** — admin/manager/coach coverage partial

---

## 17. Հիմնական source files

| Topic | Path |
|-------|------|
| All web pages | `apps/web/src/app/` |
| Middleware | `apps/web/middleware.ts` |
| i18n routing | `apps/web/src/i18n/routing.ts` |
| Role auth | `apps/web/src/server/require-role-layout.ts` |
| Dashboard nav | `apps/web/src/lib/dashboard-nav.ts` |
| Marketing nav | `apps/web/src/components/marketing/marketing-nav-links.ts` |
| API client | `apps/web/src/lib/api.ts` |
| NestJS controllers | `apps/api/src/*/` |
| Prisma schema | `packages/database/prisma/schema.prisma` |
| Tech stack | `docs/TECH_CARD.md` |
| Design guide | `docs/PROJECT_DESIGN_GUIDE.md` |
| Project overview | `docs/PROJECT_OVERVIEW.md` |

---

*Այս փաստաթուղթը ստեղծվել է codebase static analysis-ի հիման վրա (2026-06-07):*
