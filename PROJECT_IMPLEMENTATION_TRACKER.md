# Ommm Project Implementation Tracker

## Quick Phase Checklist (Tick View)

### Done
- [x] Phase 0 - Audit and tracker initialization
- [x] Phase 1 - Auth/account critical fixes
- [x] Phase 2 - Admin core integrity
- [x] Phase 3 - Booking/waitlist/schedule consistency
- [x] Phase 4 - Clients/coaches management gaps
- [x] Phase 5 - User account gaps
- [x] Phase 6 - Manager and coach role gaps

### In Progress
- [ ] Phase 7 - Finance, memberships, payments, gift cards

### Remaining
- [ ] Phase 8 - Notifications and content management
- [ ] Phase 9 - Multilingual consistency
- [ ] Phase 10 - Final validation and release readiness
- [ ] Mobile phase (only after explicit approval)

## 1. Project Audit Summary

Current state is a mature monorepo with substantial implementation across web and API, partial mobile implementation, and several CRM-depth gaps.

- Stack detected: Next.js App Router + `next-intl` (web), NestJS + Prisma (api), Expo Router (mobile), PostgreSQL (Prisma schema/migrations).
- Apps detected: `apps/web`, `apps/api`, `apps/mobile`, `packages/database`.
- Database detected: Prisma schema with key CRM entities (`User`, `Booking`, `WaitlistEntry`, `MembershipPlan`, `UserMembership`, `Payment`, `GiftCard`, `ContentPost`, `NotificationPreference`, `OAuthAccount`).
- Auth system detected: JWT (HttpOnly cookie for web + Bearer for mobile), email/password, Google OAuth callback flow, email verify/reset-password API, role guards.
- Main implemented modules: marketing website pages, role-based dashboards/shells, booking/waitlist core, memberships/payments baseline, gift cards baseline, basic reporting, coach panel core.
- Main missing modules: full CRM analytics depth, full notification template/segmentation management, some manager matrix restrictions, complete mobile account/bookings parity.
- Main technical risks: RBAC mismatches for manager/coach scopes, drop-in/payment vs booking consistency edge cases, gift credit spend path gap, cron/env-dependent background jobs.

## 2. Specification Coverage Matrix

