# Admin sheets — inline edit (plan)

**Goal:** один side sheet на сущность — просмотр и редактирование на месте, без отдельной modal / второго sheet. Поле → изменить → **Save** в footer.

**Стратегия:** гибрид — пилот на одной сущности → shared primitives → rollout. **Пилот: A2 Coach** (A1 Clients — отдельный подход позже).

---

## Shared (Phase 0 — из пилота Coach)

- [x] `AdminDetailSheetTabBar` — pill tabs для detail sheets
- [x] `AdminDetailSheetFormFooter` — Save / Cancel при dirty или busy
- [x] `admin-details-sheet-layout.ts` — единый shell (95dvh, rounded-tl, overlay)
- [ ] `AdminSheetEditableField` — label + view / input toggle по клику (опционально, позже)

---

## Priority A — detail sheet + отдельный edit

| ID | Раздел | Detail | Edit сейчас | Статус |
|----|--------|--------|-------------|--------|
| A1 | **Clients** | `admin-client-drawer.tsx` | `admin-client-actions.tsx` (center modal) | pending — **другой подход** |
| **A2** | **Coaches** | `admin-coach-details-drawer.tsx` | ~~`?editCoach=` второй sheet~~ | **✓ done (admin)** |
| A3 | Schedule sessions | `admin-schedule-session-details-sheet.tsx` | `SessionFormSheet` | pending |
| A4 | Gift cards | `admin-gift-card-details-sheet.tsx` | `admin-gift-cards-shell` modal | pending |

**A2 admin:** один sheet с tabs (Overview / Profile / Classes / Schedule), inline edit, footer Save/Cancel.  
**Manager** (`/manager/coaches`): пока `AdminCoachActions` + `?editCoach=` — отдельная итерация.

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

## A2 — Coaches (пилот, admin) ✓

**Файлы:** `admin-coach-details-drawer.tsx`, `admin-coach-edit-form.*`, `admin-coach-sheet-tab-panels.tsx`, `admin-coach-sheet-tabs.ts`

### Сделано

1. [x] Tabs: Overview, Profile, Classes, Schedule
2. [x] Inline edit через `useCoachEditForm`; footer Save / Cancel
3. [x] Убран «Edit coach» и второй sheet из admin directory (`?editCoach=` только cleanup в URL)
4. [x] i18n `sheetTabs.*` (en / ru / hy)
5. [x] Shared tab bar + form footer

### DoD A2 (admin)

- [x] Клик по coach row → один sheet с tabs, правки на месте
- [x] Отдельный edit sheet из admin drawer не открывается
- [ ] Ручной smoke `/admin/coaches`

---

## A1 — Clients (следующий, отдельный дизайн)

**Файлы:** `admin-client-drawer.tsx`, `admin-client-actions.tsx`, `admin-client-row-actions.tsx`

Не копировать Coach 1:1 — нужен свой UX (notes, gift, history, center modal сегодня).

### API

- `PATCH /clients/:id` — уже используется в `AdminClientActions`

---

## Порядок после A2

A4 (gift cards) → B2 (class types) → A1 (clients) → A3 (schedule sessions) → manager coaches unified sheet
