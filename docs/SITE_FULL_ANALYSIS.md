# Ommm — Կայքի ամբողջական անալիզ

**Ամսաթիվ:** 2026-06-05  
**Repo:** `ommm` monorepo (Size C)  
**Հիմնական web:** `apps/web` — Next.js App Router  
**Backend:** `apps/api` — NestJS + Prisma  
**Mobile:** `apps/mobile` — Expo (expo-router)  
**DB:** `packages/database` — PostgreSQL (Prisma)

---

## 1. Նախագծի նպատակ

**Ommm** — yoga/pilates studio-ի պլատֆորմ (CRM + member app + public marketing site):

- **Հանրային կայք** — studio-ի ն介绍, schedule, coaches, packages, explore/blog, contact
- **Member (USER)** — class booking, waitlist, memberships, payments, gift cards, progress
- **Staff panels** — Coach, Manager, Content Admin, Admin (studio backoffice)

---

## 2. Տեխնոլոգիական stack

| Շերտ | Տեխնոլոգիա |
|------|------------|
| Monorepo | pnpm workspaces |
| Web | Next.js App Router, React, Tailwind CSS, next-intl |
| API | NestJS, JWT (httpOnly cookie), ScheduleModule (cron) |
| DB | PostgreSQL, Prisma migrations |
| Mobile | Expo, expo-router |
| Վճարումներ | Manual/internal payment requests + admin confirmation (Stripe չի միացված) |
| Push | Expo Push API (device tokens DB-ում) |
| Ֆайլեր | Cloudflare R2 (կամ local uploads path) |

**API prefix (web client):** `/api/v1` — see `apps/web/src/lib/api.ts`

---

## 3. Routing — Next.js App Router

### 3.1. URL կառուցվածք

```
/                          → redirect default locale-ին (/en)
/{locale}/...              → բոլոր էջերը (hy | ru | en)
```

**Locale prefix:** միշտ (`localePrefix: "always"`) — `apps/web/src/i18n/routing.ts`

| Locale | Կode |
|--------|------|
| Հայերեն | `hy` |
| Русский | `ru` |
| English | `en` (default) |

### 3.2. Route groups (ֆայլային կառուցվածք)

Route groups-ը **URL-ում չեն երևում** — օգտագործվում են layout/auth-ի համար:

| Route group | Path prefix | Layout | Auth |
|-------------|-------------|--------|------|
| `(marketing)` | `/`, `/story`, `/schedule`, … | Marketing shell (header/footer) | Public |
| `(auth)` | `/login`, `/register`, … | Auth layout | Public |
| `(account)` | `/user/*`, `/account`, `/dashboard` | Member shell (`user/layout.tsx`) | USER role |
| `(admin)` | `/admin/*` | DashboardAppShell | ADMIN role |
| `(coach)` | `/coach/*` | DashboardAppShell | COACH role |
| `(manager)` | `/manager/*` | DashboardAppShell | MANAGER role |
| `(content-admin)` | `/content-admin/*` | DashboardAppShell | CONTENT_ADMIN role |
| Standalone | `/verify-email`, `/set-password` | Locale layout only | Mixed |

**Ֆайլի root:** `apps/web/src/app/`

### 3.3. Middleware

**Ֆайլ:** `apps/web/middleware.ts`

- **next-intl** — locale routing, `X-NEXT-INTL-LOCALE` header
- **UI locale cookie** — եթե cookie-ի locale-ը տարբերվում է URL prefix-ից, redirect (բացի account dashboard paths-ից)
- **Account shell paths** (cookie redirect skip): `user`, `dashboard`, `admin`, `coach`, `manager`, `content-admin`
- **Matcher:** բոլոր routes բացի `api`, `_next`, static files

### 3.4. Auth guard (server-side)

**Ֆайլ:** `apps/web/src/server/require-role-layout.ts`

Յուրաքանչյուր protected layout-ում:

1. `GET /users/me` — session cookie validation
2. Unauthenticated → redirect `/{locale}/login`
3. Wrong role → redirect `homePathForRole(role)`
4. User locale ≠ URL locale → redirect նույն path-ով preferred locale-ում

---

## 4. Roles և post-auth navigation

**Prisma `Role` enum:** `USER`, `COACH`, `MANAGER`, `CONTENT_ADMIN`, `ADMIN`

**Ֆайլ:** `apps/web/src/lib/role-home.ts`

