# Ommm — Full Detailed Project Description

## 1) Project purpose and scope

`Ommm`-ը wellness/studio բիզնեսի համար full-stack platform է, որի նպատակն է մի տեղում լուծել.

- public brand/marketing experience
- դասերի schedule և booking
- waitlist automation
- membership/package վաճառք և կառավարում
- drop-in payment
- gift card lifecycle
- content publishing workflow
- role-based backoffice operations
- analytics/reporting/notifications

Սա `pnpm` monorepo է, որտեղ web, API, mobile և database շերտերը աշխատում են մեկ ընդհանուր domain model-ի վրա։

## 2) System architecture (high-level)

- **Frontend web (`apps/web`)** — Next.js App Router, locale-aware routing, public pages + dashboards
- **Backend API (`apps/api`)** — NestJS REST API, RBAC, business rules, integrations
- **Mobile app (`apps/mobile`)** — Expo app նույն API contract-ով
- **Data layer (`packages/database`)** — Prisma schema/migrations/seed/client
- **Docs layer (`docs`)** — architecture, implementation, design, deploy, context

## 3) Tech stack

- Monorepo/PM: `pnpm workspaces`
- Web: `Next.js 16`, `React 19`, `next-intl`, `Tailwind CSS 4`
- API: `NestJS 11`, `Passport JWT`, `class-validator`, `pino`, `helmet`, `throttler`
- Mobile: `Expo 54`, `expo-router`
- Database: `PostgreSQL`
- ORM: `Prisma 6`
- Payments: `Stripe` (checkout + webhook)
- Email: `Resend` (transport abstraction)
- Storage: Cloudflare R2 + որոշ հոսքերում local fallback
- Testing: `Jest` (API), `Playwright` (web e2e)

## 4) Core business capabilities

### 4.1 Authentication and identity

- registration/login (credentials)
- Google OAuth login
- email verification
- password reset flow
- JWT session via cookie և bearer
- role-based authorization

### 4.2 Studio operations

- class types management
- class sessions management (status, capacity, coach assignment)
- schedule admin/public APIs
- bookings lifecycle
- waitlist lifecycle (join/leave/promote/expire)
- studio settings/public contact

### 4.3 Commerce and billing

- package/plan catalog
- package subscription/assignment/state changes
- drop-in checkout
- gift card purchase/redeem/resend/deactivate
- payment history and admin payment visibility

### 4.4 Content and marketing

- content post types (`EVENT`, `BLOG`, `NEWS`, `UPDATE`, `KNOWLEDGE_ARTICLE`)
- review workflow (`DRAFT`, `IN_REVIEW`, `REJECTED`, `PUBLISHED`, `HIDDEN`)
- public explore list/detail
- marketing pages (home/story/coaches/schedule/contact/packages)

### 4.5 Notifications and reporting

- admin broadcast messaging
- scheduled notification jobs
- reminder-like background jobs
- dashboard metrics
- CSV exports (`bookings`, `payments`, `gift-credits`)

## 5) Roles and RBAC model

Prisma role enum (`packages/database/prisma/schema.prisma`).

- `USER` — member/client end-user
- `COACH` — instructor workflows
- `MANAGER` — operations manager workflows
- `CONTENT_ADMIN` — content management workflows
- `ADMIN` — full platform control

Role->home mapping (`apps/web/src/lib/role-home.ts`).

- `USER` -> `/user/home`
- `COACH` -> `/coach/home`
- `MANAGER` -> `/manager/home`
- `CONTENT_ADMIN` -> `/content-admin/home`
- `ADMIN` -> `/admin/dashboard`

## 6) Web routing model

Web routing-ը locale-first է (`/{locale}`), հիմնական route groups-երով.

- `(marketing)`
- `(auth)`
- `(account)`
- `(admin)`
- `(manager)`
- `(coach)`
- `(content-admin)`

Layout-level access control կա համապատասխան group layout-ներում։

## 7) Full page catalog (web)

### 7.1 Public / marketing pages

- `/{locale}` -> marketing home
- `/{locale}/story`
- `/{locale}/explore`
- `/{locale}/explore/[slug]`
- `/{locale}/schedule`
- `/{locale}/coaches`
- `/{locale}/packages`
- `/{locale}/packages/[categoryKey]`
- `/{locale}/membership`
- `/{locale}/memberships`
- `/{locale}/contact`

### 7.2 Authentication pages

- `/{locale}/login`
- `/{locale}/register`
- `/{locale}/forgot-password`
- `/{locale}/reset-password`
- `/{locale}/verify-email`
- `/{locale}/set-password`

### 7.3 Account entry and shared account routes

- `/{locale}/account`
- `/{locale}/dashboard`

### 7.4 Member pages (`USER`)

- `/{locale}/user`
- `/{locale}/user/home`
- `/{locale}/user/classes`
- `/{locale}/user/bookings`
- `/{locale}/user/packages`
- `/{locale}/user/packages/[categoryKey]`
- `/{locale}/user/gift-cards`
- `/{locale}/user/progress`
- `/{locale}/user/profile`
- `/{locale}/user/settings`
- `/{locale}/user/notifications`

