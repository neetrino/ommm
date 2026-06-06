# Pagination — plan

Postrannaya paginaciya dlya spiskov v admin i user account.  
Profile-stranicy (`/admin/profile`, `/user/profile`, coach/manager) — formy, paginaciya ne nuzhna.

**Sostoyanie (2026-06):** Plan zavershen. Pagination polish zavershen.

**Konstanty:** `DEFAULT_LIST_PAGE_SIZE = 25`, `MAX_LIST_PAGE_SIZE = 100` (`apps/web/src/lib/list-pagination.ts`, `ListPaginationQueryDto`).  
**URL:** `page` (1-based) + `pageSize` → `offset = (page - 1) * pageSize`. Pri smene filtrov — sbros na `page=1`.

---

## Pagination polish (2026-06)

Filtry primenyayutsya k **polnomu naboru** cherez API (ne k tekushchey stranice):

| Oblast | Status | API / UI |
|--------|--------|----------|
| Gift cards | done | `ListAdminGiftCardBatchesQueryDto` + `gift-cards-list-query.builder.ts`; SSR peredaet filtry iz URL |
| Finance members | done | `giftCardOnly`, quick → `/clients`; ubran client-side filter v panel |
| Finance coaches | done | search/month/payout/quick → `/coaches/admin/salary-summaries` |
| Notifications scheduled | done | post-process filter + URL keys `sched*`; SSR |
| Notifications deliveries | done | API filtry + SSR; URL keys `del*` |
| Analytics bookings | done | `countOnly=true` dlya tochnogo `matchedTotal`; sample ostetsya cap 1000 |
| Clients post-process | improved | `giftCardOnly`, `birthdayMonth` prefilter `dateOfBirth not null` |
| Schedule list view | done | API filtry + URL keys `sched*`; calendar — client-side filter |

**Ogranicheniya polish:**

- Notifications: scan limit 2000 pri aktivnyh filtrah (`NOTIFICATIONS_FILTER_SCAN_LIMIT`)
- Coach finance: scan limit 500 pri payout/quick/order filtrah
- Clients post-process: scan limit 3000 (computed preferredCoach, attendance, VIP, …)
- Deliveries tab: filtry sinhroniziruyutsya s URL (`del*`)

---

## Faza 0 — Obshchaya infrastruktura ✅

- [x] `OmmListPagination` + `parseListPageParams` / `syncListPageQuery` / `resetListPageQuery`
- [x] i18n: `adminPages.pagination.*`, `userPages.pagination.*`

---

## Faza 1 — Admin quick wins ✅

### Admin Clients — P0
- [x] `/admin/clients` — URL → API `take`/`offset`, pager, summary po polnomu naboru
- [x] DB-pagination: Prisma `where` + `count`; fallback post-process pri computed filter/sort (limit 3000)

### Admin Finance — user tab + payments — P0
- [x] `/admin/finance/members` — payments otdelno; clients tab paginated
- [x] `/admin/finance/payments` — paginated

---

## Faza 2 — Admin spiski ✅

| Stranica | URL keys (primer) | API |
|----------|-------------------|-----|
| Bookings (list) | `page`, `pageSize` | `GET /bookings/admin/management?take&offset` |
| Waitlists | `page`, `pageSize` | `GET /waitlist/admin/active?take&offset` |
| Gift cards | `page`, `pageSize` + filter keys | `GET /gift-cards/admin/batches?take&offset&…` |
| Notifications scheduled | `scheduledPage`, `schedSearch`, … | `GET /notifications/admin/scheduled?take&offset&…` |
| Notifications deliveries | `deliveriesPage`, … | `GET /notifications/admin/deliveries?take&offset&…` |
| Schedule **list view** | `schedulePage`, `schedulePageSize`, `schedQ`, … | `GET /classes/admin/sessions?take&offset&…` |
| Schedule calendar views | — | polnaya vyborka bez pagination (kak ranshe) |
| Coaches | `page`, `pageSize` | `GET /coaches/admin/list?take&offset` |
| Finance coach tab | `coachPage`, `month`, `q`, … | `GET /coaches/admin/salary-summaries?take&offset&…` |

---

## Faza 3 — User account ✅

| Stranica | URL keys | API |
|----------|----------|-----|
| Bookings (past) | `pastPage`, `pastPageSize` | `GET /bookings/me?scope=past&take&offset` |
| Payments | `page`, `pageSize` | `GET /payments/me?take&offset` |
| Gift cards purchased / received | `purchasedPage`, `receivedPage`, … | paginated endpoints |

---

## Faza 4 ✅

- [x] Clients API DB pagination
- [x] Client sheet tabs paginated
- [x] Coach finance drawer sessions paginated

---

## Faza 5 ✅

- [x] Manager pages paginated
- [x] Admin Packages category table pager
- [x] Admin Analytics sample + accurate total via `countOnly`

---

## Inventar (aktualno)

| Oblast | UI pager | Server-side filters | Status |
|--------|----------|---------------------|--------|
| Admin clients | da | DB + post-process | done |
| Admin gift cards | da | da | polish done |
| Finance members | da | da | polish done |
| Finance coaches | da | da | polish done |
| Notifications scheduled | da | da | polish done |
| Notifications deliveries | da | da | polish done |
| Schedule list | da | da | polish done |
| Analytics | n/a | count + sample | polish done |

---

## Backlog (melochi) ✅ 2026-06

- [x] `finance-payments-table.tsx` — otdelnyy fayl udalen ranee; tablica v `admin-finance-payments-panel.tsx`
- [x] Web `tsc`: `user/bookings/page.tsx` (ServerApiResult narrow), `studio-social-links.ts` (missing module)