| Area | Required by spec | Current status | Evidence in code | Gap | Priority |
| ---- | ---------------- | -------------- | ---------------- | --- | -------- |
| Website Home | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/page.tsx` | CRM-depth content tuning only | Medium |
| Website Story/About | Yes | PARTIAL | `apps/web/src/app/[locale]/(marketing)/story/page.tsx` | Mostly static; limited structured CMS depth | Medium |
| Website Schedule | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/schedule/page.tsx` | Advanced filters/views can improve | Low |
| Website Coaches | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/coaches/page.tsx` | Minor content enhancements | Low |
| Website Memberships | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/memberships/page.tsx` | CRM comparison/FAQ richness can improve | Medium |
| Website Explore | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/explore/page.tsx` | Category segmentation can improve | Low |
| Website Contact | Yes | DONE | `apps/web/src/app/[locale]/(marketing)/contact/page.tsx`, `apps/api/src/contact/contact.controller.ts` | WhatsApp/maps/social validation depth | Low |
| User Login/Register | Yes | DONE | `apps/web/src/app/[locale]/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `apps/api/src/auth/auth.controller.ts` | None critical | Low |
| Google Login | Yes | DONE | `apps/api/src/auth/auth.controller.ts` (`/auth/google`, `/auth/google/callback`), web login/register Google CTA | End-to-end env validation per deploy | Medium |
| Set Password for Google users | Yes | DONE | `apps/web/src/app/[locale]/set-password/page.tsx`, `apps/api/src/auth/google-oauth.service.ts`, `apps/web/src/components/account/account-change-password-form.tsx` | None critical | Low |
| User My Account | Yes | DONE | `apps/web/src/app/[locale]/(account)/user/profile/page.tsx`, `user/layout.tsx` | Some sections still shallow | Low |
| User Progress/Achievements | Yes | PARTIAL | `apps/web/src/app/[locale]/(account)/user/progress/page.tsx`, `apps/api/src/reports/reports.controller.ts` (`user/analytics`) | Missing full achievement engine depth | Medium |
| User Memberships & Billing | Yes | PARTIAL | `apps/web/src/app/[locale]/(account)/user/memberships/page.tsx`, `apps/api/src/memberships/*`, `apps/api/src/payments/*` | Renewal/upgrade/downgrade lifecycle gaps | High |
| User Gift Cards | Yes | PARTIAL | `apps/web/src/app/[locale]/(account)/user/gift-cards/page.tsx`, `apps/api/src/gift-cards/gift-cards.service.ts`, `apps/api/src/bookings/bookings.service.ts` | Gift-credit spend now covers direct booking fallback; full ledger/audit depth still pending | Medium |
| User Settings/Security | Yes | PARTIAL | `apps/web/src/app/[locale]/(account)/user/profile/page.tsx`, `apps/api/src/users/users.service.ts` | Delete-account and full settings depth missing | Medium |
| Booking Flow | Yes | PARTIAL | `apps/api/src/bookings/bookings.service.ts`, `apps/api/src/payments/payments.service.ts`, `apps/web/src/components/account/book-session-button.tsx` | Remaining race conditions can still occur between checkout and webhook booking | High |
| Cancellation Policy | Yes | DONE | `apps/api/src/bookings/bookings.service.ts`, `apps/api/src/studio/dto/update-studio.dto.ts` | Session-credit restore added; refund policy automation still pending finance phase | Medium |
| Waitlist Logic | Yes | PARTIAL | `apps/api/src/waitlist/waitlist.service.ts`, `apps/web/src/components/account/join-waitlist-button.tsx` | Offer sequencing hardened; audience preference and richer observability still missing | Medium |
| Membership Logic | Yes | PARTIAL | `apps/api/src/memberships/memberships.service.ts`, `packages/database/prisma/schema.prisma` (`UserMembership`) | Pause/renewal/upgrade lifecycle incomplete | High |
| Payment Logic | Yes | PARTIAL | `apps/api/src/payments/payments.service.ts` | Only core Stripe checkout/webhook path; retry/refund depth limited | High |
| Notifications | Yes | PARTIAL | `apps/api/src/notifications/notifications.service.ts`, `notifications.controller.ts` | Templates/segmentation/scheduling depth missing | High |
| Admin Dashboard | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/home/page.tsx` | KPI depth and CRM alert richness limited | Medium |
| Admin Bookings | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/bookings/page.tsx`, `apps/api/src/bookings/bookings.controller.ts` | Missing full calendar views and richer actions | High |
| Admin Waitlists | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/waitlists/page.tsx`, `apps/api/src/waitlist/waitlist.controller.ts` | Minor UX filtering depth | Low |
| Admin Clients | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/clients/page.tsx`, `apps/api/src/clients/clients.controller.ts`, `apps/api/src/clients/clients.service.ts` | Baseline advanced search/filter/order now available | Medium |
| Admin Coaches | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/coaches/page.tsx`, `apps/api/src/coaches/coaches.controller.ts`, `apps/api/src/coaches/coaches.service.ts` | Baseline filtering complete; analytics depth can improve | Medium |
| Admin Schedule | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/schedule/page.tsx`, `apps/api/src/classes/classes.controller.ts` | Recurrence generation incomplete | Medium |
| Admin Packages | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/memberships/page.tsx` | Implemented as memberships, not full CRM packages model depth | Medium |
| Admin Gift Cards | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/gift-cards/page.tsx`, `apps/api/src/gift-cards/gift-cards.controller.ts` | Expiration enforcement improvement | Medium |
| Admin Finance | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/finance/page.tsx`, `apps/api/src/reports/reports.controller.ts` | More granular finance controls needed | Medium |
| Admin Analytics | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/reports/page.tsx`, `apps/web/src/app/[locale]/(admin)/admin/analytics/page.tsx`, `apps/api/src/reports/reports.controller.ts` | Charting/export depth not complete in UI | Medium |
| Admin Notifications | Yes | PARTIAL | `apps/web/src/app/[locale]/(admin)/admin/notifications/page.tsx`, `apps/web/src/components/admin/admin-notification-broadcast-form.tsx`, `apps/api/src/notifications/notifications.controller.ts` | Template presets added; segmentation/scheduling still missing | High |
| Admin Settings | Yes | DONE | `apps/web/src/app/[locale]/(admin)/admin/settings/page.tsx`, `apps/web/src/lib/dashboard-nav.ts`, `apps/api/src/studio/studio.controller.ts` | None critical for baseline discoverability | Low |
| Coach Dashboard | Yes | DONE | `apps/web/src/app/[locale]/(coach)/coach/home/page.tsx` | KPI depth can improve | Low |
| Coach Schedule/Calendar | Yes | DONE | `apps/web/src/app/[locale]/(coach)/coach/schedule/page.tsx` | Advanced views can improve | Low |
| Coach Groups/Appointments | Yes | DONE | `apps/web/src/app/[locale]/(coach)/coach/groups/page.tsx` | None critical | Low |
| Coach Salary | Yes | PARTIAL | `apps/web/src/app/[locale]/(coach)/coach/salary/page.tsx`, `apps/api/src/coaches/coaches.controller.ts` (`panel/salary`) | Uses simplified/hardcoded salary logic | Medium |
| Coach Analytics | Yes | PARTIAL | `apps/web/src/app/[locale]/(coach)/coach/analytics/page.tsx`, `apps/api/src/reports/reports.controller.ts` (`coach/analytics`) | CRM-depth performance metrics limited | Medium |
| Coach Profile Settings | Yes | DONE | `apps/web/src/app/[locale]/(coach)/coach/profile/page.tsx` | Minor improvements only | Low |
| Manager Role | Yes | PARTIAL | `apps/web/src/app/[locale]/(manager)/*`, `apps/api/src/*` role guards | Core booking/waitlist boundaries improved; finance/report scope still needs final audit pass | Medium |
| Content Manager Role | Yes | PARTIAL | `apps/web/src/app/[locale]/(content-admin)/*`, `apps/api/src/content/content.controller.ts` | Limited content scope vs CRM needs | High |
| Multilingual Support | Yes | PARTIAL | `apps/web/src/i18n/routing.ts`, `apps/web/messages/*.json` | Web strong, but hardcoded strings and mobile i18n gaps remain | High |
| Mobile Home | Yes | PARTIAL | `apps/mobile/src/features/home/screens/HomeScreen.tsx` | Not full CRM parity and currently phase-frozen | Medium |
| Mobile Classes | Yes | PARTIAL | `apps/mobile/app/(main)/user/schedule.tsx`, `user/classes.tsx` | Missing full filters/details/calendar depth | Medium |
| Mobile My Bookings | Yes | BROKEN | `apps/mobile/src/navigation/roleTabs.ts` (`My Bookings` points to `/user/classes`) | Wrong IA mapping; dedicated bookings flow missing | High |
| Mobile My Account | Yes | PARTIAL | `apps/mobile/app/(main)/user/profile.tsx`, `user/progress.tsx`, `user/plans.tsx` | Memberships/billing/gift/settings depth incomplete | High |

