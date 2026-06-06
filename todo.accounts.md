# Account UI unification — plan

## Философия (как работаем)

**Цель — одна система, не копипаста экранов.**

«1:1» **не значит** слепо повторить каждый admin-экран на coach/manager.  
Значит: **один визуальный и компонентный язык** — как у **Admin** и **User** account, которые уже согласованы между собой (shell, frames, tokens, lists, sheets).

| Что унифицируем | Что **не** копируем слепо |
|-----------------|---------------------------|
| Shell, sidebar, backdrop, mobile drawer | Admin-only секции (Finance, Settings, …) |
| Page frame (`*ContentFrame`), один title в header | CRUD/permissions другой роли |
| `adminChrome`, `ommm-*`, `OmmButton`, pagination | Полный admin management UI на read-only manager |
| Sheet canon где нужен detail view | Inline edit там, где роль read-only |
| i18n через `dashboard.subtitles.*` | Inline `getManager*Labels()` в page |

**Профессиональный поток на каждую роль:**

1. **Audit** — что на странице по смыслу (метрики, список, форма, read-only).
2. **Map** — какой **существующий** паттерн admin/user ближе (dashboard KPI, bookings list, profile, …).
3. **Reuse** — тот же компонент/тoken; адаптируем только data + actions под роль.
4. **Delete** — старые frame, zinc-стили, дубли, мёртвый код в **той же фазе**.

Coach / Manager / Content-admin — **часть одной экосистемы**, не отдельные «дизайны».

**Два эталона workspace:**

- **Staff** (admin, coach, manager, content-admin) → shell `variant="admin"`, `AdminContentFrame`, staff profile chrome.
- **Member** (user) → shell `variant="member"`, `MemberContentFrame` (уже aligned по width/padding с admin).

---

Привести оставшиеся staff-аккаунты к **этому канону**.  
**Не создавать новое**, если уже есть в `components/admin/`, `components/shell/`, `components/account/`.  
**Удалять** one-off стили и legacy после каждой фазы.

**Reuse map (существующее):**

| Область | Файлы |
|--------|--------|
| Layout shell | `WorkspaceShellFromAuth`, `DashboardAppShell`, `variant="admin"` |
| Page wrapper | `AdminContentFrame` (title/subtitle в shell header) |
| Section surface | `AdminSectionShell` |
| Visual tokens | `adminChrome` (`admin-chrome.ts`) |
| Lists / pager | `OmmListPagination`, `parseListPageParams`, admin list/board patterns |
| Detail sheet | `docs/ADMIN_DETAIL_SHEET_CANON.md`, `admin-details-sheet-layout.ts`, `OmmDrawerPortal` |
| Buttons | `OmmButton` |
| Profile forms | `RoleProfilePage` + `shellChrome="admin"` |
| Subtitles | `dashboard-subtitle-path.ts` → `dashboard.subtitles.*` |

**Member (USER)** уже на каноне: `variant="member"`, `MemberContentFrame` (= тот же padding/width что admin).  
**Admin** — reference. Остальные роли догоняют admin **по компонентам**, не копируя admin-функционал.

---

## Порядок rollout

| Фаза | Account | Статус |
|------|---------|--------|
| **1** | **COACH** | ✅ done |
| **2** | **MANAGER** | ✅ done (shell, frames, i18n, tables) |
| **3** | **CONTENT_ADMIN** | ✅ done |
| 4 | USER (дочистка) | только если остались расхождения |
| 5 | Global cleanup | удаление мёртвого кода |

---

## Фаза 1 — COACH (unification по staff-канону)

**Login для QA:** `coach@ommm.local` / `Demo1234!`

### 1.1 Layout `(coach)/layout.tsx`

| Сейчас | Цель (как Admin) |
|--------|------------------|
| `variant="wellness"` | `variant="admin"` |
| `contentMaxClass="w-full"` | без изменений |
| `trailing`: Logout + Member zone в sidebar | **убрать** — logout через header/account menu как у admin (если уже есть в shell; иначе оставить только то, что есть у admin) |

