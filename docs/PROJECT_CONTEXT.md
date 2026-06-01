# PROJECT_CONTEXT

## 1) Project overview

### What the project is about
- This repository is a pnpm monorepo for **Ommm**, a studio operations platform with:
  - Web app (`apps/web`)
  - API (`apps/api`)
  - Mobile app (`apps/mobile`)
  - Shared database package (`packages/database`)
- Evidence: `docs/TECH_CARD.md`, `pnpm-workspace.yaml`, root `package.json`, module structure in `apps/api/src`.

### Main purpose
- Provide a single system for:
  - Public marketing and content pages
  - Authentication (email/password + Google OAuth)
  - Class scheduling, booking, waitlist, memberships
  - Gift cards and payment processing (Stripe)
  - Role-based dashboards (member, coach, manager, content admin, admin)

### Main user roles
- Prisma `Role` enum in `packages/database/prisma/schema.prisma`:
  - `USER`
  - `COACH`
  - `MANAGER`
  - `CONTENT_ADMIN`
  - `ADMIN`
- Demo role users are seeded in `packages/database/prisma/seed.ts`.

### Main business logic
- Authentication + role-based access on both web and API:
  - API guards: `apps/api/src/common/guards/jwt-auth.guard.ts`, `apps/api/src/common/guards/roles.guard.ts`
  - Web role-gated layouts: `apps/web/src/server/require-role-layout.ts`
- Studio operations:
  - Class/session management: `apps/api/src/classes/*`
  - Booking lifecycle: `apps/api/src/bookings/*`
  - Waitlist offer/promote flow with cron expiration: `apps/api/src/waitlist/waitlist.service.ts`
  - Membership management: `apps/api/src/memberships/*`
  - Payments + webhook fulfillment: `apps/api/src/payments/payments.service.ts`
  - Notifications + reminders + scheduled broadcasts: `apps/api/src/notifications/*`

### Main user flows
- Public visitor: browse marketing pages -> explore content/schedule -> register/login.
- Member (`USER`): login -> browse sessions -> book/join waitlist -> manage memberships/gift cards/profile.
- Coach (`COACH`): view dashboard/schedule/groups/salary/analytics.
- Manager (`MANAGER`): manage day-to-day classes, bookings, waitlists, clients, coaches, gift cards.
- Admin (`ADMIN`): full operational control (finance/analytics/settings/notifications/content/etc.).
- Content admin (`CONTENT_ADMIN`): content lifecycle and review-related workflows.

---

## 2) Technology stack

| Area | Stack | Evidence |
|---|---|---|
| Frontend (web) | Next.js 16 App Router, React 19, `next-intl`, Tailwind CSS v4 | `apps/web/package.json`, `apps/web/src/app`, `apps/web/middleware.ts` |
| Backend | NestJS 11 + Passport JWT + class-validator + pino + helmet + schedule/throttler | `apps/api/package.json`, `apps/api/src/app.module.ts` |
| Mobile | Expo 54 + expo-router + SecureStore/AsyncStorage | `apps/mobile/package.json`, `apps/mobile/src/auth/accessTokenStorage.ts` |
| Database | PostgreSQL | `packages/database/prisma/schema.prisma` datasource |
| ORM | Prisma 6 | root/package database package scripts + Prisma schema/migrations |
| Authentication | JWT (cookie and bearer), email/password, Google OAuth | `apps/api/src/auth/*`, `apps/api/src/common/constants.ts` |
| Payment system | Stripe Checkout + Stripe Webhook | `apps/api/src/payments/*` |
| Email system | Resend (or log transport fallback) | `apps/api/src/mail/mail.service.ts` |
| Storage | Cloudflare R2 (S3 API) with local-disk fallback for uploads | `apps/api/src/storage/r2-home-image.storage.ts`, `apps/api/src/users/users.service.ts` |
| External services | Google OAuth, Stripe, Resend, Expo Push | `apps/api/src/auth/google-oauth.service.ts`, `apps/api/src/payments/*`, `apps/api/src/mail/*`, `apps/api/src/notifications/expo-push.service.ts` |
| Deployment tools | Vercel (web), Render (API), Neon-compatible Postgres documented | `docs/DEPLOY_ENV_PLACEMENT.md`, `docs/TECH_CARD.md` |

Notes:
- Upstash Redis env vars are present in `.env.example`, but code usage was not found in this scan -> **Needs verification**.
- Non-Stripe payment docs exist under `docs/reference/payment integration/`, but runtime implementation in `apps/api` is Stripe-based.

---

## 3) Folder structure

## Repository root
- `apps/web` - Next.js application (routes, UI components, middleware, i18n messages).
- `apps/api` - NestJS API (modules/controllers/services).
- `apps/mobile` - Expo app (app screens + mobile auth/api client helpers).
- `packages/database` - Prisma schema, migrations, seed, generated client build target.
- `docs` - technical and deployment documentation.
- `.env.example` - shared environment variable contract.

### Important web folders/files
- App routes:
  - `apps/web/src/app`
  - Route groups: `(marketing)`, `(auth)`, `(account)`, `(admin)`, `(manager)`, `(coach)`, `(content-admin)` under `[locale]`
- Components:
  - `apps/web/src/components`
  - Domain groups include `account`, `admin`, `marketing`, `shell`, etc.
- Lib/utils:
  - `apps/web/src/lib` (API clients, role nav, routing helpers, shared UI logic)
  - `apps/web/src/hooks`
- Config:
  - `apps/web/next.config.ts`
  - `apps/web/middleware.ts`
  - `apps/web/src/i18n/*`
