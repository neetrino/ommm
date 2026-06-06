# Admin detail sheet — canon (аканон)

Краткий эталон для **side sheet** в admin: просмотр + inline edit **в одном** sheet.  
**Reference implementation:** Coach (`/admin/coaches`) — все следующие сущности наследуют этот паттерн, если не оговорено иначе.

Связанные файлы:

| Область | Путь |
|--------|------|
| Layout tokens | `apps/web/src/components/admin/admin-details-sheet-layout.ts` |
| Tabs | `apps/web/src/components/admin/admin-detail-sheet-tab-bar.tsx` |
| Save footer | `apps/web/src/components/admin/admin-detail-sheet-form-footer.tsx` |
| Confirm (destructive) | `apps/web/src/components/ui/omm-confirm-dialog.tsx` |
| Confirm (nested sheet, редко) | `apps/web/src/components/admin/admin-confirm-sheet.tsx` |
| Coach (эталон) | `admin-coach-details-drawer.tsx`, `admin-coach-sheet-tabs.ts`, `admin-coach-sheet-tab-panels.tsx`, `admin-coach-edit-form.*` |

План rollout: `todo.md` (Admin sheets — inline edit).

---

## 1. Когда что использовать

| Паттерн | Когда |
|--------|--------|
| **Detail side sheet** (этот canon) | Row click → одна сущность: поля, tabs, Save в footer |
| **Center modal** (`OmmModalPortal`) | Create flows, короткие формы без tabs, delete package category |
| **Confirm dialog** (`OmmConfirmDialog`) | Deactivate, cancel booking, delete — **поверх** sheet, z-index 110 |
| **Read-only narrow sheet** | User lookup, booking details без edit — можно без footer/tabs |

**Не делаем:** второй sheet/modal «Edit …» для той же сущности. Один URL/query param на открытый detail sheet (например `?coachProfile=id`).

---

## 2. Анатомия sheet

```
┌───────────────────────────────────────────── overlay (backdrop click → close)
│  ┌────────────────────────────────────── panel (95dvh, rounded-tl-[28px])
│  │ HEADER: title (имя)          [lifecycle action]
│  │ TAB BAR:  Profile · Details · …
│  │ BODY (scroll): tab panels + toast
│  │ FOOTER (только если dirty | busy): Cancel · Save
│  └──────────────────────────────────────
└─────────────────────────────────────────────
```

**Portal:** `OmmDrawerPortal` + классы из `admin-details-sheet-layout.ts`.

**Ширина:**

- Narrow — bookings, schedule row details (`ADMIN_DETAILS_SHEET_PANEL_CLASS`)
- Medium — user lookup (`ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS`)
- **Wide — профили / CRUD с tabs** (`ADMIN_WIDE_DRAWER_PANEL_CLASS`)

**Overlay:** `ADMIN_DETAILS_SHEET_OVERLAY_CLASS` (`z-[105]`, `items-end`).

---

## 3. Header

| Правило | Coach (эталон) |
|--------|----------------|
| Title | **Только имя** (name + lastName), без email/phone |
| Eyebrow / lede | Не использовать в header (контакт — в Profile tab) |
| Кнопка × | **Не использовать** — закрытие: backdrop, Escape |
| Lifecycle (Deactivate) | **Inline справа** в header, `AdminCoachStatusAction` `layout="inline"` |
| Confirm на lifecycle | `OmmConfirmDialog`, не второй side sheet |

```tsx
<header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
  <div className="flex items-start justify-between gap-3">
    <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>{headerName}</h2>
    <AdminCoachStatusAction layout="inline" … />
  </div>
</header>
```

---

## 4. Tabs

**Один глобальный компонент:** `AdminDetailSheetTabBar` — pill tabs, horizontal scroll.

**Per-entity конфиг:** файл `{entity}-sheet-tabs.ts`:

```ts
export const COACH_SHEET_TAB_PROFILE = "profile";
export const COACH_SHEET_TAB_DETAILS = "details";
// …
export const COACH_SHEET_TAB_ORDER: readonly CoachSheetTabId[] = […];
```

**i18n:** `adminPages.{section}.sheetTabs.{tabId}` — en / ru / hy.

**Coach tabs (эталон):**

| Tab | Содержимое |
|-----|------------|
| **Profile** | Avatar + metrics + status badge + personal fields (email, name, phone, birthday, age) |
| **Details** | Domain-specific профиль (specialization, experience, class type, bio) |
| **Classes** | Assigned classes (checkboxes) |
| **Schedule** | Availability rows |

Разделение: **Profile** = человек + summary metrics; **Details** = роль/домен; остальное — отдельные tabs по смыслу данных.

**Tab panels:** `{entity}-sheet-tab-panels.tsx` — один компонент, `activeTab` switch. Не 100 ad-hoc tab UI.

