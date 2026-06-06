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
| A1 | Clients — **свой UX** (notes, gift, history) | pending |
| **A2** | **Coaches** — admin canon ✓ | **done** |
| A3 | Schedule sessions | pending |
| A4 | Gift cards | pending |

**A2 tabs:** Profile · Coach details · Classes · Schedule  
**Manager** `/manager/coaches`: legacy `AdminCoachActions` — унифицировать позже.

---

## Rollout

A4 → B2 (class types) → A1 (clients) → A3 (schedule) → manager coaches

---

## A2 DoD

- [x] Один sheet, tabs, inline edit, footer Save/Cancel
- [x] Header: имя + Deactivate; без ×, без email
- [x] Photo на avatar, immediate upload
- [x] Canon doc
- [ ] Smoke `/admin/coaches`