- Styles:
  - `apps/web/src/app/globals.css`
  - `apps/web/src/styles/tokens.css`
- Public assets:
  - `apps/web/public/*`

### Important API folders/files
- API routes/controllers:
  - `apps/api/src/**/*.controller.ts`
- Business logic/services:
  - `apps/api/src/**/*.service.ts`
- Auth:
  - `apps/api/src/auth/*`
  - Shared guards/decorators in `apps/api/src/common/*`
- Database access:
  - `apps/api/src/prisma/*`
- Payments:
  - `apps/api/src/payments/*`
- Email:
  - `apps/api/src/mail/*`
- Notifications:
  - `apps/api/src/notifications/*`
- Config/bootstrap:
  - `apps/api/src/app.module.ts`
  - `apps/api/src/main.ts`
  - `apps/api/src/cors-origin.ts`

### Database package
- `packages/database/prisma/schema.prisma` - models/enums/relations.
- `packages/database/prisma/migrations/*` - migration history.
- `packages/database/prisma/seed.ts` - seed data + role demo users.

### Mobile app
- Routes/screens:
  - `apps/mobile/app/*`
- Auth/session:
  - `apps/mobile/src/auth/*`
- API config:
  - `apps/mobile/src/lib/api/config.ts`

---

## 4) Pages and routes (web)

Notes:
- Locale prefix applies to almost all pages: `/{locale}` where locales are defined in `apps/web/src/i18n/routing.ts`.
- Root `/` redirects to locale route.
- Authenticated dashboard sections are role-gated in server layouts using `requireAuthForLayout` / `redirectIfRoleNotIn`.

| Route | Purpose | Main components | Important logic |
|---|---|---|---|
| `/` | Root entry | `apps/web/src/app/page.tsx` | Redirects to localized route |
| `/{locale}` | Marketing homepage | Marketing sections under `apps/web/src/components/marketing/*` | Locale middleware + marketing layout |
| `/{locale}/explore` | Public content listing | Explore-related marketing components | Uses content API endpoints |
| `/{locale}/explore/[slug]` | Public content detail | Content detail view components | Slug-based fetch/render |
| `/{locale}/schedule` | Public schedule page | `marketing-schedule-*` components | Reads schedule/classes APIs |
| `/{locale}/coaches` | Public coaches page | marketing coach grid components | Public coach listing |
| `/{locale}/memberships` | Public plans page | marketing membership components | Plan display + checkout entry points |
| `/{locale}/story` | Public story/about | marketing content components | Static/curated content |
| `/{locale}/contact` | Public contact form | `contact-message-form` | Submits to `POST /v1/contact` |
| `/{locale}/login` | Sign-in | Auth login page/components | Credentials + Google login URL |
| `/{locale}/register` | Sign-up | Auth registration page/components | Creates account + cookie session |
| `/{locale}/forgot-password` | Request password reset | auth form components | Calls password reset request endpoint |
| `/{locale}/reset-password` | Set new password | auth form components | Token-based password reset |
| `/{locale}/verify-email` | Email verification | verify page | Uses verification token flow |
| `/{locale}/set-password` | Set password for OAuth/empty-password users | account password form | Complements OAuth flow |
| `/{locale}/account` | Authenticated role hub | account redirect page | Redirects to role home path |
| `/{locale}/user/*` | Member dashboard pages | `apps/web/src/components/account/*`, dashboard shell | Role check (`USER`), member workflows |
| `/{locale}/admin/*` | Admin dashboard pages | `apps/web/src/components/admin/*`, dashboard shell | Role check (`ADMIN`) |
| `/{locale}/manager/*` | Manager dashboard pages | manager/admin operation components | Role check (`MANAGER`) |
| `/{locale}/coach/*` | Coach panel pages | coach dashboard components | Role check (`COACH`) |
| `/{locale}/content-admin/*` | Content admin pages | content admin components | Role check (`CONTENT_ADMIN`) |

Legacy redirects:
- `/:locale/account/{classes,bookings,memberships,gift-cards,settings}` -> mapped to `/user/*` in `apps/web/next.config.ts`.

---

## 5) API endpoints

Notes:
- All API paths are prefixed with `/v1` (`apps/api/src/common/constants.ts`).
- Input DTO classes are in each module `dto` folder.
- Output is service return payload unless explicitly streamed (CSV endpoints).

