# Packages & Booking UAT / Rollout Checklist

## Scope

Use this checklist before production rollout of the rebuilt `Types -> Packages -> Schedule -> Booking` flow.

## UAT Preconditions

- Latest migrations are applied (`prisma migrate deploy`).
- Seed/admin data exists for at least:
  - 2 class types,
  - 2 single plans,
  - 1 combined plan with allocations.
- At least 2 test members exist:
  - one with active package credits,
  - one without active credits.

## Core UAT Scenarios

- [ ] **Single package booking**: member books eligible session; `sessionsRemaining` decrements by expected amount.
- [ ] **Single package cancel**: cancel before penalty window; consumed credits are fully restored.
- [ ] **Penalty cancel behavior**: cancel inside penalty window; booking is cancelled and credits are **not** restored.
- [ ] **Combined package booking**: booking consumes from matching component balance in `UserPackageBalance`.
- [ ] **Combined package depletion**: depleted component cannot book covered class type.
- [ ] **Multiple eligible packages**: booking flow prompts package selection and respects explicit choice.
- [ ] **No eligible credits**: booking flow shows purchase fallback and suggested plan.
- [ ] **Drop-in paid booking cancel**: cancellation does not restore package credits for drop-in-paid bookings.
- [ ] **Card package purchase activation**: payment confirmation moves package `PENDING -> ACTIVE`.
- [ ] **Admin reconcile**: `POST /packages/admin/reconcile-sessions` completes successfully and aligns parent `sessionsRemaining`.
- [ ] **Admin sync expired**: `POST /packages/admin/sync-expired` marks overdue packages as `EXPIRED`.

## Admin Panel Verification

- [ ] `Admin -> Types`: create/edit/delete class type works with validation messages.
- [ ] `Admin -> Packages`: create/edit single and combined plans works end-to-end.
- [ ] Package deletion blockers are shown when active memberships exist.
- [ ] Category enable/disable actions reflect immediately in UI and API responses.

## Observability / Logs

- [ ] API logs contain booking-credit lifecycle entries for consume/restore/reconcile.
- [ ] No Prisma runtime errors appear for package tables in API logs.
- [ ] Error responses are actionable (no generic "500" without context in logs).

## Rollout Steps

1. Deploy DB migrations.
2. Deploy API.
3. Deploy Web.
4. Run smoke test endpoints:
   - `GET /v1/packages/admin/plans`
   - `GET /v1/bookings/sessions/:id/eligible-packages`
   - `POST /v1/packages/admin/reconcile-sessions`
5. Execute core UAT scenarios above with test accounts.
6. Obtain product/ops sign-off.

## Post-launch (first 48h)

- [ ] Monitor booking success/cancel rates for anomalies.
- [ ] Monitor package credit support tickets.
- [ ] Run reconcile endpoint at least once and verify no major drift.
- [ ] Record issues and patch in follow-up release notes.