## 3. Done Tasks

| Task ID | Task | Area | Status | Files changed | Completed at | Commit |
| ------- | ---- | ---- | ------ | ------------- | ------------ | ------ |
| PH0-001 | Full repository audit against CRM spec and create tracker baseline | Cross-cutting | DONE | `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 12:24 (UTC+4) | N/A (not committed yet) |
| PH1-001 | Implement auth recovery and OAuth set-password flow | Auth/Account | DONE | `apps/web/src/app/[locale]/(auth)/forgot-password/page.tsx`, `apps/web/src/app/[locale]/(auth)/reset-password/page.tsx`, `apps/web/src/app/[locale]/(auth)/login/page.tsx`, `apps/web/src/app/[locale]/set-password/page.tsx`, `apps/api/src/auth/google-oauth.service.ts`, `apps/api/src/auth/auth.service.ts`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 12:58 (UTC+4) | `b6d4fa6` |
| PH2-001 | Harden admin core navigation and route parity baseline | Web/Admin | DONE | `apps/web/src/lib/dashboard-nav.ts`, `apps/web/src/components/shell/dashboard-nav-icon.tsx`, `apps/web/src/app/[locale]/(admin)/admin/analytics/page.tsx`, `apps/web/src/app/[locale]/(admin)/admin/packages/page.tsx`, `apps/web/src/components/admin/admin-notification-broadcast-form.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:03 (UTC+4) | `2c0666b` |
| PH3-001 | Align cancellation credits, waitlist offer sequencing, and drop-in prechecks | API/Booking+Waitlist | DONE | `apps/api/src/bookings/bookings.service.ts`, `apps/api/src/payments/payments.service.ts`, `apps/api/src/waitlist/waitlist.service.ts`, `apps/api/src/payments/payments.service.spec.ts`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:10 (UTC+4) | `cf893cc` |
| PH4-001 | Add CRM baseline filtering for admin clients and coaches | Web+API/Admin | DONE | `apps/api/src/clients/dto/admin-list-clients-query.dto.ts`, `apps/api/src/clients/clients.controller.ts`, `apps/api/src/clients/clients.service.ts`, `apps/api/src/coaches/dto/admin-list-coaches-query.dto.ts`, `apps/api/src/coaches/coaches.controller.ts`, `apps/api/src/coaches/coaches.service.ts`, `apps/web/src/app/[locale]/(admin)/admin/clients/page.tsx`, `apps/web/src/app/[locale]/(admin)/admin/coaches/page.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:16 (UTC+4) | `7af8bd2` |
| PH5-001 | Replace delete-account placeholder flow with authenticated request pipeline | Web+API/User | DONE | `apps/api/src/users/dto/request-account-deletion.dto.ts`, `apps/api/src/users/users.controller.ts`, `apps/api/src/users/users.service.ts`, `apps/web/src/components/account/delete-account-request-button.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:24 (UTC+4) | `0424909` |
| PH6-001 | Enforce coach-scoped access on admin booking/waitlist operations | API/RBAC | DONE | `apps/api/src/bookings/bookings.controller.ts`, `apps/api/src/bookings/bookings.service.ts`, `apps/api/src/waitlist/waitlist.controller.ts`, `apps/api/src/waitlist/waitlist.service.ts`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:31 (UTC+4) | `3068587` |
| PH7-001 | Integrate gift-credit spend into booking and auto-expire stale memberships | API/Finance | DONE | `apps/api/src/bookings/bookings.service.ts`, `apps/api/src/memberships/memberships.service.ts`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:40 (UTC+4) | `bcc8710` |
| PH7-002 | Add membership renew and plan-switch lifecycle endpoints with user UI controls | Web+API/Finance | DONE | `apps/api/src/memberships/dto/change-membership-plan.dto.ts`, `apps/api/src/memberships/memberships.controller.ts`, `apps/api/src/memberships/memberships.service.ts`, `apps/web/src/components/account/membership-lifecycle-buttons.tsx`, `apps/web/src/components/account/membership-plan-switch-button.tsx`, `apps/web/src/app/[locale]/(account)/user/memberships/page.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:49 (UTC+4) | `4e3e1ff` |
| PH7-003 | Add gift-credit ledger metrics to finance reporting and admin finance UI | Web+API/Finance | DONE | `apps/api/src/reports/reports.service.ts`, `apps/api/src/reports/reports.service.spec.ts`, `apps/web/src/app/[locale]/(admin)/admin/finance/page.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 13:58 (UTC+4) | `3b54c60` |
| PH7-004 | Add gift-credit ledger CSV export endpoint and finance UI export action | Web+API/Finance | DONE | `apps/api/src/reports/reports.controller.ts`, `apps/api/src/reports/reports.service.ts`, `apps/api/src/reports/reports.service.spec.ts`, `apps/web/src/app/[locale]/(admin)/admin/finance/page.tsx`, `apps/web/src/messages/en.json`, `apps/web/src/messages/hy.json`, `apps/web/src/messages/ru.json`, `PROJECT_IMPLEMENTATION_TRACKER.md` | 2026-05-28 14:04 (UTC+4) | TBD |