| Endpoint | Method | Purpose | Input data | Output data | Side effects |
|---|---|---|---|---|---|
| `/v1/health` | GET | Health check | none | `{status:"ok"}` | none |
| `/v1/auth/register` | POST | Register account | `RegisterDto` | user + access token | Creates user, verify token, sets cookie, sends email |
| `/v1/auth/login` | POST | Login | `LoginDto` | sanitized user + access token | Sets auth cookie |
| `/v1/auth/google` | GET | Start Google OAuth | none | redirect | Sets OAuth state cookie |
| `/v1/auth/google/callback` | GET | Complete Google OAuth | `code`, `state` query + state cookie | redirect | Creates/links OAuth account, sets auth cookie |
| `/v1/auth/logout` | POST | Logout | none | `{ok:true}` | Clears auth cookie |
| `/v1/auth/verify-email` | POST | Verify email token | `VerifyEmailDto` | `{ok:true}` | Marks email verified, consumes token |
| `/v1/auth/request-password-reset` | POST | Request reset | `RequestPasswordResetDto` | `{ok:true}` | Creates reset token, sends email |
| `/v1/auth/reset-password` | POST | Reset password | `ResetPasswordDto` | `{ok:true}` | Updates password hash |
| `/v1/auth/session` | POST | Return current session user | JWT | `{user}` | none |
| `/v1/users/me` | GET | Get self profile context | JWT | profile + prefs + achievements | none |
| `/v1/users/me` | PATCH | Update profile | `UpdateProfileDto` | updated user | Updates user and refreshes JWT cookie |
| `/v1/users/me/password` | PATCH | Change/set password | `ChangePasswordDto` | status + user | Updates password hash |
| `/v1/users/me/home-image-json` | POST | Upload home image (base64) | `HomeImageJsonDto` | updated user + message | Uploads to R2 or local disk; may delete old file |
| `/v1/users/me/home-image` | POST | Upload home image (multipart) | file (`HOME_IMAGE_MAX_BYTES`) | updated user + message | Uploads to R2 or local disk |
| `/v1/users/me/notifications` | PATCH | Update notification prefs | `NotificationPrefsDto` | updated profile payload | Upserts `NotificationPreference` |
| `/v1/users/me/push-token` | POST | Register push token | `RegisterPushTokenDto` | `{ok:true}` | Upserts `PushDeviceToken` |
| `/v1/users/me/delete-request` | POST | Submit account deletion request | `RequestAccountDeletionDto` | `{ok:true}` | Writes a `ContactMessage` request record |
| `/v1/studio` | GET | Public studio settings | none | settings | none |
| `/v1/studio` | PATCH | Update studio settings | `UpdateStudioDto` (ADMIN) | updated settings | Updates singleton settings |
| `/v1/contact` | POST | Public contact submission | `CreateContactMessageDto` | create result | Creates `ContactMessage` |
| `/v1/classes/types` | GET | List class types | none | class types | none |
| `/v1/classes/types` | POST | Create class type | `CreateClassTypeDto` | created type | DB create |
| `/v1/classes/types/:id` | DELETE | Delete class type | id | status/object | DB delete |
| `/v1/classes/sessions` | GET | List public sessions | `from,to,coachId,typeId` | sessions list | none |
| `/v1/classes/sessions/:id` | GET | Get public session | id | session | none |
| `/v1/classes/admin/sessions` | GET | Admin session list | `AdminListSessionsQueryDto` | paged list | none |
| `/v1/classes/sessions` | POST | Create session | `CreateSessionDto` | created session | DB create |
| `/v1/classes/sessions/:id` | PATCH | Update session | `UpdateSessionDto` | updated session | DB update |
| `/v1/classes/sessions/:id/cancel` | POST | Cancel session | id | status/object | Updates session status |
| `/v1/classes/sessions/:id/status` | POST | Set session status | body `status` | status/object | Updates session status |
| `/v1/classes/sessions/:id` | DELETE | Delete session | id | status/object | DB delete |
| `/v1/bookings/sessions/:sessionId` | POST | Book class | `CreateBookingDto` | booking | Creates booking, checks capacity/membership rules |
| `/v1/bookings/me` | GET | My bookings | JWT | bookings | none |
| `/v1/bookings/:id` | DELETE | Cancel my booking | id | status/object | Booking cancel, may trigger waitlist logic |
| `/v1/bookings/admin` | GET | Admin list bookings | filters | bookings | none |
| `/v1/bookings/admin/management` | GET | Admin management listing | `AdminBookingsManagementQueryDto` | management payload | none |
| `/v1/bookings/admin/:id` | GET | Admin get one booking | id | booking detail | none |
| `/v1/bookings/admin/:id` | PATCH | Admin update booking | `UpdateAdminBookingDto` | updated booking | DB update |
| `/v1/bookings/admin/:id` | DELETE | Admin cancel booking | id | status/object | Booking cancel |
| `/v1/bookings/admin/:id/permanent` | DELETE | Admin hard delete booking | id | status/object | Permanent delete |
| `/v1/bookings/admin/:id/move` | PATCH | Move booking to another session | `MoveBookingDto` | moved booking | Updates booking/session associations |
| `/v1/bookings/admin/:id/attendance` | PATCH | Mark attendance | body `attended` | updated booking | Writes attendance status/time |
| `/v1/bookings/:id/notes` | POST | Add booking note | `CreateBookingNoteDto` | note/booking payload | Creates `BookingNote` |
| `/v1/waitlist/sessions/:sessionId` | POST | Join waitlist | sessionId | waitlist entry | Creates waitlist entry |
| `/v1/waitlist/sessions/:sessionId` | DELETE | Leave waitlist | sessionId | `{ok:true}` | Updates waitlist status to removed |
| `/v1/waitlist/me` | GET | My waitlist entries | JWT | waitlist list | none |
| `/v1/waitlist/admin/recent` | GET | Recent waitlist entries | `take` | list | none |
| `/v1/waitlist/sessions/:sessionId` | GET | Waitlist for session | sessionId | list | role-scoped access checks |
| `/v1/waitlist/entries/:id` | DELETE | Remove waitlist entry | id | `{ok:true}` | Sets status removed |
| `/v1/waitlist/entries/:id/promote` | POST | Promote waitlist to booking | `PromoteWaitlistEntryDto` | booking | Converts entry, writes audit log |
| `/v1/waitlist/entries/:id/notify` | POST | Manual waitlist notification | `ManualNotifyWaitlistEntryDto` | `{ok:true}` | Sends email, writes audit log |
| `/v1/memberships/plans` | GET | Public plans | none | plans | none |
| `/v1/memberships/admin/plans` | GET | Admin plans | none | plans | none |
| `/v1/memberships/plans` | POST | Create plan | `CreatePlanDto` | plan | DB create |
| `/v1/memberships/plans/:id` | PATCH | Update plan | `UpdatePlanDto` | updated plan | DB update |
| `/v1/memberships/plans/:id` | DELETE | Delete plan | id | status/object | DB delete |
| `/v1/memberships/me` | GET | My memberships | JWT | memberships | none |
| `/v1/memberships/me/:id/pause` | PATCH | Pause my membership | id | updated membership | status/time updates |
| `/v1/memberships/me/:id/cancel` | PATCH | Cancel my membership | id | updated membership | status updates |
| `/v1/memberships/me/:id/renew` | PATCH | Renew my membership | id | updated membership | period/status updates |
| `/v1/memberships/me/:id/change-plan` | PATCH | Change plan | `ChangeMembershipPlanDto` | updated membership | plan transition updates |
| `/v1/memberships/admin/all` | GET | Admin list all memberships | `take,offset` | paged list | none |
| `/v1/memberships/admin/assign` | POST | Manual assign membership | body `userId,planId` | membership | Creates assignment |
| `/v1/memberships/admin/:id/status` | PATCH | Set membership status | body `status` | updated membership | status updates |
| `/v1/payments/webhook` | POST | Stripe webhook receiver | raw body + stripe signature | `{received:true}` | Fulfills membership/gift/drop-in effects |
| `/v1/payments/checkout/membership/:planId` | POST | Start membership checkout | planId | `{url}` | Creates Stripe checkout session |
| `/v1/payments/checkout/gift` | POST | Start gift checkout | `CreateGiftCheckoutDto` | `{url}` | Creates Stripe checkout session |
| `/v1/payments/checkout/dropin/:sessionId` | POST | Start drop-in checkout | sessionId | `{url}` | Creates Stripe checkout session |
| `/v1/payments/me` | GET | My payments | JWT | payment list | none |
| `/v1/payments/admin` | GET | Admin payment list | `AdminListPaymentsQueryDto` | paged/list payload | none |
| `/v1/gift-cards/me/purchased` | GET | Purchased cards | JWT | gift cards | none |
| `/v1/gift-cards/me/received` | GET | Received cards | JWT | gift cards | none |
| `/v1/gift-cards/redeem` | POST | Redeem code | `RedeemGiftDto` | status/object | Updates card/user credits |
| `/v1/gift-cards/admin` | GET | Admin list cards | none | card list | none |
| `/v1/gift-cards/admin` | POST | Admin create card | `AdminCreateGiftCardDto` | card | DB create, may send email |
| `/v1/gift-cards/admin/:id/deactivate` | PATCH | Deactivate card | id | status/object | Updates status |
| `/v1/gift-cards/admin/:id/resend` | POST | Resend gift email | id | status/object | Sends email |
| `/v1/coaches` | GET | Public coach list | none | coaches | none |
| `/v1/coaches/:id` | GET | Public coach detail | id | coach | none |
| `/v1/coaches/admin/list` | GET | Admin/manager coach list | `AdminListCoachesQueryDto` | list payload | none |
| `/v1/coaches/panel/summary` | GET | Coach summary | JWT coach | summary | none |
| `/v1/coaches/panel/salary` | GET | Coach salary summary | JWT coach | salary payload | none |
| `/v1/coaches` | POST | Create coach | `CreateCoachDto` | coach | Creates user/coach profile (service-managed) |
| `/v1/coaches/:id` | PATCH | Update coach | `UpdateCoachDto` | updated coach | DB update |
| `/v1/coaches/:id/photo-json` | POST | Upload coach photo | `UploadCoachPhotoJsonDto` | updated coach | Upload/update avatar |
| `/v1/clients` | GET | List clients | `AdminListClientsQueryDto` | list payload | none |
| `/v1/clients/:id` | GET | Client details | id | client payload | none |
| `/v1/clients/:id` | PATCH | Update client basic info | `UpdateClientDto` | updated client | DB update |
| `/v1/clients/:id/notes` | GET | List client notes | id | note list | none |
| `/v1/clients/:id/notes` | POST | Add client note | `AddClientNoteDto` | note | Creates `ClientNote` |
| `/v1/content/posts` | GET | Public posts list | `type?` | posts | none |
| `/v1/content/posts/:slug` | GET | Public post by slug | slug | post | none |
| `/v1/content/admin/posts` | GET | Admin/content-admin list posts | none | posts | none |
| `/v1/content/admin/posts` | POST | Create post | `UpsertPostDto` | created post | DB create |
| `/v1/content/admin/posts/:id` | PATCH | Update post | `UpsertPostDto` | updated post | DB update |
| `/v1/content/admin/posts/:id/submit-review` | POST | Submit for review | id | updated post/status | Workflow state change |
| `/v1/content/admin/posts/:id/review` | POST | Review action | `ReviewPostDto` | updated post/status | Workflow state change |
| `/v1/content/admin/posts/:id` | DELETE | Delete post | id | status/object | DB delete |
| `/v1/schedule/public` | GET | Public schedule items | none | list | none |
| `/v1/schedule/admin` | GET | Admin schedule items | none | list | none |
| `/v1/schedule/admin` | POST | Create schedule item | `CreateScheduleItemDto` | item | DB create |
| `/v1/schedule/admin/:id` | PATCH | Update schedule item | `UpdateScheduleItemDto` | item | DB update |
| `/v1/schedule/admin/:id` | DELETE | Delete schedule item | id | status/object | DB delete |
| `/v1/reports/dashboard` | GET | Dashboard report | flags query | aggregate payload | none |
| `/v1/reports/bookings.csv` | GET | Bookings CSV export | `from,to` | CSV stream | none |
| `/v1/reports/finance/summary` | GET | Finance summary | `DateRangeQueryDto` | aggregate payload | none |
| `/v1/reports/payments.csv` | GET | Payments CSV export | `DateRangeQueryDto` | CSV stream | none |
| `/v1/reports/gift-credits.csv` | GET | Gift credits CSV export | `DateRangeQueryDto` | CSV stream | none |
| `/v1/reports/coach/analytics` | GET | Coach analytics | `CoachAnalyticsQueryDto` | analytics payload | none |
| `/v1/reports/user/analytics` | GET | User analytics | `UserAnalyticsQueryDto` | analytics payload | none |
| `/v1/notifications/admin/broadcast` | POST | Send/schedule broadcast | `BroadcastDto` | send/schedule result | Sends email(s), writes audit logs |
| `/v1/notifications/admin/stats` | GET | Notification admin stats | none | stats payload | none |
| `/v1/notifications/admin/deliveries` | GET | Delivery history | none | delivery rows | none |
| `/v1/notifications/admin/analytics` | GET | Campaign analytics | `days?` | analytics payload | none |
| `/v1/notifications/admin/scheduled` | GET | Scheduled broadcasts | none | schedule list | none |
| `/v1/notifications/admin/scheduled/:id` | PATCH | Update scheduled broadcast | `UpdateScheduledBroadcastDto` | `{ok:true}` | Writes audit log |
| `/v1/notifications/admin/scheduled/:id` | DELETE | Cancel scheduled broadcast | id | `{ok:true}` | Writes audit log |