Subtitle для каждого route уже в `dashboard-subtitle-path.ts` + `dashboard.subtitles.coach.*`.

### 1.2 Page frame — все coach pages

**Правило:** убрать локальный `<h1>` / `AccountPageFrame.title`. Заголовок только в shell.  
Контент оборачивать в `AdminContentFrame` (опционально `description` — только если нет subtitle; иначе без description, как на `/admin/bookings`).

| Page | Файл | Действия |
|------|------|----------|
| Home | `coach/home/page.tsx` | `AccountPageFrame` → `AdminContentFrame`; метрики через `adminChrome.metricCard`; CTA → `OmmButton` / admin link style |
| Schedule | `coach/schedule/page.tsx` | `AdminContentFrame` + `AdminSectionShell` вокруг списка сессий |
| Groups | `coach/groups/page.tsx` | то же; attendance list в section shell |
| Salary | `coach/salary/page.tsx` | `AdminContentFrame`; KPI grid = admin dashboard metrics pattern |
| Analytics | `coach/analytics/page.tsx` | убрать inline `rounded-[20px] border border-white/60…` → `adminChrome.panel` / `metricCard`; trend rows → `adminChrome` или `ommm-inset-row` как в admin |
| Profile | `coach/profile/page.tsx` | как `admin/profile`: `RoleProfilePage` + `shellChrome="admin"` + `workspaceNoteVariant="coach"` |
| Notifications | `coach/notifications/page.tsx` | `AdminContentFrame` + `AccountSection` внутри (формы не трогаем); **не в nav** — оставить route или redirect на profile prefs (решить при реализации) |
| Settings | `coach/settings/page.tsx` | redirect → profile (уже есть) — OK |

### 1.3 Components `components/coach/*`

| Файл | Действия |
|------|----------|
| `coach-upcoming-sessions-section.tsx` | список картоchек → стиль admin row/card (`adminChrome.panel` или reuse admin session row если есть); убрать дубли heading если section shell даёт контекст |
| `coach-attendance-roster-section.tsx` | то же |
| `mark-attendance-buttons.tsx` | кнопки → `OmmButton` (`size="sm"`, variants как в admin bookings attendance) |

**Sheets:** на этой фазе **не добавляем** detail sheets для coach (клик по сессии/roster — позже, если нужен canon). Scope = layout + frames + tokens.

### 1.4 i18n

- Заголовки страниц: уже в `dashboard.nav` + `dashboard.subtitles.coach` — **не дублировать** в `coachPages.*.title` на UI (можно оставить keys для meta/legacy, но page не рендерит h1).
- Проверить ru/hy/en subtitles coach.* (уже есть в en.json).

### 1.5 Удалить после COACH

- [x] `AccountPageFrame` imports из всех `coach/**/page.tsx`
- [x] `variant="wellness"` на coach layout
- [x] Дублирующие page titles / descriptions в coach pages
- [x] One-off glass/zinc классы в `coach/analytics/page.tsx`
- [x] Sidebar `trailing` блок coach

### 1.6 QA checklist (COACH)

- [ ] Все 6 nav routes: home, schedule, groups, salary, analytics, profile
- [ ] Shell: тот же sidebar/backdrop/mobile drawer что admin
- [ ] Нет второго h1 на странице
- [ ] Subtitle под title в header на каждой странице
- [ ] Mark attendance работает после стилей кнопок
- [ ] Profile = тот же layout что admin profile (forms unchanged)

---

## Фаза 2 — MANAGER

**Login:** `manager@ommm.local` / `Demo1234!`

Сейчас manager — **legacy zinc UI** (`text-zinc-900`, `rounded-lg border amber`, inline `getManager*Labels()` в page files).