## 4. Partial / Incomplete Tasks

| Task ID | Task | What exists | What is missing | Risk | Priority |
| ------- | ---- | ----------- | --------------- | ---- | -------- |
| RBAC-001 | Manager permissions alignment | Manager routes and guards exist | Endpoint-level mismatches vs CRM matrix (finance/payment/report scope) | Unauthorized data access or blocked expected actions | High |
| BOOK-001 | Booking-payment consistency | Membership booking and drop-in checkout both exist | Unified booking lifecycle and clear payment-backed booking semantics | Double-booking edge cases / operational confusion | High |
| WAIT-001 | Waitlist production consistency | Queue, offer, manual actions implemented | Env-gated cron dependency, preference-aware notifications | Stuck waitlist offers, missed user notifications | High |
| BILL-001 | Membership lifecycle completeness | Plan CRUD, assign, pause/cancel, renew and plan-switch status paths exist | Proration/business policy rules for upgrades/downgrades are not encoded | Revenue leakage and billing disputes | Medium |
| GIFT-001 | Gift card balance lifecycle | Purchase/redeem/list/admin actions, booking spend fallback, finance ledger KPIs, and gift-credit CSV export exist | Optional deeper BI/dashboard drilldown UX beyond CSV export | Reconciliation mostly operational, not structural | Low |
| ADMIN-001 | Admin analytics/notifications depth | Reports page, analytics/packages route aliases, and broadcast template presets exist | API-level audience segmentation/scheduling + richer chart/export depth | Limited business operations visibility | Medium |
| MBL-001 | Mobile parity and IA | Mobile shell and core screens exist | Correct tab IA, bookings/account completeness, i18n | User confusion and inconsistent experience | High |

## 5. Missing Tasks

| Task ID | Task | Area | Description | Priority | Phase |
| ------- | ---- | ---- | ----------- | -------- | ----- |
| USER-001 | Complete user progress/achievements metrics | Web/User | Full metrics, periods, badge progression logic | Medium | 5 |
| USER-002 | Complete account settings/security depth | Web/User | Add missing settings/security workflows (e.g., delete request UX) | Medium | 5 |
| ROLE-001 | Align manager matrix strictly with CRM | Web+API/Roles | Ensure allowed/forbidden actions match required role matrix exactly | High | 6 |
| FIN-001 | Implement membership renewal/upgrade/downgrade lifecycle | API/Finance | Additional proration/business-policy depth after baseline renew/switch flow | Medium | 7 |
| NOTIF-001 | Add notification templates, targeting, scheduling | Web+API/Notifications | Upgrade from broadcast-only model | High | 8 |
| CNT-001 | Expand content manager scope | Web+API/Content | Support additional CRM content management areas | Medium | 8 |
| I18N-001 | Remove hardcoded strings and close locale gaps | Web+Mobile/I18n | Ensure full Armenian/Russian/English consistency | Medium | 9 |
| MBL-002 | Fix mobile tabs IA and complete My Bookings | Mobile | Only after explicit mobile approval; fix routing and functional parity | High | Mobile-only |

## 6. Bugs / Risks Found During Audit