| Role | Home path | Post-login redirect |
|------|-----------|---------------------|
| USER | `/user` | `/` (public home) |
| COACH | `/coach/home` | `/coach/home` |
| MANAGER | `/manager/home` | `/manager/home` |
| CONTENT_ADMIN | `/content-admin/home` | `/content-admin/home` |
| ADMIN | `/admin/dashboard` | `/admin/dashboard` |

---

## 5. Navigation (sidebar + header)

**Central config:** `apps/web/src/lib/dashboard-nav.ts`

### 5.1. Public marketing header

**Ֆайլ:** `apps/web/src/components/marketing/marketing-nav-links.ts`

| # | Path | Key |
|---|------|-----|
| 1 | `/` | home |
| 2 | `/story` | story |
| 3 | `/schedule` | schedule |
| 4 | `/packages` | memberships |
| 5 | `/coaches` | coaches |
| 6 | `/explore` | explore |
| 7 | `/contact` | contact |

### 5.2. Member (USER) sidebar

| Path | Label key |
|------|-----------|
| `/user` | dashboard |
| `/user/bookings` | bookings |
| `/user/classes` | schedule |
| `/user/packages` | packages |
| `/user/payments` | payments |
| `/user/gift-cards` | giftCards |

**Header notifications:** `/user/notifications`  
**Sidebar-ում չկան, բայց էջ կա:** `/user/profile`, `/user/progress`, `/user/home`

### 5.3. Coach sidebar

| Path | Label key |
|------|-----------|
| `/coach/home` | dashboard |
| `/coach/schedule` | schedule |
| `/coach/groups` | groups |
| `/coach/salary` | salary |
| `/coach/analytics` | analytics |
| `/coach/profile` | profile |

**Header:** `/coach/notifications`

### 5.4. Manager sidebar

| Path | Label key |
|------|-----------|
| `/manager/home` | home |
| `/manager/classes` | classes |
| `/manager/bookings` | bookings |
| `/manager/waitlists` | waitlists |
| `/manager/clients` | clients |
| `/manager/coaches` | coaches |
| `/manager/gift-cards` | giftCards |
| `/manager/profile` | profile |

Manager panel-ը **partial/read-only** է admin-ի համեմատ (inline comments codebase-ում).

### 5.5. Content Admin sidebar

| Path | Label key |
|------|-----------|
| `/content-admin/home` | home |
| `/content-admin/content` | content |
| `/content-admin/profile` | profile |

**Header:** `/content-admin/notifications`

### 5.6. Admin sidebar

| Path | Label key |
|------|-----------|
| `/admin/dashboard` | dashboard |
| `/admin/bookings` | bookings |
| `/admin/waitlists` | waitlists |
| `/admin/clients` | clients |
| `/admin/coaches` | coaches |
| `/admin/schedule` | schedule |
| `/admin/packages` | packages |
| `/admin/gift-cards` | giftCards |
| `/admin/finance` | finance |
| `/admin/analytics` | analytics |
| `/admin/notifications` | notificationManagement |
| `/admin/settings` | settings |
| `/admin/feedback` | feedback → **redirect** `/admin/content` |
| `/admin/guest-users` | guestUsers → **redirect** `/admin/clients` |

**Sidebar-ում չկա:** `/admin/profile`, `/admin/content` (content-ին հասնում են feedback redirect-ով)

---

## 6. Բոլոր էջերը (web)

> Բոլոր path-երը **առանց locale prefix** — իրական URL: `/{locale}{path}`  
> Օր. `/user/bookings` → `/hy/user/bookings`

### 6.1. Root

| Path | Ֆունկցիա | Status |
|------|----------|--------|
| `/` (app root) | Redirect → default locale | Redirect |

### 6.2. Standalone `[locale]`

| Path | Auth | Ֆունկցիա | Status |
|------|------|----------|--------|
| `/verify-email` | No | Email verification (`POST /auth/verify-email?token=`) | Complete |
| `/set-password` | Yes | First-time password setup | Complete |

