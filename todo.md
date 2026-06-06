# TODO

Полный план Finance reorg (~90%): [`docs/archive/todo.finance.md`](docs/archive/todo.finance.md) · spec §9

Полный план Analytics reorg (в работе): [`docs/archive/todo.analytics.md`](docs/archive/todo.analytics.md) · spec §10

---

## Admin Analytics — остаток

### Faza 1 (в процессе)

- [x] План `docs/archive/todo.analytics.md`
- [x] 5 route-tabs + redirect `/admin/analytics` → overview
- [x] `layout.tsx` + unified header (tabs, filters, view, CSV icons)
- [x] `admin-analytics-server-helpers`, `admin-analytics-url`, tab pages
- [x] Shell split по `section` (overview / revenue / bookings / members / coaches)
- [ ] Tab nav сохраняет global query при смене таба
- [ ] Убрать `description` из `AdminContentFrame` (dubl nav subtitle)

### Backend / product (P1–P2)

- [ ] Coach revenue per coach, class revenue — API (spec §10)
- [ ] Retention metrics — API
- [ ] Bookings aggregates без sample cap
- [ ] Excel export
- [ ] `@SkipThrottle()` на analytics reads при 429

### i18n / QA

- [ ] Auth error QA на всех 5 табах
- [ ] `docs/SITE_FULL_ANALYSIS.md`

---

## Admin Finance — остаток

### Backend / product (отдельные epic'и)

- [ ] **Refund request** — API + UI на Members (сейчас toast «не поддерживается»); связать с payment provider (Ameriabank/ARCA refund flow)
- [ ] **DB pagination `/clients`** — убрать in-memory slice 500; `take`/`offset` на уровне Prisma (Members tab + `/admin/clients`)
- [ ] **Coaches payroll** — real payout records, edit/pause salary (spec §9.4; сейчас estimated salary + info banner)
- [ ] **Pagination `/coaches/admin/list`** — `take`/`offset` (связь с coaches roster epic)

### UI / spec gaps (P2)

- [ ] **Members payment status** — dropdown paid / pending / canceled / cash (spec §9.3); сейчас badge `paymentBehavior`
- [ ] **Overview KPI** — (опционально) убрать или переименовать Total revenue, если дублирует Monthly + range — согласовать с product

### i18n / docs / QA

- [ ] **i18n ru/hy** — дописать `adminPages.finance.coachTab`, `coachDrawer` (en есть; ru/hy могут fallback на en)
- [ ] **Auth error QA** — ручной прогон 401/403 на всех 4 табах finance
- [ ] **docs** — кратко обновить `docs/SITE_FULL_ANALYSIS.md` (новая структура Finance)

---

## Сделано (Finance reorg)

- [x] 4 route-tabs: Overview / Payments / Members / Coaches + legacy `?tab=` redirect
- [x] Один hero: tab-specific search, filters, CSV trailing
- [x] Payments search `q`, Members columns, Coaches server filters
- [x] 429 fix, URL hygiene, list UI unified with Bookings/Clients

## Сделано (Analytics Faza 1 — начало)

- [x] 5 tabs по spec §10, unified header как Finance
- [x] Export icons в hero, без блока export/limitations внизу
- [x] Query sanitization per tab (`redirectIfUnscopedAnalyticsSearchParams`)
