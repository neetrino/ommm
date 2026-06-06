# TODO

Полный план Finance reorg (выполнено ~90%): [`docs/archive/todo.finance.md`](docs/archive/todo.finance.md) · spec: `CRM - Ommm - code.md` §9

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

## Сделано (Finance reorg — не трогать без причины)

- [x] 4 route-tabs: Overview / Payments / Members / Coaches + legacy `?tab=` redirect
- [x] Один hero: tab-specific search, filters, CSV trailing; без дублей search/CSV/billing history
- [x] Payments search `q` (API + frontend + test)
- [x] Members: Plan / Cost / Expiration колонки (API + UI)
- [x] Members actions: edit, pause package, notify; refund — stub до API
- [x] Coaches: server filters + pagination + sessions drawer
- [x] URL hygiene: изоляция query между табами, сброс page при смене фильтров
- [x] 429 fix: `@SkipThrottle()` на finance admin read endpoints
- [x] i18n tabs + filters (en); actions/userTab в ru/hy