### 6.3. Marketing — public

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/` | Home: hero, classes, coaches, plans, gallery, public schedule | Complete |
| `/story` | Studio story (static i18n, ISR revalidate 3600) | Complete |
| `/schedule` | Public class schedule | Complete |
| `/packages` | Public membership/package plans browser | Complete |
| `/packages/[categoryKey]` | Redirect → `/packages?category=` | Redirect |
| `/coaches` | Public coaches directory | Complete |
| `/explore` | Blog/explore posts list | Complete |
| `/explore/[slug]` | Single explore post | Complete |
| `/contact` | Contact form → `POST /contact` | Complete |
| `/membership` | Redirect → `/schedule` | Redirect |
| `/memberships` | Redirect → `/schedule` | Redirect |

### 6.4. Auth — public

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/login` | Email/password login, Google OAuth, role-based redirect | Complete |
| `/register` | Registration + validation, Google OAuth | Complete |
| `/forgot-password` | Password reset request | Complete |
| `/reset-password` | Password reset with token | Complete |
| `/account` | OAuth return hub; authed → role home, else sign-in CTA | Complete |

**Auth API endpoints:**

- `POST /auth/register`, `/auth/login`, `/auth/logout`
- `GET /auth/google`, `/auth/google/callback`
- `POST /auth/verify-email`, `/auth/request-password-reset`, `/auth/reset-password`
- `POST /auth/session` — session refresh/check
- JWT httpOnly cookie (`ACCESS_TOKEN_COOKIE`), 7-day max age

### 6.5. Member account (USER)

| Path | Ֆունкциոնալ | API / Features | Status |
|------|-------------|----------------|--------|
| `/dashboard` | Redirect → `/user` | — | Redirect |
| `/user` | Alias → dashboard content | — | Complete |
| `/user/dashboard` | Member dashboard widgets | `/users/me`, `/bookings/me`, `/waitlist/me` | Complete |
| `/user/home` | Logged-in marketing home copy | Marketing content | Complete |
| `/user/bookings` | Upcoming/past bookings + waitlist | Cancel/rebook | Complete |
| `/user/classes` | Bookable sessions | Book/waitlist actions | Complete |
| `/user/packages` | My memberships + payment snippet | `/packages/me` | Complete |
| `/user/packages/[categoryKey]` | Package category detail | Public plans API | Complete |
| `/user/payments` | Payment history | `/payments/me` | Complete (+ loading/error) |
| `/user/gift-cards` | Redeem, purchase, purchased/received cards | Gift card API | Complete |
| `/user/gift-cards/fake-payment` | Dev/test fake payment | Query params | Partial (dev) |
| `/user/notifications` | Notification preferences | `PATCH /users/me/notifications` | Complete |
| `/user/profile` | Profile settings | `/users/me` PATCH | Complete |
| `/user/progress` | Achievements, analytics | `/reports/user/analytics` | Complete |
| `/user/settings` | Redirect → `/user/profile` | — | Redirect |

### 6.6. Admin (ADMIN)

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/admin` | Redirect → `/admin/dashboard` | Redirect |
| `/admin/home` | Redirect → `/admin/dashboard` | Redirect |
| `/admin/dashboard` | KPI metrics dashboard | Complete (+ loading) |
| `/admin/bookings` | Full bookings management | Complete |
| `/admin/waitlists` | Waitlist management | Complete |
| `/admin/clients` | Client CRM, notes, filters | Complete |
| `/admin/coaches` | Coach directory, schedule | Complete |
| `/admin/schedule` | Session CRUD, calendar views | Complete |
| `/admin/packages` | Package plan management | Complete |
| `/admin/gift-cards` | Gift card batches, assign | Complete |
| `/admin/finance` | Revenue, payments, salaries | Complete |
| `/admin/analytics` | Studio analytics | Complete |
| `/admin/notifications` | Broadcast, scheduled, delivery stats | Complete |
| `/admin/settings` | Studio settings | `/studio` GET/PATCH | Complete |
| `/admin/content` | Explore/content posts panel | Complete |
| `/admin/profile` | Admin profile | Complete |
| `/admin/feedback` | Redirect → `/admin/content` | Redirect |
| `/admin/guest-users` | Redirect → `/admin/clients` | Redirect |
| `/admin/reports` | Redirect → `/admin/analytics` | Redirect |
| `/admin/memberships` | Redirect → `/admin/packages` | Redirect |

**Admin route group error boundary:** `apps/web/src/app/[locale]/(admin)/error.tsx`

### 6.7. Coach (COACH)

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/coach` | Redirect → `/coach/home` | Redirect |
| `/coach/home` | Today's sessions/roster summary | Complete |
| `/coach/schedule` | Upcoming sessions | Complete |
| `/coach/groups` | Attendance roster | Complete |
| `/coach/salary` | Earnings summary | `/coaches/panel/salary` | Complete |
| `/coach/analytics` | 30-day analytics | `/reports/coach/analytics` | Complete |
| `/coach/profile` | Coach profile | Complete |
| `/coach/notifications` | Notification prefs | Complete |
| `/coach/settings` | Redirect → `/coach/profile` | Redirect |

