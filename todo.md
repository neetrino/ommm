# Admin sheets — inline edit (plan)

**Goal:** один side sheet на сущность — просмотр и редактирование на месте, без отдельной modal / второго sheet.

**Canon (эталон):** [`docs/ADMIN_DETAIL_SHEET_CANON.md`](docs/ADMIN_DETAIL_SHEET_CANON.md) — layout, tabs, header, footer, confirm, photo, файлы. **Reference:** Coach admin sheet.

**Стратегия:** пилот Coach → shared primitives → rollout по checklist из canon.

---

## Shared (Phase 0 — из пилота Coach)

- [x] `AdminDetailSheetTabBar`
- [x] `AdminDetailSheetFormFooter`
- [x] `admin-details-sheet-layout.ts`
- [x] `OmmConfirmDialog` для lifecycle/destructive
- [x] `AdminCoachEditableAvatar` (pattern для photo)
- [ ] `AdminSheetEditableField` — опционально позже

---

## Priority A

| ID | Раздел | Статус |
|----|--------|--------|
| **A1** | **Clients** — Profile · Bookings · Payments · Gifts · Notes | **done** |
| **A2** | **Coaches** — Profile · Details · Classes · Schedule | **done** |
| A3 | Schedule sessions | pending |
| A4 | Gift cards | **done** |

**A2 tabs:** Profile · Coach details · Classes · Schedule  
**A1 tabs:** Profile · Bookings · Payments · Gift cards · Notes  
**Manager** `/manager/coaches`: legacy `AdminCoachActions` — унифицировать позже.

---

## A1 — Clients ✓ (admin)

**Файлы:** `admin-client-drawer.tsx`, `admin-client-sheet-tabs.ts`, `admin-client-sheet-tab-panels.tsx`, `admin-client-edit-form.*`, `admin-client-status-action.tsx`

- [x] Canon sheet: wide, tabs, header имя + Deactivate, без ×
- [x] Inline edit Profile fields + footer Save/Cancel
- [x] History в отдельных tabs (bookings / payments / gifts / notes)
- [x] Optimistic close backdrop
- [x] Row toggle + confirm dialog
- [ ] Smoke `/admin/clients`

---

## Rollout

~~A1 (clients)~~ ✓ → ~~A4 (gift cards)~~ ✓ → B2 (class types) → A3 (schedule) → manager coaches

---

## A4 — Gift cards ✓ (admin)

**Файлы:** `admin-gift-card-details-sheet.tsx`, `admin-gift-card-sheet-tabs.ts`, `admin-gift-card-sheet-tab-panels.tsx`, `admin-gift-card-status-action.tsx`

- [x] Canon sheet: wide, tabs (Overview · Actions · History), header сумма + Deactivate, без ×
- [x] Assign / resend / delete в Actions tab; history в отдельном tab
- [x] `OmmConfirmDialog` вместо `window.confirm` (row toggle, delete, lifecycle)
- [x] Edit остаётся в center modal (`?modal=edit-gift-card`)
- [ ] Smoke `/admin/gift-cards`

---

## A2 DoD

- [x] Один sheet, tabs, inline edit, footer Save/Cancel
- [x] Header: имя + Deactivate; без ×, без email
- [x] Photo на avatar, immediate upload
- [x] Canon doc
- [ ] Smoke `/admin/coaches`
