# Admin sheets — inline edit (plan)

**Goal:** один side sheet на сущность — просмотр и редактирование на месте, без отдельной modal / второго sheet. Поле → изменить → **Save** в footer.

---

## Shared (после A1 — вынести в переиспользуемые компоненты)

- [ ] `AdminSheetEditableField` — label + view / input toggle по клику
- [ ] Dirty state + footer **Save / Cancel** (`ADMIN_DETAILS_SHEET_FOOTER_CLASS`)
- [ ] Паттерн: sheet всегда открыт → edit mode не меняет layout

---

## Priority A — detail sheet + отдельный edit

| ID | Раздел | Detail | Edit сейчас | Статус |
|----|--------|--------|-------------|--------|
| **A1** | **Clients** | `admin-client-drawer.tsx` | `admin-client-actions.tsx` (center modal) | **→ START** |
| A2 | Coaches | `admin-coach-details-drawer.tsx` | `admin-coach-actions.tsx` (sheet `?editCoach=`) | pending |
| A3 | Schedule sessions | `admin-schedule-session-details-sheet.tsx` | `SessionFormSheet` | pending |
| A4 | Gift cards | `admin-gift-card-details-sheet.tsx` | `admin-gift-cards-shell` modal | pending |

## Priority B — частично inline / polish

| ID | Раздел | Заметка |
|----|--------|---------|
| B1 | Bookings | status/actions уже в sheet; поля — по необходимости |
| B2 | Class types | list+editor в одном sheet — унифицировать UX |

## Priority C — out of scope (read-only / confirm)

User details, finance coach sessions, confirm sheet.

## Priority D — не detail sheet (позже)

Packages, recurring schedule templates, create modals (coach, gift card, class type shell).

---

## A1 — Clients (первая итерация)

**Файлы:** `admin-client-drawer.tsx`, `admin-client-actions.tsx`, `admin-client-row-actions.tsx`

### Do

1. [ ] Убрать center modal из `AdminClientActions` (или свести к save-only helper без portal)
2. [ ] В `AdminClientDrawer`: поля email, name, lastName, phone, dateOfBirth — editable inline
3. [ ] Footer sheet: Save / Cancel; disabled когда нет изменений или идёт save
4. [ ] Убрать `EditActionButton` из header drawer (edit = сам sheet)
5. [ ] Убрать URL `?editClient=` flow если больше не нужен
6. [ ] Сохранить: notes, gift, history sections без изменений
7. [ ] i18n: save / cancel / saved / validation errors

### API

- `PATCH /clients/:id` — уже используется в `AdminClientActions`

### DoD A1

- [ ] Клик по client row → один sheet, правки на месте, Save работает
- [ ] Отдельная edit modal для client не открывается
- [ ] Typecheck + ручной smoke на `/admin/clients`

---

## Порядок после A1

A1 → A4 (gift cards) → B2 (class types) → A2 (coaches) → A3 (schedule sessions)