---

## 6) Authentication logic

### How login works
- API login endpoint: `POST /v1/auth/login` (`apps/api/src/auth/auth.controller.ts`).
- Controller calls `AuthService.login()` (`apps/api/src/auth/auth.service.ts`).
- On success:
  - returns user + access token
  - sets httpOnly cookie `ommm_access` (from `ACCESS_TOKEN_COOKIE`)
  - cookie options include `sameSite=lax`, `secure` only in production.

### Google login
- Start: `GET /v1/auth/google`
  - Generates Google auth URL + random state
  - Stores state in cookie `ommm_oauth_state`.
- Callback: `GET /v1/auth/google/callback`
  - Verifies state + code
  - Fetches/validates Google ID token and profile
  - Links existing user by email or creates new `USER`
  - Issues app JWT, sets `ommm_access`, redirects to web app.
- Main implementation: `apps/api/src/auth/google-oauth.service.ts`.

### Password login
- Password hashing and verification:
  - Hash new passwords with bcrypt (`hashPassword`)
  - Verify legacy argon2 hashes (`verifyPassword`) and migrate on login.
- File: `apps/api/src/common/password-crypto.ts`.

### Auth config location
- JWT module and secret configuration:
  - `apps/api/src/auth/auth.module.ts`
  - `JWT_SECRET` via `getOrThrow`
  - `JWT_EXPIRES_SEC` optional override.
