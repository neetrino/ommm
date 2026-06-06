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
| A3 | Schedule sessions | **done** |
| A4 | Gift cards | **done** |
| **B2** | **Class types** | **done** |

**A2 tabs:** Profile · Coach details · Classes · Schedule  
**A1 tabs:** Profile · Bookings · Payments · Gift cards · Notes  
**Manager** `/manager/clients` и `/manager/coaches` — read-only каталоги (edit в admin CRM).

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

~~A1 (clients)~~ ✓ → ~~A4 (gift cards)~~ ✓ → ~~B2 (class types)~~ ✓ → ~~A3 (schedule sessions)~~ ✓

---

## A3 — Schedule sessions ✓ (admin)

**Файлы:** `admin-schedule-session-details-sheet.tsx`, `admin-schedule-session-sheet-tabs.ts`, `admin-schedule-session-sheet-tab-panels.tsx`, `admin-schedule-session-edit-form.*`, `admin-schedule-session-status-action.tsx`

- [x] Row click / Edit → wide canon sheet (Details · Bookings · Actions)
- [x] Inline edit + `AdminDetailSheetFormFooter`; create/duplicate — отдельный `SessionFormSheet`
- [x] Header: название + Cancel/Activate; без ×
- [x] `OmmConfirmDialog` (row actions + delete в Actions tab)
- [ ] Smoke `/admin/schedule` → open session → edit/save/cancel/duplicate/delete
- [ ] **UI entry point class types** — см. B2 restore (опционально)

---

## B2 — Class types ✓ (schedule catalog)

**Файлы:** `admin-class-types-modal.tsx`, `admin-class-type-sheet-tabs.ts`, `admin-class-type-sheet-tab-panels.tsx`, `admin-class-type-edit-form.*`, `admin-class-type-delete-action.tsx`

- [x] Catalog list → click row opens detail sheet (Details · Usage tabs)
- [x] Inline edit + `AdminDetailSheetFormFooter`; create via header Add
- [x] Header: имя типа + Delete; без ×
- [x] `OmmConfirmDialog` для delete (вместо `AdminConfirmSheet`)
- [x] URL `?modal=class-types&editClassType=id` сохранён
- [ ] Smoke `/admin/schedule` → Class types
- [ ] **UI entry point** — кнопка «Типы занятий» на Schedule (см. restore ниже)

### Restore: кнопка «Типы занятий» на `/admin/schedule`

**Контекст:** sheet и `AdminClassTypesModal` работают; открытие только по URL `?modal=class-types`. Кнопку из UI убрали **до B2**, не в рамках rollout sheet.

| | |
|---|---|
| **Удалено** | commit `2642916` (*Add Class Type hanel em Schdule-ic*, 2026-06-04) |
| **Добавлено** | commit `5504b76` (*class type button in Admin Schedule*, 2026-06-01) |
| **Файл** | `apps/web/src/components/admin/admin-schedule-management.tsx` |

**Как вернуть:** в `admin-schedule-management.tsx` добавить `openClassTypesModal()` → `replaceScheduleModalInUrl(..., "class-types")` и кнопку в hero/trailing (рядом с «Добавить занятие»). i18n уже есть: `adminPages.classes.classTypes.manageButton`.

**Старый UX (опционально):** reveal через иконку глаза + localStorage — см. `2642916^` (`SchedulePageActions`, `CLASS_TYPES_VISIBLE_STORAGE_KEY`).

**Проверка после restore:** Schedule → кнопка → catalog sheet → create/edit/delete; URL sync `editClassType`.

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