### 7.5 Admin pages (`ADMIN`)

- `/{locale}/admin`
- `/{locale}/admin/home`
- `/{locale}/admin/dashboard`
- `/{locale}/admin/analytics`
- `/{locale}/admin/finance`
- `/{locale}/admin/reports`
- `/{locale}/admin/bookings`
- `/{locale}/admin/schedule`
- `/{locale}/admin/waitlists`
- `/{locale}/admin/clients`
- `/{locale}/admin/coaches`
- `/{locale}/admin/memberships`
- `/{locale}/admin/packages`
- `/{locale}/admin/gift-cards`
- `/{locale}/admin/content`
- `/{locale}/admin/notifications`
- `/{locale}/admin/settings`
- `/{locale}/admin/profile`
- `/{locale}/admin/guest-users`
- `/{locale}/admin/feedback`

### 7.6 Manager pages (`MANAGER`)

- `/{locale}/manager/home`
- `/{locale}/manager/classes`
- `/{locale}/manager/bookings`
- `/{locale}/manager/waitlists`
- `/{locale}/manager/clients`
- `/{locale}/manager/coaches`
- `/{locale}/manager/gift-cards`
- `/{locale}/manager/profile`
- `/{locale}/manager/settings`

### 7.7 Coach pages (`COACH`)

- `/{locale}/coach`
- `/{locale}/coach/home`
- `/{locale}/coach/schedule`
- `/{locale}/coach/groups`
- `/{locale}/coach/salary`
- `/{locale}/coach/analytics`
- `/{locale}/coach/profile`
- `/{locale}/coach/settings`
- `/{locale}/coach/notifications`

### 7.8 Content admin pages (`CONTENT_ADMIN`)

- `/{locale}/content-admin/home`
- `/{locale}/content-admin/content`
- `/{locale}/content-admin/profile`
- `/{locale}/content-admin/notifications`

## 8) API modules and responsibilities

API prefix-ը `/v1` է, domain-ներով.

- `auth` — register/login/oauth/logout/session/verify/reset
- `users` — profile/password/image/notification prefs/push token/delete request
- `studio` — studio settings public/admin
- `contact` — public contact submissions
- `classes` — class types + sessions CRUD + status/cancel
- `schedule` — public/admin schedule items
- `bookings` — member/admin booking flows + notes + attendance
- `waitlist` — join/leave/recent/active/promote/notify
- `packages` — plans, categories, user packages, admin assignments/status
- `payments` — checkout webhook, my payments, admin payments
- `gift-cards` — my purchased/received, redeem, admin create/manage
- `content` — public posts and admin content workflow
- `coaches` — public listing, admin list, panel summary/salary, CRUD/photo
- `clients` — list/details/update/delete/notes
- `notifications` — broadcast, stats, deliveries, scheduled updates/cancel
- `reports` — dashboard, finance summary, CSV exports, analytics
- `health` — service health check

## 9) API endpoint groups (concise full map)

### 9.1 Auth (`/v1/auth`)

- `POST /register`, `POST /login`, `GET /google`, `GET /google/callback`
- `POST /logout`, `POST /verify-email`
- `POST /request-password-reset`, `POST /reset-password`
- `POST /session`

### 9.2 Users (`/v1/users`)

- `GET /me`, `PATCH /me`, `PATCH /me/password`
- `POST /me/home-image-json`, `POST /me/home-image`
- `PATCH /me/notifications`
- `POST /me/push-token`
- `POST /me/delete-request`

### 9.3 Studio/contact

- `GET /v1/studio`, `PATCH /v1/studio`
- `POST /v1/contact`

### 9.4 Classes/schedule

- `GET/POST/PATCH/DELETE /v1/classes/types...`
- `GET/POST/PATCH/DELETE /v1/classes/sessions...`
- `POST /v1/classes/sessions/:id/cancel`
- `POST /v1/classes/sessions/:id/status`
- `GET /v1/schedule/public`
- `GET/POST/PATCH/DELETE /v1/schedule/admin...`

### 9.5 Bookings/waitlist

- `POST /v1/bookings/sessions/:sessionId`
- `GET /v1/bookings/me`, `DELETE /v1/bookings/:id`
- Admin bookings: list/management/get/update/delete/permanent-delete/move/attendance
- `POST /v1/bookings/:id/notes`
- Waitlist member: join/leave/me
- Waitlist admin: recent/active/session entries/remove/promote/notify

### 9.6 Packages/payments/gift-cards