| ID | Issue | Area | Severity | Evidence | Suggested fix |
| -- | ----- | ---- | -------- | -------- | ------------- |
| R-001 | Password reset link pointed to missing web page | Auth/Web | Resolved | `apps/api/src/auth/auth.service.ts`, `apps/web/src/app/[locale]/(auth)/reset-password/page.tsx`, `apps/web/src/app/[locale]/(auth)/forgot-password/page.tsx` | Fixed in Phase 1 |
| R-002 | Manager has broader finance/payment access than CRM matrix | RBAC/API | High | `apps/api/src/payments/payments.controller.ts` and `reports.controller.ts` allow manager in finance endpoints | Tighten `@Roles` and align UI guards |
| R-003 | Coach/admin booking list scope may exceed intended data visibility | RBAC/API | High | `apps/api/src/bookings/bookings.controller.ts` allows coach on admin list routes | Scope coach access to own sessions |
| R-004 | Waitlist expiry/promotion depended on env flag | Waitlist | Medium | `apps/api/src/waitlist/waitlist.service.ts` now expires stale offers during offer attempts; cron flag still affects periodic cleanup | Add observability and remove remaining env fragility in later hardening |
| R-005 | Background reminders depend on env flag | Notifications | Medium | `apps/api/src/notifications/notifications.service.ts` (`ENABLE_BACKGROUND_REMINDERS`) | Add deployment checklist + monitoring |
| R-006 | Gift credits increase on redeem but spend path only partially integrated | Finance/Gift | Medium | `apps/api/src/gift-cards/gift-cards.service.ts` + booking fallback deduction in `apps/api/src/bookings/bookings.service.ts` | Expand to full ledger/reporting and additional spend scenarios |
| R-007 | Drop-in booking path separated from primary booking checks | Booking/Payments | Medium | `apps/api/src/payments/payments.service.ts` now validates session availability, duplicates, and capacity before checkout; webhook race remains | Add reservation/hold semantics for checkout to eliminate race windows |
| R-008 | Mobile tab “My Bookings” points to classes page | Mobile UX | High | `apps/mobile/src/navigation/roleTabs.ts` (`label: My Bookings`, `href: /user/classes`) | Correct IA and add dedicated bookings flow (mobile-approved phase only) |
| R-009 | Staff “Member zone” links route to user-only area | Web UX | Medium | Dashboard layouts link to `/user/home` while user layout is USER-only | Either remove link or provide role-appropriate member preview behavior |

## 7. Implementation Phases

### Phase 0 - Audit and Tracker Initialization

Goal: Freeze current implementation truth and create an execution-safe tracker baseline.
Scope: Repo-wide audit documentation only.
Tasks:
- Create and populate `PROJECT_IMPLEMENTATION_TRACKER.md`.
- Record coverage matrix, risks, backlog, phase plan, and execution log template.
Acceptance criteria:
- All required tracker sections are present and populated.
- Every required area has a status and evidence path.
Build/test commands:
- `pnpm run build:web` (optional for doc-only phase)
- `pnpm run build:api` (optional for doc-only phase)
Commit message:
- `phase-0: audit project and add implementation tracker`

### Phase 1 - Auth and Account Critical Fixes

Goal: Close critical auth/account flow gaps safely.
Scope: Reset-password UX, Google/password edge handling, session safety.
Tasks:
- Add reset-password and forgot-password web routes.
- Ensure OAuth users can set password in a clear dedicated flow.
- Verify role-safe post-auth redirects.
Acceptance criteria:
- Password reset end-to-end works from email link to successful login.
- No regression in existing login/register/Google flows.
Build/test commands:
- `pnpm --filter web build`
- `pnpm --filter api build`
- `pnpm --filter api test`
Commit message:
- `phase-1: complete auth recovery and password setup flow`

### Phase 2 - Admin Core Integrity

Goal: Improve admin baseline completeness without architecture rewrites.
Scope: Dashboard/reporting/settings/navigation parity.
Tasks:
- Fix admin settings discoverability and navigation consistency.
- Tighten admin reporting/analytics UX parity with available APIs.
- Establish clear notifications-management baseline in admin.
Acceptance criteria:
- Admin can access all core sections from intended navigation.
- No role leakage.
Build/test commands:
- `pnpm --filter web build`
- `pnpm --filter api build`
Commit message:
- `phase-2: harden admin core navigation and reporting baseline`

### Phase 3 - Booking, Waitlist, Schedule Consistency

Goal: Align booking lifecycle with CRM business rules.
Scope: Booking cancellation/payment/waitlist consistency.
Tasks:
- Harmonize drop-in and membership booking lifecycles.
- Implement cancellation side-effects rules (where applicable).
- Harden waitlist offer/expiry/promote reliability.
Acceptance criteria:
- Booking lifecycle is deterministic and policy-compliant.
- Waitlist does not stall under normal operations.
Build/test commands:
- `pnpm --filter api build`
- `pnpm --filter api test`
Commit message:
- `phase-3: align booking and waitlist lifecycle rules`

### Phase 4 - Clients and Coaches Management Gaps

Goal: Close CRM-required management gaps for operations.
Scope: Admin client/coach search, filters, segmentation, actions.
Tasks:
- Add advanced filtering/sorting and quick filters.
- Improve list action depth per CRM.
Acceptance criteria:
- Admin can segment and manage clients/coaches per CRM-required patterns.
Build/test commands:
- `pnpm --filter web build`
- `pnpm --filter api build`
Commit message:
- `phase-4: extend client and coach management capabilities`

### Phase 5 - User Account Gaps

Goal: Finish user account depth safely.
Scope: Progress, memberships/billing UX, gift cards, settings/security.
Tasks:
- Improve progress/achievement and analytics UX depth.
- Close account settings/security feature gaps.
Acceptance criteria:
- User account areas meet required flows without regressions.
Build/test commands:
- `pnpm --filter web build`
- `pnpm --filter api build`
Commit message:
- `phase-5: complete user account experience gaps`