### 6.8. Manager (MANAGER)

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/manager/home` | Ops overview KPIs | `/reports/dashboard` | Complete |
| `/manager/classes` | View-only class types + sessions | Partial |
| `/manager/bookings` | Bookings table, limited actions | Partial |
| `/manager/waitlists` | Waitlist table, move/remove | Partial |
| `/manager/clients` | Client list + limited actions | Partial |
| `/manager/coaches` | Coach directory (no delete) | Partial |
| `/manager/gift-cards` | View cards (no create/deactivate) | Partial |
| `/manager/profile` | Manager profile | Complete |
| `/manager/settings` | Redirect → `/manager/profile` | Redirect |

### 6.9. Content Admin (CONTENT_ADMIN)

| Path | Ֆունкциոնալ | Status |
|------|-------------|--------|
| `/content-admin/home` | Hub links | Complete |
| `/content-admin/content` | ContentPostsPanel (explore posts) | Complete |
| `/content-admin/profile` | Profile | Complete |
| `/content-admin/notifications` | Notification prefs | Complete |

### 6.10. Next.js API routes (web)

| Path | Ֆունкциոնալ |
|------|-------------|
| `/api/cron/warm-api` | Cron warm-up for API (Vercel cron) |

---

## 7. Backend API — NestJS modules

**Base:** `/api/v1` (proxied from Next.js dev or direct to Nest)

### 7.1. Auth (`/auth`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/register` | Registration |
| POST | `/login` | Login + JWT cookie |
| GET | `/google` | Google OAuth start |
| GET | `/google/callback` | OAuth callback |
| POST | `/logout` | Logout |
| POST | `/verify-email` | Email verification |
| POST | `/request-password-reset` | Reset email |
| POST | `/reset-password` | New password |
| POST | `/session` | Session check |

### 7.2. Users (`/users`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/me` | Current user |
| PATCH | `/me` | Update profile |
| PATCH | `/me/password` | Change password |
| POST | `/me/home-image`, `/me/home-image-json` | Home image upload |
| PATCH | `/me/notifications` | Notification prefs |
| POST | `/me/push-token` | Push device token |
| POST | `/me/delete-request` | Account deletion request |

### 7.3. Classes (`/classes`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/types` | Class types (public) |
| POST/PATCH/DELETE | `/types`, `/types/:id` | Admin class types |
| GET | `/sessions` | Public/member sessions |
| GET | `/sessions/:id` | Session detail |
| GET/POST/PATCH/DELETE | `/admin/sessions/*` | Admin session CRUD |
| POST | `/sessions/batch` | Batch create |
| POST | `/sessions/:id/cancel`, `/status` | Session lifecycle |

### 7.4. Bookings (`/bookings`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/sessions/:sessionId` | Book session |
| GET | `/me` | My bookings |
| DELETE | `/:id` | Cancel booking |
| GET/PATCH/DELETE | `/admin/*` | Admin booking management |
| PATCH | `/admin/:id/attendance` | Mark attendance |
| POST | `/:id/notes` | Booking notes |

### 7.5. Waitlist (`/waitlist`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST/DELETE | `/sessions/:sessionId` | Join/leave waitlist |
| GET | `/me` | My waitlist |
| GET | `/admin/active`, `/admin/recent` | Admin views |
| POST | `/entries/:id/promote`, `/notify` | Promote/notify |
| DELETE | `/entries/:id` | Remove entry |

### 7.6. Schedule (`/schedule`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/public` | Public weekly schedule |
| GET/POST/PATCH/DELETE | `/admin/*` | Admin schedule templates |

### 7.7. Packages (`/packages`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/plans` | Public plans |
| GET | `/me` | My packages |
| POST | `/me/subscribe` | Subscribe |
| PATCH | `/me/:id/pause`, `/cancel`, `/renew`, `/change-plan` | Package lifecycle |
| GET/POST/PATCH/DELETE | `/admin/*` | Admin plan management |
| POST | `/admin/assign` | Assign package to user |

