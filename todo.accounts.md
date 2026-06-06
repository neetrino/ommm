# Account UI unification — plan

Привести все workspace-аккаунты к **одному канону Admin**: shell, page frame, списки, метрики, sheets (где нужно).  
**Не создавать новое**, если уже есть в `apps/web/src/components/admin/` или `components/shell/`.  
**Удалять** старые one-off стили, дубли заголовков, мёртвый код после каждой фазы.

**Эталоны (reuse as-is):**

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
| **1** | **COACH** | ⏳ ждёт подтверждения 1:1 ниже |
| 2 | MANAGER | после COACH |
| 3 | CONTENT_ADMIN | после MANAGER |
| 4 | USER (дочистка) | только если остались расхождения |
| 5 | Global cleanup | удаление мёртвого кода |

---

## Фаза 1 — COACH (1:1 с Admin shell + frames)

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

- [ ] `AccountPageFrame` imports из всех `coach/**/page.tsx`
- [ ] `variant="wellness"` на coach layout (если нигде больше не нужен для coach)
- [ ] Дублирующие page titles / descriptions в coach pages
- [ ] One-off glass/zinc классы в `coach/analytics/page.tsx`
- [ ] Sidebar `trailing` блок coach (есь совпадает с admin UX)

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

1. **Reuse > rewrite** — admin component first.
2. **One title** — shell header only; subtitle из `dashboard.subtitles`.
3. **No new design tokens** — только `adminChrome`, `ommm-*`, shell classes.
4. **Delete old** — в той же PR/фазе убираем заменённое.
5. **Sheets** — только по `ADMIN_DETAIL_SHEET_CANON.md`; coach/manager sheets — отдельные подзадачи после frame unification.

---

## Подтверждение перед стартом COACH

Нужно OK на:

1. Coach shell → **`variant="admin"`** (визуально 1:1 с admin, не wellness/member).
2. Все coach pages → **`AdminContentFrame`** (без page-level h1).
3. Profile → **`shellChrome="admin"`** (как admin profile).
4. Sidebar trailing (logout/member link) → **убрать** на coach, как у admin.
5. Sheets для coach **не в scope** фазы 1.

После подтверждения — реализация фазы 1 по таблице 1.2–1.5.