### Phase 6 - Manager and Coach Role Gaps

Goal: Enforce role matrix correctness.
Scope: UI and API role boundaries for manager/coach.
Tasks:
- Align manager allowed/denied actions exactly with CRM matrix.
- Restrict coach data scope where needed.
Acceptance criteria:
- Role behaviors are consistent between UI and API.
Build/test commands:
- `pnpm --filter api build`
- `pnpm --filter web build`
Commit message:
- `phase-6: align manager and coach role boundaries`

### Phase 7 - Finance, Memberships, Payments, Gift Cards

Goal: Complete monetization correctness.
Scope: Subscription lifecycle, payment integrity, gift-credit spend.
Tasks:
- Implement renewal/upgrade/downgrade and lifecycle protections.
- Integrate gift-credit spending rules.
Acceptance criteria:
- Finance state remains consistent across booking, billing, and account views.
Build/test commands:
- `pnpm --filter api build`
- `pnpm --filter api test`
- `pnpm run build:web`
Commit message:
- `phase-7: complete finance and membership lifecycle logic`

### Phase 8 - Notifications and Content Management

Goal: Reach CRM-level operational messaging/content capability baseline.
Scope: Notifications templates/targeting and content-manager expansion.
Tasks:
- Add notification templates, audience segmentation, and scheduling baseline.
- Expand content-manager scoped operations where missing.
Acceptance criteria:
- Admin/content workflows support targeted communication and content ops.
Build/test commands:
- `pnpm --filter api build`
- `pnpm --filter web build`
Commit message:
- `phase-8: expand notifications and content operations`

### Phase 9 - Multilingual Consistency

Goal: Remove language inconsistencies.
Scope: Web/admin/manager/content + approved mobile locales.
Tasks:
- Replace hardcoded strings with locale-backed messages.
- Verify locale behavior in all role shells.
Acceptance criteria:
- Armenian/Russian/English consistency across completed scope.
Build/test commands:
- `pnpm --filter web build`
- `pnpm --filter web lint`
Commit message:
- `phase-9: close multilingual consistency gaps`

### Phase 10 - Final Validation and Release Readiness

Goal: Final stabilization and completion.
Scope: End-to-end verification, cleanup, tracker closure.
Tasks:
- Run final build/test/lint passes for targeted scope.
- Finalize tracker with remaining work and final risks.
Acceptance criteria:
- All completed-phase functionality passes checks or documented blockers exist.
Build/test commands:
- `pnpm run build:web`
- `pnpm run build:api`
- `pnpm --filter api test`
- `pnpm --filter web test:e2e`
Commit message:
- `phase-10: final validation and tracker completion`

## 8. Phase Execution Log

### Phase 0 Result

Status: COMPLETED (documentation/audit phase)
Tasks completed:
- Full code-vs-spec audit documented.
- Coverage matrix and phased backlog created.
Files changed:
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- Not run (doc-only phase).
Tests result:
- Not run (doc-only phase).
Known issues:
- High-priority issues captured in Section 6.
Commit hash:
- N/A (not committed yet)
Push status:
- N/A (not pushed)
Next phase:
- Phase 1 - Auth and Account Critical Fixes

### Phase 1 Result

Status: COMPLETED
Tasks completed:
- Added full forgot-password and reset-password web flow.
- Added dedicated authenticated set-password page.
- Updated Google OAuth callback redirect to send no-password users to set-password flow.
- Added login-page forgot-password link and locale messages (`en`/`hy`/`ru`).
Files changed:
- `apps/web/src/app/[locale]/(auth)/login/page.tsx`
- `apps/web/src/app/[locale]/(auth)/forgot-password/page.tsx`
- `apps/web/src/app/[locale]/(auth)/reset-password/page.tsx`
- `apps/web/src/app/[locale]/set-password/page.tsx`
- `apps/api/src/auth/google-oauth.service.ts`
- `apps/api/src/auth/auth.service.ts`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/hy.json`
- `apps/web/src/messages/ru.json`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter web build` PASSED
- `pnpm --filter api build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 5 tests)
Known issues:
- Remaining high-priority items are RBAC and booking/waitlist/finance consistency (Sections 4-6).
Commit hash:
- `b6d4fa6`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 2 - Admin Core Integrity

### Phase 2 Result

Status: COMPLETED
Tasks completed:
- Added admin settings entry to sidebar navigation with translated labels.
- Added admin alias routes: `/admin/analytics` -> `/admin/reports`, `/admin/packages` -> `/admin/memberships` for CRM parity.
- Upgraded admin broadcast form with reusable message templates (new class, policy reminder, waitlist opening).
Files changed:
- `apps/web/src/lib/dashboard-nav.ts`
- `apps/web/src/components/shell/dashboard-nav-icon.tsx`
- `apps/web/src/app/[locale]/(admin)/admin/analytics/page.tsx`
- `apps/web/src/app/[locale]/(admin)/admin/packages/page.tsx`
- `apps/web/src/components/admin/admin-notification-broadcast-form.tsx`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/hy.json`
- `apps/web/src/messages/ru.json`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter web build` PASSED
- `pnpm --filter api build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 5 tests)
Known issues:
- Notification targeting/scheduling and deeper analytics exports remain for later phases.
Commit hash:
- `2c0666b`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 3 - Booking, Waitlist, Schedule Consistency

