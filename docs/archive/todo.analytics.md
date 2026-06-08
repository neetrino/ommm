# Admin Analytics — plan reorganizacii

**UI-pravilo:** tolko sushestvuyushiy admin-dizayn (`AdminPageHero` / finance unified header, `AdminIntegratedSearchFilters` gde umesno, `AdminContentFrame`, `adminChrome`, `OmmListPagination`, list-layout tokeny); bez novyh vizualnyh patternov; granica s Finance: **Analytics = trends/charts/aggregates**, Finance = operacii i dengi.

Spec: `CRM - Ommm - code.md` §10 (Revenue, Bookings, Attendance, Membership, User activity, Class popularity, Coach performance, Export CSV).

Reference: [`docs/archive/todo.finance.md`](todo.finance.md) — tot zhe routing + hero + tab-specific query pattern.

---

## Tekushchee sostoyanie (problemy)

- Odin dlinnyy `/admin/analytics` page: KPI + 10+ sekciy + export block + limitations block.
- Filtry (`AdminAnalyticsFilters`) — otdelnyy grid **pod** view switcher, ne v hero.
- View switcher (table/chart) ne v trailing hero.
- CSV export — otdelnyy blok vnizu (dubliruet Finance export).
- `AdminSectionShell` (`ommm-card`) oborachivaet ves kontent — lishniy fon pod sekciami.
- `AdminContentFrame description` dubliruet nav subtitle.
- Bookings sample cap 1000 — banner est, no ne privyazan k tabu.
- Coach/class revenue — stub «unsupported» (net API).
- `/admin/reports` → redirect na analytics (ok).
- Net route-tabs; vse query v odном URL bez izolyacii mezhdu logical sections.

---

## Celevaya arhitektura

### 5 tabov (spec §10)

| Tab | Zadacha (spec) | Kontent | Hero filtry |
|-----|----------------|---------|-------------|
| **Overview** | Activity summary | KPI row, sample banner, range hint | rangeDays, quick chips, sort. Trailing: view table/chart, CSV exports |
| **Revenue** | Revenue report | Totals, by source, payment status | rangeDays, quick, sort, view |
| **Bookings** | Bookings + Attendance + Class popularity | Status breakdown, attendance, top classes | rangeDays, coach, class type, booking status, quick, sort, view |
| **Members** | Membership + User activity | Client segments, LTV, visits | rangeDays, quick, sort, view |
| **Coaches** | Coach performance + sessions | Rankings bookings/attendance, sessions count | rangeDays, coach filter, quick, sort, view |

### Vizualnaya skhema (kak Finance)

```
┌──────────────────────────────────────────────────────────────────┐
│ Analytics                                                        │
│ [Overview] [Revenue] [Bookings] [Members] [Coaches]              │
│ ┌──────────────────────────── filters ────────────────────────┐  │
│ │ range · quick · coach · class · status · sort               │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                    [Table|Chart] [↓CSV] [↓CSV]…  │
└──────────────────────────────────────────────────────────────────┘
```

### URL

```
/admin/analytics              → redirect → /admin/analytics/overview
/admin/analytics/overview
/admin/analytics/revenue
/admin/analytics/bookings
/admin/analytics/members
/admin/analytics/coaches
```

Query keys po tabu (chuzhie sbros pri navigacii):

| Tab | Keys |
|-----|------|
| Overview | `rangeDays`, `view`, `quick`, `sort` |
| Revenue | `rangeDays`, `view`, `quick`, `sort` |
| Bookings | + `coachId`, `classTypeId`, `bookingStatus` |
| Members | `rangeDays`, `view`, `quick`, `sort` |
| Coaches | + `coachId` |

---

## Faza 0 — Dogovorennosti

- [x] 5 tabov: Overview / Revenue / Bookings / Members / Coaches
- [x] Routes (ne odin page + якоря)
- [x] Granica Analytics vs Finance (bez payment journal / client actions)
- [ ] Product: ostavit limitations block ili svernut v docs tooltip (rekomendaciya: ubrat iz UI, oставить v plan)

---

## Faza 1 — Layout, routing, hero (P0)

- [x] `admin/analytics/layout.tsx` + `AdminContentFrame` bez description
- [x] Redirect `/admin/analytics` → overview
- [x] `admin-analytics-module.ts`, `admin-analytics-tab-nav.tsx`, `admin-analytics-url.ts`
- [x] `admin-analytics-unified-header.tsx` — title, pill tabs, filters, view switcher, export icons
- [x] `admin-analytics-server-helpers.ts` — fetch payload + filterOptions
- [x] 5 stranic tabov; `admin-analytics-shell.tsx` split po `section`
- [x] Ubrat export/limitations bloki vnizu → export v hero trailing
- [ ] Tab nav s sohraneniem global query pri smene taba
- [ ] Ubrat `description` iz AdminContentFrame (dubl nav subtitle)

---

## Faza 2 — Tab-specific filtry i query hygiene (P0)

- [ ] Tab-specific filter fields v hero (Overview bez coach/class/status)
- [ ] `redirectIfUnscopedAnalyticsSearchParams` pri zahode s chuzhimi keys
- [ ] Sbros `coachId`/`bookingStatus` pri uhoде s Bookings tab
- [ ] Debounce URL replace dlya filtra (kak Finance) — esli est storm

---

## Faza 3 — KPI i periody (P1)

- [ ] Yavnye podpisi u KPI («Last N days», sample cap)
- [ ] Sinhron rangeDays mezhdu tabami
- [ ] (Opcionalno) time-series chart — zavisit ot API

---

## Faza 4 — Backend gaps (P1–P2, spec §10)

- [ ] Coach revenue per coach (Preferred coaches) — net API
- [ ] Class revenue per class type — net API
- [ ] Retention metrics — net API
- [ ] Bookings aggregate bez sample cap (ili DB-side aggregation)
- [ ] Excel export — spec; seychas tolko CSV + banner
- [ ] `@SkipThrottle()` na analytics read endpoints esli 429

---

## Faza 5 — i18n i docs (P1)

- [ ] `adminPages.analytics.tabs.*` (en/ru/hy)
- [ ] Ubrat neispolzuemye klyuchi posle udaleniya export block
- [ ] Obnovit `docs/SITE_FULL_ANALYSIS.md`

---

## Faza 6 — QA (P2)

- [ ] Smena taba: query ne protekaet
- [ ] Chart/table view sohranyaetsya mezhdu tabami
- [ ] Sticky hero, mobile tab scroll
- [ ] Auth 401/403 na kazhdom tabe
- [ ] A11y tablist

---

## Chto NE delaem

- Perenos payment operations s Finance
- Polnyy Excel engine
- User `/user/progress` analytics (otdelnyy epic)

---

## DoD

- [ ] Odin hero: tabs + filtry + view + export
- [ ] 5 route tabs po spec §10
- [ ] Net `AdminSectionShell` pod spiskami/charts
- [ ] `/admin/reports` redirect rabotaet
- [ ] 3 locale dlya tab labels
