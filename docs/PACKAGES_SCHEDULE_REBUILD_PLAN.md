# Packages & Schedule Rebuild Plan

## Goal

Rebuild `Types -> Packages -> Schedule -> Booking` flow from zero with production-grade domain logic for Pilates center, including:

- Single plans
- Combined plans (multiple package components, one payment)
- Correct booking and cancellation credit accounting

## Working Rules For This Plan

1. Work strictly phase-by-phase.
2. After each completed phase:
   - update this file and mark the phase as `DONE`;
   - create a dedicated git commit for that phase;
   - push to remote.
3. Do not start the next phase before previous phase acceptance criteria are met.
4. If scope changes, add a `Change Note` entry under the relevant phase before implementation.

## Phase Status Board

- [x] Phase 0 - Planning baseline (`DONE`)
- [ ] Phase 1 - Domain & DB schema
- [ ] Phase 2 - Backend packages module
- [ ] Phase 3 - Booking credit ledger integration
- [ ] Phase 4 - Admin UI (Types/Packages)
- [ ] Phase 5 - Member booking UX
- [ ] Phase 6 - Tests, observability, hardening
- [ ] Phase 7 - UAT, rollout, post-launch checks

---

## Phase 0 - Planning baseline (`DONE`)

### Deliverables

- Professional phased plan documented in this file.
- Clear acceptance criteria and commit strategy.

### Acceptance Criteria

- Team can execute work in small reviewable increments.
- Each phase has scope boundaries.

### Commit

- `docs(plan): add packages-schedule rebuild execution plan`

---

## Phase 1 - Domain & DB schema

### Scope

- Finalize core entities and relations:
  - `ClassType` (Types)
  - `PackagePlan` (`SINGLE` / `COMBINED`)
  - `CombinedPlanComponent`
  - `UserPackage`
  - `UserPackageBalance` (per coverage/component)
  - `BookingConsumption` (ledger row)
- Define constraints/indexes for correctness and performance.
- Add migrations and seed baseline data where needed.

### Acceptance Criteria

- Prisma schema compiles and migration applies cleanly.
- Domain can represent:
  - single plan coverage
  - combined plan allocations
  - per-booking consume/restore traceability

### Commit

- `feat(db): add packages and booking credit ledger schema`

---

## Phase 2 - Backend packages module

### Scope

- Implement `packages` API service/controller logic:
  - admin plans CRUD
  - combined plan creation
  - categories listing
  - member-owned packages listing
- Implement package eligibility calculation service.

### Acceptance Criteria

- `GET /packages/admin/plans` returns real rows.
- `POST /packages/plans/combined` creates valid combined plan with components.
- `GET /packages/me` returns user packages with balances/usage.

### Commit

- `feat(api): implement packages module and eligibility services`

---

## Phase 3 - Booking credit ledger integration

### Scope

- Extend booking flow to support optional `userPackageId`.
- On booking:
  - select/validate eligible package
  - consume balance atomically
  - write `BookingConsumption` row
- On cancellation:
  - restore consumed balance from ledger row(s)
  - keep idempotent behavior
- Implement endpoints:
  - `GET /bookings/sessions/:id/eligible-packages`
  - `GET /bookings/sessions/:id/purchase-plans`

### Acceptance Criteria

- Booking with package decrements correct balance.
- Cancel restores exact consumed credits.
- No balance drift in normal and retry paths.

### Commit

- `feat(api): integrate package credit consume/restore into bookings`

---

## Phase 4 - Admin UI (Types/Packages)

### Scope

- Types management UI validation alignment.
- Packages admin flows:
  - create/edit single plans
  - create combined plans
  - define per-component allocations
  - category and status operations
- Align UI payloads with final backend contracts.

### Acceptance Criteria

- Admin can fully manage Types and Package plans end-to-end.
- Combined package form prevents invalid allocation sums/input.

### Commit

- `feat(web): complete admin types and packages management flows`

---

## Phase 5 - Member booking UX

### Scope

- Booking flow improvements:
  - auto-select when one eligible package
  - selection modal when multiple packages
  - purchase modal when no bookable package
- Display package usage clearly (remaining/total/unlimited).

### Acceptance Criteria

- Member can book with correct package choice.
- Member gets correct fallback to purchase when depleted.

### Commit

- `feat(web): finalize member package-aware booking journey`

---

## Phase 6 - Tests, observability, hardening

### Scope

- Add unit/integration tests for:
  - eligibility
  - consume/restore
  - combined allocations
  - cancellation penalty interactions
- Add reconciliation command/job for balance drift detection.
- Add structured logs around booking credit operations.

### Change Note (2026-06-18)

- Added admin maintenance endpoints to trigger package lifecycle hardening:
  - `POST /packages/admin/sync-expired`
  - `POST /packages/admin/reconcile-sessions`
- Added package payment activation fulfillment in `PaymentsService` so `PENDING`
  member packages move to `ACTIVE` when payment is confirmed.

### Acceptance Criteria

- Critical package-booking scenarios are covered by automated tests.
- Reconciliation tooling available for support operations.

### Commit

- `test+chore(api): add booking credit tests and reconciliation tooling`

---

## Phase 7 - UAT, rollout, post-launch checks

### Scope

- UAT checklist with real Pilates center scenarios.
- Controlled rollout and monitoring.
- Post-launch issue fixes and documentation updates.

### Acceptance Criteria

- Core scenarios pass UAT:
  - single package booking/cancel
  - combined package booking/cancel
  - multiple packages selection
  - no-package purchase fallback
- Team sign-off captured.

### Commit

- `docs+chore: complete rollout checklist and launch notes`

---

## Per-Phase Update Template

When a phase is done, append the following under that phase:

```md
### Execution Log
- Date:
- Owner:
- PR/Commit:
- Notes:
```

Then update `Phase Status Board` checkbox to `DONE`.