### 7.8. Payments (`/payments`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/checkout/gift` | Gift card checkout |
| POST | `/checkout/gift/:reference/confirm` | Confirm gift payment |
| POST | `/checkout/dropin/:sessionId` | Drop-in checkout |
| GET | `/me` | My payments |
| GET/PATCH | `/admin/*` | Admin payment confirmation |

### 7.9. Gift cards (`/gift-cards`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/me/purchased`, `/me/received` | Member cards |
| POST | `/redeem` | Redeem code |
| GET | `/market` | Public market |
| GET/POST/PATCH/DELETE | `/admin/*` | Admin batches, assign, deactivate |

### 7.10. Coaches (`/coaches`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/` | Public coach list |
| GET | `/:id` | Coach detail |
| GET | `/panel/summary`, `/panel/salary` | Coach panel |
| GET/POST/PATCH/DELETE | `/admin/*` | Admin coach CRUD |
| POST | `/:id/photo-json` | Photo upload |

### 7.11. Clients (`/clients`) — Admin/Manager CRM

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/`, `/:id` | List/detail |
| PATCH/DELETE | `/:id` | Update/block |
| GET/POST | `/:id/notes` | Client notes |

### 7.12. Content (`/content`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/posts`, `/posts/:slug` | Public explore posts |
| GET/POST/PATCH/DELETE | `/admin/posts/*` | Content admin CRUD |
| POST | `/admin/posts/:id/submit-review`, `/review` | Review workflow |

### 7.13. Notifications (`/notifications`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/admin/broadcast` | Broadcast |
| GET | `/admin/stats`, `/deliveries`, `/analytics` | Analytics |
| GET/PATCH/DELETE | `/admin/scheduled/*` | Scheduled notifications |

### 7.14. Reports (`/reports`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/dashboard` | Manager/admin KPIs |
| GET | `/bookings.csv`, `/payments.csv`, `/gift-credits.csv` | CSV exports |
| GET | `/finance/summary` | Finance summary |
| GET | `/coach/analytics`, `/user/analytics` | Role analytics |

### 7.15. Studio (`/studio`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| GET | `/` | Studio settings |
| PATCH | `/` | Update settings |

### 7.16. Contact (`/contact`)

| Method | Path | Նկարագրություն |
|--------|------|----------------|
| POST | `/` | Contact form submission |

### 7.17. Health

| Method | Path |
|--------|------|
| GET | `/health` |

---

## 8. Database — հիմնական entities

**Schema:** `packages/database/prisma/schema.prisma`

| Model | Նշանակություն |
|-------|---------------|
| `User` | Users, roles, locale, gift credits, block status |
| `AuthToken` | Email verify, password reset tokens |
| `OAuthAccount` | Google OAuth linkage |
| `PushDeviceToken` | Mobile push tokens |
| `CoachProfile` | Coach bio, specialization, availability |
| `CoachAvailabilitySlot` | Coach availability |
| `ClassType` | Yoga, Pilates, Reformer, etc. |
| `ClassSession` | Scheduled classes (recurrence support) |
| `Booking` | Member bookings + attendance |
| `BookingNote` | Notes on bookings |
| `WaitlistEntry` | Waitlist with promote/offer flow |
| `PackagePlan` | Membership plans |
| `UserPackage` | User subscriptions (ACTIVE/PAUSED/CANCELLED/PENDING) |
| `Payment` | Manual payments (PACKAGE/DROPIN/GIFT) |
| `GiftCard`, `GiftCardBatch` | Gift cards |
| `ContentPost` | Explore/blog posts (review workflow) |
| `ContactMessage` | Contact form messages |
| `StudioSettings` | Studio config |
| `NotificationPreference` | User notification settings |
| `UserAchievement` | Member achievements |
| `ClientNote` | CRM notes on clients |

**Enums:** `Role`, `ClassSessionStatus`, `BookingStatus`, `WaitlistStatus`, `ContentType`, `ContentStatus`, `PaymentStatus`, `PackageStatus`, `GiftCardStatus`, …

---

## 9. i18n

- **Locales:** `hy`, `ru`, `en`
- **Messages:** `apps/web/src/messages/{hy,ru,en}.json`
- **Marketing:** URL locale prefix + cookie preference
- **Account dashboards:** User profile `locale` field overrides cookie (via `redirectIfPreferredAccountLocale`)
- **Language switcher:** Updates cookie + user profile (`PATCH /users/me`)