### Phase 3 Result

Status: COMPLETED
Tasks completed:
- Added membership-session credit restoration on booking cancellation (excluding paid drop-in cancellations).
- Added drop-in checkout prechecks for canceled/started/full/already-booked sessions.
- Hardened waitlist offer sequencing by expiring stale offers inline and preventing multiple active simultaneous offers.
- Added API tests for drop-in checkout duplicate/full validation paths.
Files changed:
- `apps/api/src/bookings/bookings.service.ts`
- `apps/api/src/payments/payments.service.ts`
- `apps/api/src/waitlist/waitlist.service.ts`
- `apps/api/src/payments/payments.service.spec.ts`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter api build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 7 tests)
Known issues:
- Checkout-to-webhook seat race is still possible without reservation holds.
Commit hash:
- `cf893cc`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 4 - Clients and Coaches Management Gaps

### Phase 4 Result

Status: COMPLETED
Tasks completed:
- Added admin clients API query filters (search, membership status, order, take) and wired admin clients UI filter form.
- Added admin coaches API query filters (search, specialization, class type, active status, order) and wired admin coaches UI filter form.
- Added localized copy (`en`/`hy`/`ru`) for new filter controls and client membership badge states.
Files changed:
- `apps/api/src/clients/dto/admin-list-clients-query.dto.ts`
- `apps/api/src/clients/clients.controller.ts`
- `apps/api/src/clients/clients.service.ts`
- `apps/api/src/coaches/dto/admin-list-coaches-query.dto.ts`
- `apps/api/src/coaches/coaches.controller.ts`
- `apps/api/src/coaches/coaches.service.ts`
- `apps/web/src/app/[locale]/(admin)/admin/clients/page.tsx`
- `apps/web/src/app/[locale]/(admin)/admin/coaches/page.tsx`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/hy.json`
- `apps/web/src/messages/ru.json`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter api build` PASSED
- `pnpm --filter web build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 7 tests)
Known issues:
- Client/coach tagging and saved segment presets are not implemented yet.
Commit hash:
- `7af8bd2`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 5 - User Account Gaps

### Phase 5 Result

Status: COMPLETED
Tasks completed:
- Replaced profile delete-account placeholder (`/contact`) with authenticated API endpoint (`POST /users/me/delete-request`).
- Added optional deletion reason field on profile security section and localized copy in all supported languages.
- Added duplicate-request guard to prevent repeated deletion requests within 24h.
Files changed:
- `apps/api/src/users/dto/request-account-deletion.dto.ts`
- `apps/api/src/users/users.controller.ts`
- `apps/api/src/users/users.service.ts`
- `apps/web/src/components/account/delete-account-request-button.tsx`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/hy.json`
- `apps/web/src/messages/ru.json`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter api build` PASSED
- `pnpm --filter web build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 7 tests)
Known issues:
- Membership lifecycle depth (upgrade/downgrade/renewal) remains for finance phase.
Commit hash:
- `0424909`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 6 - Manager and Coach Role Gaps

### Phase 6 Result

Status: COMPLETED
Tasks completed:
- Scoped coach access for `GET /bookings/admin` to coach-owned sessions only.
- Scoped coach attendance updates to own-session bookings only.
- Scoped coach access for `GET /waitlist/sessions/:sessionId` to coach-owned sessions only.
Files changed:
- `apps/api/src/bookings/bookings.controller.ts`
- `apps/api/src/bookings/bookings.service.ts`
- `apps/api/src/waitlist/waitlist.controller.ts`
- `apps/api/src/waitlist/waitlist.service.ts`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter api build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 7 tests)
Known issues:
- Manager-vs-admin boundary around finance/report endpoints needs final enforcement pass.
Commit hash:
- `3068587`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 7 - Finance, Memberships, Payments, Gift Cards

### Phase 7 Result (Interim)