- JWT strategy:
  - `apps/api/src/auth/jwt.strategy.ts`
  - reads token from cookie first, then Bearer token.

### Sessions/tokens handling
- Token type: JWT access token signed by Nest JWT service.
- Transport:
  - Web: httpOnly cookie (`ommm_access`)
  - Mobile/API clients: Bearer token supported by strategy.
- Email/reset token model:
  - `AuthToken` table with hashed opaque token (`EMAIL_VERIFY`, `PASSWORD_RESET`)
  - created/validated in `AuthService`.

### Roles/permissions
- API role checks:
  - `@Roles(...)` decorator + `RolesGuard`.
- API authentication:
  - `JwtAuthGuard` on protected endpoints.
- Web section role gating:
  - `apps/web/src/server/require-role-layout.ts`.
- Role->dashboard route mapping:
  - `apps/web/src/lib/dashboard-nav.ts`
  - `apps/web/src/lib/role-home.ts`.

---

## 7) Database structure

### Main models/tables
- Core identity/auth:
  - `User`, `AuthToken`, `OAuthAccount`, `PushDeviceToken`, `NotificationPreference`
- Studio/classes:
  - `CoachProfile`, `CoachAvailabilitySlot`, `ClassType`, `ClassSession`, `ScheduleItem`, `StudioSettings`
- Booking/waitlist:
  - `Booking`, `BookingNote`, `WaitlistEntry`, `ClassReminderSendLog`
- Membership/payments:
  - `MembershipPlan`, `UserMembership`, `Payment`, `GiftCard`
- Content:
  - `ContentPost`
- CRM/meta:
  - `ContactMessage`, `ClientNote`, `AuditLog`
- Progress/gamification:
  - `Achievement`, `UserAchievement`

### Relationships (high level)
- `User` has many `Booking`, `WaitlistEntry`, `UserMembership`, `Payment`, gift cards, tokens, notes.
- `CoachProfile` belongs to `User`; `ClassSession` belongs to `CoachProfile` + `ClassType`.
- `Booking` links `User` <-> `ClassSession`.
- `WaitlistEntry` links `User` <-> `ClassSession`.
- `UserMembership` links `User` <-> `MembershipPlan`.
- `GiftCard` links purchaser user and optional recipient user.