---

## 10. UI architecture (web)

### 10.1. Layout shells

| Shell | Component | Օգտագործում |
|-------|-----------|-------------|
| Marketing | `MarketingLayoutShell`, `MarketingSiteHeader` | Public pages |
| Dashboard | `DashboardAppShell` | All role panels |
| Auth | `(auth)/layout.tsx` | Login/register |

### 10.2. Shared lib (selected)

| File | Նշանակություն |
|------|---------------|
| `lib/api.ts` | Client-side API fetch |
| `lib/server-api.ts` | Server Components API fetch |
| `lib/dashboard-nav.ts` | Sidebar navigation |
| `lib/role-home.ts` | Role home paths |
| `lib/public-package-categories.ts` | Package categories for marketing |
| `lib/schedule-class-types.ts` | Schedule class type helpers |

### 10.3. Loading / Error boundaries

| Route | loading.tsx | error.tsx |
|-------|-------------|-----------|
| `/user/payments` | ✓ | ✓ |
| `/admin/dashboard` | ✓ | — |
| Admin group | — | ✓ (group-level) |

---

## 11. Mobile app (Expo)

**Path:** `apps/mobile/app/`

| Screen | Path (expo-router) |
|--------|-------------------|
| Index | `/` |
| Welcome | `/(auth)/welcome` |
| Login | `/(auth)/login` |
| Register | `/(auth)/register` |
| Home | `/(main)/home` |
| Schedule | `/(main)/schedule` |
| Plans | `/(main)/plans` |
| User home | `/(main)/user/home` |
| User classes | `/(main)/user/classes` |
| User schedule | `/(main)/user/schedule` |
| User plans | `/(main)/user/plans` |
| User progress | `/(main)/user/progress` |
| User profile | `/(main)/user/profile` |
| Coach home | `/(main)/coach/home` |
| Coach profile | `/(main)/coach/profile` |
| Manager home | `/(main)/manager/home` |
| Manager bookings | `/(main)/manager/bookings` |
| Manager clients | `/(main)/manager/clients` |
| Manager profile | `/(main)/manager/profile` |
| Admin home | `/(main)/admin/home` |
| Admin clients | `/(main)/admin/clients` |
| Admin profile | `/(main)/admin/profile` |

Mobile-ը **ավելի փոքր scope** ունի web-ի համեմատ — նույն API-ն է օգտագործում:

---

## 12. Dev commands

```bash
pnpm install          # postinstall → prisma generate
pnpm run dev          # web + api
pnpm run dev:web      # Next.js only
pnpm run dev:api      # NestJS only
pnpm run dev:all      # web + api + mobile
pnpm run build:api    # API build check
```

---

## 13. Route statistics

| Խումբ | Routes | Redirects | Substantive pages |
|-------|--------|-----------|-------------------|
| Root | 1 | 1 | 0 |
| Standalone locale | 2 | 0 | 2 |
| Marketing | 11 | 3 | 8 |
| Auth | 5 | 0 | 5 |
| Account (USER) | 16 | 2 | 14 |
| Admin | 20 | 6 | 14 |
| Coach | 9 | 2 | 7 |
| Manager | 9 | 1 | 8 |
| Content-admin | 4 | 0 | 4 |
| **Ընդամենը** | **~77** | **~15** | **~62** |

---

## 14. Known gaps / notes

1. **`/user/progress` և `/user/profile`** — implemented, բայց USER sidebar-ում link չկա
2. **`/admin/content`** — sidebar-ում `/admin/feedback` redirect է, direct nav href չկա
3. **Manager panel** — intentionally limited vs Admin (view-only / partial write)
4. **`/user/gift-cards/fake-payment`** — dev/test utility, not production flow
5. **Global search** — dashboard shell-ում placeholder («not available yet»)
6. **Payments** — manual confirmation model, not Stripe integration
7. **BRIEF.md** — դեռ template (լրացված չէ business requirements-ով)

---

## 15. Key source files (reference)

| Topic | Path |
|-------|------|
| All pages | `apps/web/src/app/` |
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

---

*Այս փաստաթուղթը ստեղծվել է codebase static analysis-ի հիման վրա (2026-06-05):*