| Область | Действия |
|---------|----------|
| `(manager)/layout.tsx` | `variant="admin"`, `contentMaxClass="w-full"`, убрать trailing как coach |
| Все pages | `AdminContentFrame` + `adminChrome` + i18n через `next-intl` (`managerPages.*` или reuse admin keys где read-only subset) |
| Lists | заменить raw `<table>` на admin table tokens / reuse admin list components где API тот же |
| `manager-list-pagination.tsx` | сверить с `OmmListPagination` — **удалить** если дубликат |
| Profile | `shellChrome="admin"` + `workspaceNoteVariant="manager"` |
| Home | KPI как `AdminDashboardMetrics` / admin metric cards |

Страницы: home, classes, bookings, waitlists, clients, coaches, gift-cards, profile.

**Sheets:** manager read-only — без inline edit sheets на первом проходе; позже align с admin view-only drawers если появятся.

---

## Фаза 3 — CONTENT_ADMIN

| Область | Действия |
|---------|----------|
| layout | `variant="admin"`, `contentMaxClass="w-full"` |
| pages | `AdminContentFrame`; `content-posts-panel.tsx` — убрать ветку `wellnessChrome` / `AccountPageFrame` если осталась |
| profile | `shellChrome="admin"` |

---

## Фаза 4 — USER (дочистка)

Member уже на `MemberContentFrame` + `variant="member"`. Проверить:

- [ ] Все `/user/*` без локального h1
- [ ] Lists/boards используют общие list tokens
- [ ] Нет `AccountPageFrame` на user routes (profile/notifications → `MemberContentFrame`)

---

## Фаза 5 — Global dead code cleanup

После фаз 1–4:

- [ ] `AccountPageFrame` — удалить файл **только если** zero imports (или оставить для marketing/content если нужен)
- [ ] `AccountSection` — перенести в shared или оставить рядом с profile forms
- [ ] Дубли pagination (`manager-list-pagination.tsx`, …)
- [ ] Inline locale helpers `getManager*Labels` в page.tsx
- [ ] `wellness` variant — audit: оставить только где marketing, не workspace
- [ ] Обновить `docs/SITE_FULL_ANALYSIS.md` (статусы UI)

---

## Принципы (hard rules)

1. **One system** — компоненты/токены/каноны admin + user; не третий стиль на роль.
2. **Reuse > rewrite** — сначала ищем паттерн в admin/user; новое только если реально нет.
3. **Adapt, don’t clone** — контент и actions по роли; оболочка общая.
4. **One title** — shell header + `dashboard.subtitles`; без page-level h1.
5. **No new design tokens** — `adminChrome`, `ommm-*`, shell classes.
6. **Delete old** — в той же фазе убираем заменённое (не копим legacy).
7. **Sheets** — `ADMIN_DETAIL_SHEET_CANON.md`; добавляем только где роли нужен detail view.

### Surfaces — без лишней обёртки на list pages

- **`AdminContentFrame` / `MemberContentFrame`** — только width/padding, **без** page-level `ommm-card`.
- **`AdminSectionShell`** — spacing + toolbar/banner, **без** `ommm-card` (исправляет двойной фон на lists).
- **Profile forms** — `AccountSection` → `ommm-account-section` на секцию.
- **Lists** — `adminChrome.tableWrap` / `adminChrome.panel` на строку.

Локальные `ommm-card` в `admin-schedule-shell` убраны — используется `AdminSectionShell`.

---

## COACH — scope фазы 1 (готово к реализации)

Staff-канон для coach (не копия admin dashboard):

1. Shell → `variant="admin"` (как admin/manager target).
2. Pages → `AdminContentFrame`, subtitle из shell.
3. Profile → `shellChrome="admin"`.
4. Убрать coach-only UI (wellness variant, `AccountPageFrame`, sidebar trailing, inline styles).
5. Sheets — **после** frames; только если нужны по UX роли.