### Important fields
- `User.role` for RBAC.
- `User.locale` for per-user UI locale.
- `User.stripeCustomerId`, `MembershipPlan.stripePriceId`, `UserMembership.stripeSubscriptionId`, `Payment.stripePaymentId`.
- `ClassSession.capacity/status/startsAt/endsAt` for booking constraints.
- `WaitlistEntry.status/position/offerExpiresAt` for waitlist mechanics.
- `AuditLog` stores notification scheduling lifecycle and audit events.

### Seed/admin creation logic
- Seed file: `packages/database/prisma/seed.ts`
  - Creates one demo user per role.
  - Creates baseline coach profile, studio settings, membership plan, class type/session, and sample content.
- Admin demo user: `admin@ommm.local`.
- Production admin bootstrap process outside seed -> **Needs verification**.

### Migration logic
- Prisma migrations in `packages/database/prisma/migrations`.
- Migration commands in `packages/database/package.json`:
  - `migrate:dev`
  - `migrate:deploy`
  - `db:push`
  - `seed`.

---

## 8) Payment flow

### How payment starts
- Checkout endpoints in `apps/api/src/payments/payments.controller.ts`:
  - membership checkout
  - gift checkout
  - drop-in checkout
- Service creates Stripe checkout session URLs in `apps/api/src/payments/payments.service.ts`.

### Success/failure/callback
- Success/cancel URLs are included in Stripe checkout session creation and point to web routes.
- Stripe callback endpoint:
  - `POST /v1/payments/webhook`
  - Requires raw body + `stripe-signature`.

### Payment status update
- Webhook handler dispatches by metadata `type`:
  - `membership` -> create `UserMembership` + `Payment`
  - `gift` -> create `GiftCard`, optionally send recipient email
  - `dropin` -> create `Payment`, create booking if absent, update class status if full
- Idempotency checks are done by querying existing `stripePaymentId` records.

### Responsible files
- `apps/api/src/payments/payments.controller.ts`
- `apps/api/src/payments/payments.service.ts`
- Related models in `packages/database/prisma/schema.prisma`.

Notes:
- If `STRIPE_SECRET_KEY` is not configured, checkout endpoints return unavailable (service guard).
- Additional payment docs exist in docs reference tree but active backend wiring is Stripe.

---

## 9) Email/notification flow

### When emails are sent
- Auth:
  - Verify email after registration
  - Password reset request
- Waitlist:
  - Offer notifications
  - Manual notification from admin/manager
- Gift cards:
  - Recipient delivery/resend
- Notifications module:
  - Broadcast emails (immediate or scheduled)
  - Class reminders (cron)

### Which files handle emails
- Transport abstraction:
  - `apps/api/src/mail/mail.service.ts`
- Email-triggering modules:
  - `apps/api/src/auth/auth.service.ts`
  - `apps/api/src/waitlist/waitlist.service.ts`
  - `apps/api/src/gift-cards/gift-cards.service.ts`
  - `apps/api/src/notifications/notifications.service.ts`

### Environment variables used
- Core mail vars:
  - `MAIL_TRANSPORT`, `RESEND_API_KEY`, `RESEND_FROM`
- Contextual URLs:
  - `WEB_APP_URL`
- Reminder/batch toggles:
  - `ENABLE_BACKGROUND_REMINDERS`
  - `ENABLE_WAITLIST_BACKGROUND_JOBS`

---

## 10) Environment variables (safe table)

Legend:
- Required = required for baseline app startup or that feature to function.
- Optional = can be omitted with fallback/degraded behavior.