Status: IN PROGRESS
Tasks completed:
- Added gift-credit booking fallback: when no active membership is present and class requires payment, booking now consumes `giftCreditsCents` if sufficient and records payment entry.
- Added stale-membership expiration sync before user/admin membership listings and pause/cancel actions.
- Added re-book handling for existing cancelled booking records to avoid unique-key rebook failures.
- Added membership lifecycle endpoints for renew and plan switch (`PATCH /memberships/me/:id/renew`, `PATCH /memberships/me/:id/change-plan`).
- Wired memberships UI to show Renew action for non-active memberships and Switch Plan action from plan cards.
- Added finance-summary gift-credit ledger metrics (`issued/redeemed/spent/outstanding`) in reports API.
- Added admin finance dashboard cards for gift-credit ledger visibility in UI.
- Added gift-credit transaction export endpoint (`GET /reports/gift-credits.csv`) and finance UI export action.
Files changed:
- `apps/api/src/bookings/bookings.service.ts`
- `apps/api/src/memberships/memberships.service.ts`
- `apps/api/src/memberships/dto/change-membership-plan.dto.ts`
- `apps/api/src/memberships/memberships.controller.ts`
- `apps/web/src/components/account/membership-lifecycle-buttons.tsx`
- `apps/web/src/components/account/membership-plan-switch-button.tsx`
- `apps/web/src/app/[locale]/(account)/user/memberships/page.tsx`
- `apps/api/src/reports/reports.service.ts`
- `apps/api/src/reports/reports.controller.ts`
- `apps/api/src/reports/reports.service.spec.ts`
- `apps/web/src/app/[locale]/(admin)/admin/finance/page.tsx`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/hy.json`
- `apps/web/src/messages/ru.json`
- `PROJECT_IMPLEMENTATION_TRACKER.md`
Build result:
- `pnpm --filter api build` PASSED
Tests result:
- `pnpm --filter api test` PASSED (3 suites, 8 tests)
Known issues:
- Explicit proration policy rules for upgrade/downgrade flows are still pending in Phase 7.
Commit hash:
- `bcc8710`
Push status:
- Pushed to `origin/work/1748df5-base`
Next phase:
- Phase 7 continuation

## 9. Build / Test History

| Date | Command | Result | Notes |
| ---- | ------- | ------ | ----- |
| 2026-05-28 | N/A (Phase 0 doc-only) | SKIPPED | No runtime code changes in this phase |
| 2026-05-28 | `pnpm --filter web build` | PASS | Includes new `/forgot-password`, `/reset-password`, `/set-password` routes |
| 2026-05-28 | `pnpm --filter api build` | PASS | Google OAuth redirect logic compiled successfully |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 5 tests passed |
| 2026-05-28 | `pnpm --filter web build` | PASS | Includes `/admin/analytics` and `/admin/packages` alias routes |
| 2026-05-28 | `pnpm --filter api build` | PASS | No API regressions from Phase 2 web/admin changes |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 5 tests passed |
| 2026-05-28 | `pnpm --filter api build` | PASS | Booking/waitlist/drop-in consistency changes compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter api build` | PASS | Clients/coaches admin filtering query support compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter web build` | PASS | Admin clients/coaches filter forms and i18n compiled |
| 2026-05-28 | `pnpm --filter api build` | PASS | User delete-account request API flow compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter web build` | PASS | Profile security delete-request UX and i18n compiled |
| 2026-05-28 | `pnpm --filter api build` | PASS | RBAC scoping changes for bookings/waitlist compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter api build` | PASS | Gift-credit booking fallback and membership expiry sync compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter api build` | PASS | Membership renew/switch lifecycle endpoints compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed |
| 2026-05-28 | `pnpm --filter web build` | PASS | Membership renew/switch controls and i18n compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 7 tests passed (reports finance summary coverage retained) |
| 2026-05-28 | `pnpm --filter api build` | PASS | Gift-credit ledger metrics in reports compiled |
| 2026-05-28 | `pnpm --filter web build` | PASS | Admin finance gift-credit ledger cards compiled |
| 2026-05-28 | `pnpm --filter api test` | PASS | 3 suites, 8 tests passed (gift-credit CSV export coverage added) |
| 2026-05-28 | `pnpm --filter api build` | PASS | Gift-credit CSV export endpoint compiled |
| 2026-05-28 | `pnpm --filter web build` | PASS | Finance export section includes gift-credit CSV action |

## 10. Git History Created By This Work

| Phase | Commit message | Commit hash | Pushed |
| ----- | -------------- | ----------- | ------ |
| Phase 0 | `phase-0: audit project and add implementation tracker` | N/A | No |
| Phase 1 | `phase-1: complete auth recovery and password setup flow` | `b6d4fa6` | Yes |
| Phase 2 | `phase-2: harden admin core navigation and reporting baseline` | `2c0666b` | Yes |
| Phase 3 | `phase-3: align booking and waitlist lifecycle rules` | `cf893cc` | Yes |
| Phase 4 | `phase-4: extend client and coach management capabilities` | `7af8bd2` | Yes |
| Phase 5 | `phase-5: harden user account security request flow` | `0424909` | Yes |
| Phase 6 | `phase-6: align manager and coach role boundaries` | `3068587` | Yes |
| Phase 7 (interim) | `phase-7: integrate gift-credit booking fallback and membership expiry sync` | `bcc8710` | Yes |
| Phase 7 (continuation) | `phase-7: add membership renew and plan-switch lifecycle` | `4e3e1ff` | Yes |
| Phase 7 (continuation) | `phase-7: add gift-credit ledger metrics to finance reporting` | `3b54c60` | Yes |
| Phase 7 (continuation) | `phase-7: add gift-credit csv export and finance export actions` | TBD | TBD |

## 11. Final Remaining Work

- Complete remaining Phase 7 proration/business-policy depth for upgrade/downgrade flows.
- Upgrade notification/content management depth in Phase 8.
- Close multilingual consistency and run final validation in Phases 9-10.
- Keep `apps/mobile` untouched until explicit mobile phase approval.