- `GET /v1/packages/plans`, `GET /v1/packages/admin/plans`
- `GET /v1/packages/admin/categories`, `DELETE /v1/packages/admin/categories`
- `POST/PATCH/DELETE /v1/packages/plans...`
- `GET /v1/packages/me`, `POST /v1/packages/me/subscribe`
- `PATCH /v1/packages/me/:id/(pause|cancel|renew|change-plan)`
- `GET /v1/packages/admin/all`, `POST /v1/packages/admin/assign`
- `PATCH /v1/packages/admin/:id/status`
- `POST /v1/payments/webhook`
- `POST /v1/payments/checkout/gift`
- `POST /v1/payments/checkout/dropin/:sessionId`
- `GET /v1/payments/me`, `GET /v1/payments/admin`
- Gift cards: my purchased/received, redeem, admin list/create/deactivate/resend

### 9.7 Content/coaches/clients/notifications/reports

- Content public/admin workflow endpoints
- Coaches public/admin/panel endpoints + CRUD
- Clients CRUD-lite + notes endpoints
- Notifications admin broadcast/stats/deliveries/analytics/scheduled
- Reports dashboard + finance + csv exports + analytics endpoints

## 10) Database model and key enums

### 10.1 Key enums

- `Role`
- `ClassSessionStatus`
- `BookingStatus`
- `BookingChannel`
- `WaitlistStatus`
- `ContentType`
- `ContentStatus`
- `PaymentStatus`
- `PackageStatus`
- `ManualPaymentMethod`
- `GiftCardStatus`
- `AuthTokenType`
- `ScheduleDayOfWeek`
- `SessionRecurrencePattern`

### 10.2 Core entities

- Identity: `User`, `AuthToken`, `OAuthAccount`, `PushDeviceToken`, `NotificationPreference`
- Studio: `CoachProfile`, `CoachAvailabilitySlot`, `ClassType`, `ClassSession`, `ScheduleItem`, `StudioSettings`
- Bookings: `Booking`, `BookingNote`, `WaitlistEntry`, `ClassReminderSendLog`
- Commerce: `PackagePlan`, `UserPackage`, `Payment`, `GiftCard`
- CRM/Content: `ContentPost`, `ContactMessage`, `ClientNote`, `AuditLog`
- Progress: `Achievement`, `UserAchievement`

### 10.3 Important relation highlights

- `User` <-many-> bookings/waitlist/payments/packages/gift-cards/tokens
- `CoachProfile` <-one-> `User`, <-many-> sessions
- `ClassSession` belongs to class type + coach + optional substitute coach
- `Booking` links user and session
- `WaitlistEntry` links user and session with offer lifecycle
- `UserPackage` links user and package plan

## 11) Critical flows (end-to-end)

### 11.1 Visitor to member

1. Visitor մտնում է marketing pages
2. անցնում է `login/register`
3. ստանում է JWT session
4. redirect է լինում role home path

### 11.2 Booking flow

1. Member բացում է classes/schedule
2. book է անում session
3. capacity check
4. booking status update
5. եթե full -> waitlist flow

### 11.3 Waitlist flow

1. Join waitlist
2. Admin/system promote կամ notify
3. Offer expiration handling
4. Convert to booking կամ mark removed/expired

### 11.4 Package/payment flow

1. User ընտրում է package/drop-in/gift checkout
2. Stripe checkout session created
3. Webhook confirmation
4. DB side-effects (payment + package/gift/booking updates)

### 11.5 Content workflow

1. Content admin draft ստեղծում է post
2. submit-review
3. review decision (approve/reject style state transition)
4. publish/hide/update/delete lifecycle

## 12) Integrations and external dependencies

- `Stripe` — checkout + webhook
- `Google OAuth` — external auth login
- `Resend` — email transport
- `Cloudflare R2` — asset storage
- `Expo` — mobile and push token ecosystem

## 13) Security and platform constraints

- JWT-based auth with cookie + bearer support
- role guards API-ում
- input validation DTO-ներով
- throttling/helmet/cors platform protections
- password hash/verify flow centralized in common crypto utilities

## 14) Project maturity snapshot

- Large multi-role web surface արդեն առկա է
- API domain coverage լայն է (auth->reports ամբողջ շղթա)
- Prisma migrations history-ը ակտիվ է
- Playwright + Jest coverage foundation կա
- Mobile integration baseline-ը միացված է նույն backend contract-ին
- Dev cache files (`.next`) նորմալ local artifacts են

## 15) Developer runbook (quick)

1. copy `.env.example` -> `.env`
2. `pnpm install`
3. prisma generate/migrate ըստ անհրաժեշտության
4. start local stack

Main commands.

- `pnpm run dev`
- `pnpm run dev:all`
- `pnpm run build`
- `pnpm run test`

## 16) Important docs index

- `README.md`
- `docs/TECH_CARD.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/WEB_IMPLEMENTATION_PLAN.md`
- `docs/PROJECT_DESIGN_GUIDE.md`
- `MOBILE_SETUP.md`
- `.env.example`

## 17) Short executive summary

`Ommm`-ը production-oriented multi-role platform է, որտեղ public web experience-ը, backoffice CRM-ը, booking/commerce/content համակարգերը և mobile channel-ը միավորված են NestJS + Next.js + Prisma architecture-ի վրա։