---

## 5. Body и секции

**Scroll:** `ADMIN_DETAILS_SHEET_BODY_CLASS` + `min-h-0 flex-1` на wrapper внутри panel.

**Секция внутри tab:**

```ts
const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[…] backdrop-blur-md sm:p-5";
```

**Toast:** `AdminCenterToast` в body (save success, photo upload, lifecycle errors). Один toast channel на sheet.

**Read-only metrics:** compact grid карточек (`Metric`) — только на Profile tab, не дублировать в других tabs.

**Не показывать:** внутренние ID (coachId, userId) в UI, если нет ops-потребности.

---

## 6. Footer (form save)

**Компонент:** `AdminDetailSheetFormFooter`.

| Правило | Значение |
|--------|----------|
| Видимость | Только когда `dirty \|\| busy` |
| Cancel | Сброс формы к snapshot (`cancelEdits`), **не** закрывает sheet |
| Save | PATCH entity; disabled если `!dirty` или `busy` |
| Закрытие sheet | Не после каждого Save — только backdrop/Escape (или lifecycle onChanged) |

**Hook pattern:** `use{Entity}EditForm` — form state, snapshot, dirty, validate, save, field updaters.

---

## 7. Photo / avatar

**Не** отдельное поле «Choose photo» в форме.

**Паттерн:** `AdminCoachEditableAvatar` — клик/hover на avatar, upload **сразу** (`POST …/photo-json`), как `AccountHomeImageForm`.

- Remove — × на avatar → `PATCH` с пустым photoUrl
- Ошибки размера — toast + inline error под avatar
- Save footer **не** обязателен для фото (immediate upload)

---

## 8. Destructive / lifecycle actions

| Действие | UI |
|----------|-----|
| Deactivate / Activate | Header inline + `OmmConfirmDialog` |
| Delete row (list) | Row actions + confirm dialog |
| Toggle в таблице | Confirm dialog **до** PATCH (см. `admin-coach-row-actions.tsx`) |

Tone: `danger` для deactivate/delete, `success` для activate/attended.

---

## 9. Close и busy

- `onClose` на portal → clear query param / parent state
- `closeDisabled` когда `editForm.busy \|\| lifecycleBusy`
- Escape и backdrop respect `closeDisabled`
- **Без** кнопки ×

---

## 10. Файловая структура (новая сущность)

```
apps/web/src/components/admin/
  admin-{entity}-details-drawer.tsx    # shell: portal, header, tabs, footer
  admin-{entity}-sheet-tabs.ts         # tab ids + order
  admin-{entity}-sheet-tab-panels.tsx  # UI per tab
  admin-{entity}-edit-form.types.ts    # form state, initial, dirty
  admin-{entity}-edit-form.validation.ts
  admin-{entity}-edit-form.use.ts      # use{Entity}EditForm
  admin-{entity}-editable-avatar.tsx   # если есть фото (optional)
  admin-{entity}-status-action.tsx     # если есть activate/deactivate (optional)
```

**Drawer:** тонкая оболочка; hooks только когда entity !== null (wrapper + inner).

**Directory page:** row click → один drawer, без второго edit modal/sheet.

---

## 11. Checklist — новая сущность

- [ ] Один sheet на row click, один query key
- [ ] `OmmDrawerPortal` + layout canon (wide если tabs)
- [ ] Header: имя + lifecycle справа, без ×, без email в title
- [ ] `AdminDetailSheetTabBar` + `{entity}-sheet-tabs.ts`
- [ ] Tab panels вынесены; i18n `sheetTabs.*`
- [ ] `use{Entity}EditForm` + `AdminDetailSheetFormFooter`
- [ ] Destructive → `OmmConfirmDialog`
- [ ] Photo inline на avatar (если применимо)
- [ ] Toast для async feedback
- [ ] Typecheck + smoke на admin route
- [ ] Обновить `todo.md` rollout status

---

## 12. Исключения (не копировать Coach 1:1)

| Сущность | Заметка |
|----------|---------|
| **Clients** | Notes, gift, history — отдельный UX/tab plan |
| **Bookings** | Уже narrow read + actions; edit полей по необходимости |
| **Create flows** | Center modal / dedicated page, не detail sheet |
| **Manager zone** | Пока legacy `?editCoach=` — унифицировать после admin |

---

## 13. Rollout (порядок)

1. ~~Coach (A2)~~ ✓ admin
2. Gift cards (A4)
3. Class types (B2)
4. Clients (A1) — свой tab layout
5. Schedule sessions (A3)
6. Manager coaches → тот же drawer canon

---

**Version:** 1.0 · **Date:** 2026-06-06 · **Pilot:** Coach admin sheet