| Variable name | Purpose | Required/optional | Where used |
|---|---|---|---|
| `NODE_ENV` | runtime mode, secure cookie/log behavior | Optional | API app/module/mail/auth controllers, CORS |
| `PORT` | API listen port | Optional | `apps/api/src/main.ts` |
| `API_LISTEN_HOST` | API bind host | Optional | `apps/api/src/main.ts` |
| `LOG_LEVEL` | pino log level | Optional | `apps/api/src/app.module.ts` |
| `DATABASE_URL` | Prisma datasource URL | Required for DB features | `packages/database/prisma/schema.prisma` |
| `DIRECT_URL` | Prisma direct URL (migrations/direct access) | Required for migration workflows | `packages/database/prisma/schema.prisma` |
| `JWT_SECRET` | JWT signing secret | Required | `apps/api/src/auth/auth.module.ts`, `jwt.strategy.ts` |
| `JWT_EXPIRES_SEC` | JWT expiry override | Optional | `apps/api/src/auth/auth.module.ts` |
| `WEB_APP_URL` | frontend origin for redirects/emails/cors/payments | Required for correct prod links | auth, payments, waitlist, gift-cards, cors |
| `CORS_ORIGINS` | extra allowed CORS origins | Optional | `apps/api/src/cors-origin.ts` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional (required for Google login) | `apps/api/src/auth/google-oauth.service.ts` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional (required for Google login) | `apps/api/src/auth/google-oauth.service.ts` |
| `GOOGLE_CALLBACK_URL` | Google callback URL | Optional (required for Google login) | `apps/api/src/auth/google-oauth.service.ts` |
| `STRIPE_SECRET_KEY` | Stripe API key | Optional (required for checkout) | `apps/api/src/payments/payments.service.ts` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | Optional (required for webhook fulfillment) | `apps/api/src/payments/payments.service.ts` |
| `STRIPE_CURRENCY` | Stripe default currency | Optional | `apps/api/src/payments/payments.service.ts` |
| `MAIL_TRANSPORT` | email transport selection | Optional | `apps/api/src/mail/mail.service.ts` |
| `RESEND_API_KEY` | Resend auth key | Optional (required when sending via Resend) | `apps/api/src/mail/mail.service.ts` |
| `RESEND_FROM` | email from header | Optional | `apps/api/src/mail/mail.service.ts` |
| `RESEND_FROM_EMAIL` | documented sender email key | Needs verification | `.env.example`, deploy doc (direct API usage not found) |
| `ENABLE_BACKGROUND_REMINDERS` | toggle reminder cron | Optional | `apps/api/src/notifications/notifications.service.ts` |
| `ENABLE_WAITLIST_BACKGROUND_JOBS` | toggle waitlist cron | Optional | `apps/api/src/waitlist/waitlist.service.ts` |
| `UPLOAD_DIR` | local upload root path | Optional | `apps/api/src/users/users.service.ts` |
| `R2_HOME_IMAGE_REQUIRED` | force R2 for home images | Optional | `apps/api/src/users/users.service.ts` |
| `R2_BUCKET_NAME` | R2 bucket name | Optional (required for R2 mode) | `apps/api/src/storage/r2-home-image.storage.ts` |
| `R2_ACCESS_KEY_ID` | R2 S3 access key | Optional (required for R2 mode) | `apps/api/src/storage/r2-home-image.storage.ts` |
| `R2_SECRET_ACCESS_KEY` | R2 S3 secret key | Optional (required for R2 mode) | `apps/api/src/storage/r2-home-image.storage.ts` |
| `R2_PUBLIC_URL` | public asset base URL | Optional (required for R2 mode) | `apps/api/src/storage/r2-home-image.storage.ts`, web next config |
| `R2_S3_ENDPOINT` | explicit R2 S3 endpoint | Optional (or `R2_ACCOUNT_ID`) | `apps/api/src/storage/r2-home-image.storage.ts` |
| `R2_ACCOUNT_ID` | fallback to construct S3 endpoint | Optional (or `R2_S3_ENDPOINT`) | `apps/api/src/storage/r2-home-image.storage.ts` |
| `R2_API_TOKEN` | documented but not used in upload service | Needs verification | `.env.example`, deploy doc |
| `NEXT_PUBLIC_SITE_URL` | web site base URL for server-side API helper | Optional | `apps/web/src/lib/server-api.ts` |
| `NEXT_PUBLIC_API_URL` | browser-visible API base URL | Optional (required in some deployments) | login/register pages, asset URL resolver |
| `API_INTERNAL_URL` | server-side web rewrite destination | Optional | `apps/web/next.config.ts`, asset resolver |
| `NEXT_ALLOWED_DEV_ORIGINS` | extra allowed dev origins | Optional | `apps/web/next.config.ts` |
| `WEB_E2E_PORT` | Playwright web server port | Optional | `apps/web/playwright.config.ts` |
| `EXPO_PUBLIC_API_URL` | mobile API base URL | Required for production mobile builds | `apps/mobile/src/lib/api/config.ts` |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Expo push project id (mobile) | Optional/feature dependent | `apps/mobile/src/auth/tryRegisterExpoPushToken.ts` |
| `EXPO_ACCESS_TOKEN` | Expo push access token (API) | Optional/feature dependent | `apps/api/src/notifications/expo-push.service.ts` |
| `APP_URL` | present in env example | Needs verification (not used in scanned runtime code) | `.env.example` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Needs verification | `.env.example`, deploy doc |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Needs verification | `.env.example`, deploy doc |
| `DATABASE_CONNECTION_LIMIT` | documented DB setting | Needs verification (runtime code usage not found) | `.env.example`, deploy doc |
| `DATABASE_POOL_TIMEOUT` | documented DB setting | Needs verification (runtime code usage not found) | `.env.example`, deploy doc |
| `FIGMA_ACCESS_TOKEN` | local tooling/MCP context | Optional | `.env.example`, deploy doc |

Never store real secret values in docs or code.

---

## 11) UI structure

### Main layout
- App router root layouts:
  - `apps/web/src/app/layout.tsx`
  - `apps/web/src/app/[locale]/layout.tsx`
  - role/layout groups under `apps/web/src/app/[locale]/*/layout.tsx`
- Marketing and dashboard are separated by route groups.

### Shared components
- UI primitives and app-level classes are used from:
  - `apps/web/src/components/ui/*`
  - `apps/web/src/components/shell/*`
- Role-specific feature components are in:
  - `apps/web/src/components/account/*`
  - `apps/web/src/components/admin/*`
  - `apps/web/src/components/marketing/*`
  - `apps/web/src/components/coach/*`

### Styling approach
- Tailwind CSS v4 plus custom design tokens.
- Global styles and utility classes in:
  - `apps/web/src/app/globals.css`
  - `apps/web/src/styles/tokens.css`
- Theme uses custom CSS variables (`--color-*`, gradients, typography tokens).

### Responsive logic
- Tailwind responsive classes are heavily used.
- Locale handling + middleware-driven routing in `apps/web/middleware.ts`.
- Mobile-specific app has separate responsive/runtime handling in Expo screens.

### Buttons, forms, modals, cards
- Reusable utility classes in `globals.css`:
  - Button patterns: `app-btn-primary`, `app-btn-secondary`, `ommm-cta-*`, `ommm-btn-compact-*`
  - Form controls: `app-input`, `ommm-input`, `app-label`, `ommm-label`
  - Card/layout styles: `app-surface-card`, `ommm-card`, `ommm-account-section`, `ommm-list-row`
