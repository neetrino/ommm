# Pagination — plan

Postrannaya paginaciya dlya spiskov v admin i user account.  
Profile-stranicy (`/admin/profile`, `/user/profile`, coach/manager) — formy, paginaciya ne nuzhna.

**Sostoyanie (2026-06):** Plan zavershen. Obshchaya infrastruktura i pager na vseh tselevyh stranicah.

**Konstanty:** `DEFAULT_LIST_PAGE_SIZE = 25`, `MAX_LIST_PAGE_SIZE = 100` (`apps/web/src/lib/list-pagination.ts`, `ListPaginationQueryDto`).  
**URL:** `page` (1-based) + `pageSize` → `offset = (page - 1) * pageSize`. Pri smene filtrov — sbros na `page=1`.  
**Ogranichenie:** client-side filtry na nekotoryh stranicah (gift cards, notifications, schedule list, coach finance, payments source) primenyayutsya k **tekushchey stranice**, ne ko vsemu naboru.

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
- [x] `/admin/finance` — payments: `payPage`/`payPageSize`; clients tab: `userPage`/`userPageSize`

---

## Faza 2 — Admin spiski ✅

| Stranica | URL keys (primer) | API |
|----------|-------------------|-----|
| Bookings (list) | `page`, `pageSize` | `GET /bookings/admin/management?take&offset` |
| Waitlists | `page`, `pageSize` | `GET /waitlist/admin/active?take&offset` |
| Gift cards | `page`, `pageSize` | `GET /gift-cards/admin/batches?take&offset` |
| Notifications scheduled | `scheduledPage`, `scheduledPageSize` | `GET /notifications/admin/scheduled?take&offset` |
| Notifications deliveries | `deliveriesPage`, `deliveriesPageSize` | `GET /notifications/admin/deliveries?take&offset` |
| Schedule **list view** | `schedulePage`, `schedulePageSize` | `GET /classes/admin/sessions?take&offset` |
| Schedule calendar views | — | polnaya vyborka bez pagination (kak ranshe) |
| Coaches | `page`, `pageSize` | `GET /coaches/admin/list?take&offset` (bez params → legacy massiv dlya finance/schedule/analytics) |
| Finance coach tab | `coachPage`, `coachPageSize` | `GET /coaches/admin/salary-summaries?take&offset` |

Calendar views bookings/schedule — fetch po diapazonu dat, bez postrannoy paginacii.

---

## Faza 3 — User account ✅

| Stranica | URL keys | API |
|----------|----------|-----|
| Bookings (past) | `pastPage`, `pastPageSize` | `GET /bookings/me?scope=past&take&offset` |
| Payments | `page`, `pageSize` | `GET /payments/me?take&offset` |
| Gift cards purchased | `purchasedPage`, `purchasedPageSize` | `GET /gift-cards/me/purchased?take&offset` |
| Gift cards received | `receivedPage`, `receivedPageSize` | `GET /gift-cards/me/received?take&offset` |

**Bez paginacii (dostatochno malo zapisey):** `/user/profile`, `/user/notifications` (prefs), `/user/packages`, `/user/progress`, `/user/classes` (14 dney).

---

## Faza 4 ✅

### Clients API — P0
- [x] Filtraciya v Prisma; `pagination.total` iz DB `count`

### Client sheet tabs — P2
- [x] Bookings / payments / gift-cards endpoints + pager v tabah

### Coach finance drawer — P2
- [x] Sessii za mesyac — paginated sessions + pager v drawer

---

## Faza 5 ✅

- [x] Manager: clients, bookings, coaches, waitlists — URL `page`/`pageSize`
- [x] Admin Packages — pager v tablice kategorii (>25 tiers)
- [x] Admin Analytics — sample cap `ANALYTICS_BOOKINGS_SAMPLE_LIMIT = 1000`, banner pri prevyshenii

---

## Inventar (aktualno)

| Oblast | Stranica | API | UI pager | Status |
|--------|----------|-----|----------|--------|
| Admin | `/admin/clients` | take/offset/total (DB + post-process fallback) | da | done |
| Admin | `/admin/bookings` list | take/offset/total | da | done |
| Admin | `/admin/finance` payments | take/offset/total | da | done |
| Admin | `/admin/finance` coach tab | salary-summaries take/offset | da | done |
| Admin | `/admin/waitlists` | take/offset/total | da | done |
| Admin | `/admin/gift-cards` | take/offset/total | da | done |
| Admin | `/admin/notifications` | scheduled + deliveries paginated | da | done |
| Admin | `/admin/schedule` list | take/offset/total | da | done |
| Admin | `/admin/coaches` | take/offset/total | da | done |
| Admin | client sheet tabs | bookings/payments/gift-cards endpoints | da | done |
| Admin | coach finance drawer | sessions take/offset/total | da | done |
| Admin | `/admin/packages` | client-side per category table | da | done |
| Admin | `/admin/analytics` | sample cap 1000 + banner | n/a | done |
| User | `/user/bookings` past | scope + take/offset | da | done |
| User | `/user/payments` | take/offset/total | da | done |
| Manager | clients, bookings, coaches, waitlists | take/offset/total | da | done |
| User | `/user/gift-cards` | take/offset (2 sekcii) | da | done |