- Component implementation details vary by feature module; design primitives are centralized through these classes and shared components.

---

## 12) Risky areas (change carefully)

- **Auth and session cookies**
  - Cookie + JWT strategy + web server-side auth are tightly coupled.
  - Files: `apps/api/src/auth/*`, `apps/web/src/server/require-role-layout.ts`.
- **Role authorization**
  - Role guard coverage differs per endpoint; accidental changes can leak access.
  - Files: controllers with `@Roles`, `roles.guard.ts`.
- **Payments + webhook idempotency**
  - Checkout metadata/webhook processing must stay consistent.
  - Files: `apps/api/src/payments/payments.service.ts`.
- **Waitlist and booking concurrency**
  - Offer/promote/full-capacity transitions involve multiple modules and cron jobs.
  - Files: `waitlist.service.ts`, `bookings.service.ts`, `classes.service.ts`.
- **Notifications scheduling**
  - Scheduled broadcasts are persisted via `AuditLog` action conventions, not a dedicated table.
  - Files: `apps/api/src/notifications/notifications.service.ts`.
- **Database schema changes**
  - Many modules depend on shared models and enum values.
  - Files: `packages/database/prisma/schema.prisma`, migrations.
- **Upload/storage mode transitions**
  - Local path vs R2 public URL logic affects user profile media.
  - Files: `users.service.ts`, `r2-home-image.storage.ts`, `next.config.ts`.
- **Environment variable drift**
  - `.env.example`, deployment docs, and runtime usage are not fully symmetric.
  - Variables marked "Needs verification" should be confirmed before cleanup.
- **Duplicate/legacy route behavior**
  - Next redirects keep backward compatibility (`/account/*` -> `/user/*`).
  - File: `apps/web/next.config.ts`.

---

## 13) Future task instructions

### Which files should be checked first
- For auth/session issues:
  - `apps/api/src/auth/*`
  - `apps/api/src/common/guards/*`
  - `apps/web/src/server/require-role-layout.ts`
  - `apps/web/middleware.ts`
- For API behavior:
  - Controller (`*.controller.ts`) + corresponding service (`*.service.ts`) in the same module.
- For DB-related tasks:
  - `packages/database/prisma/schema.prisma`
  - relevant migration files
  - `packages/database/prisma/seed.ts` if role/demo data is involved.
- For payment/email:
  - `apps/api/src/payments/*`
  - `apps/api/src/mail/*`
  - `apps/api/src/notifications/*`
- For web route/UI tasks:
  - matching file in `apps/web/src/app/[locale]/...`
  - related components in `apps/web/src/components/...`
  - shared styles in `globals.css` / `tokens.css`.

### Areas not to touch without explicit instruction
- Auth token/cookie semantics and JWT secret usage.
- Stripe webhook flow and payment fulfillment logic.
- Prisma schema enums and role model semantics.
- Role guard declarations on protected endpoints.
- Global middleware locale redirection and route rewrites.
- Upload/storage fallback behavior (R2 vs local).

### How to avoid breaking existing logic
- Keep route contracts and DTO validation shapes backward compatible unless migration is requested.
- Preserve API prefix (`/v1`) and existing web rewrite assumptions (`/api/v1/*` proxy).
- For sensitive changes, trace end-to-end flow: page -> web API helper -> controller -> service -> DB model.
- For payment/auth/cron paths, require explicit regression checks in dev/staging before release.
- Confirm env requirements before deploy changes; do not remove "unused" vars without verification.

### Commands for dev/build/lint/test (from package.json files)

#### Root (`package.json`)
- `pnpm run dev`
- `pnpm run dev:web`
- `pnpm run dev:api`
- `pnpm run dev:mobile`
- `pnpm run build`
- `pnpm run build:web`
- `pnpm run build:api`
- `pnpm run build:database`
- `pnpm run db:generate`
- `pnpm run setup`
- `pnpm run test`
- `pnpm run test:e2e:web`

#### Web (`apps/web/package.json`)
- `pnpm --filter web dev`
- `pnpm --filter web build`
- `pnpm --filter web start`
- `pnpm --filter web lint`
- `pnpm --filter web test:e2e`

#### API (`apps/api/package.json`)
- `pnpm --filter api dev`
- `pnpm --filter api build`
- `pnpm --filter api start`
- `pnpm --filter api start:prod`
- `pnpm --filter api lint`
- `pnpm --filter api test`
- `pnpm --filter api test:e2e`

#### Database (`packages/database/package.json`)
- `pnpm --filter @ommm/database run build`
- `pnpm --filter @ommm/database run generate`
- `pnpm --filter @ommm/database run migrate:dev`
- `pnpm --filter @ommm/database run migrate:deploy`
- `pnpm --filter @ommm/database run db:push`
- `pnpm --filter @ommm/database run seed`

#### Mobile (`apps/mobile/package.json`)
- `pnpm --filter mobile dev`
- `pnpm --filter mobile android`
- `pnpm --filter mobile ios`
- `pnpm --filter mobile web`

---

## Unclear items flagged during analysis

- `docs/BRIEF.md` appears template-like and does not provide finalized product narrative -> **Needs verification**.
- Runtime usage of `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` not found in scanned code -> **Needs verification**.
- Runtime usage of `DATABASE_CONNECTION_LIMIT` and `DATABASE_POOL_TIMEOUT` not found in scanned code -> **Needs verification**.
- `APP_URL` appears in env contract but not in scanned runtime code -> **Needs verification**.
- Production admin provisioning process beyond seed script -> **Needs verification**.

