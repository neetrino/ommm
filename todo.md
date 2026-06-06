# Pagination — plan

Postrannaya paginaciya dlya spiskov v admin i user account.  
Profile-stranicy (`/admin/profile`, `/user/profile`, coach/manager) — formy, paginaciya ne nuzhna.

**Sostoyanie (2026-06):** Fazy 0–3 i bolshinstvo Fazy 2 zaversheny. Obshchaya infrastruktura i pager na stranicakh nizhe.  
**Ostalos:** Faza 4 (sheet tabs + Clients DB pagination), Faza 5 (manager, nizkiy prioritet).

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
- [ ] ⚠️ **Tech debt (Faza 4):** API slice v pamyati posle fetch 500 — nuzhna DB-pagination + `count`

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

## Faza 4 — Sleduyushchiy etap

### Clients API — P0 (tech debt)
- [ ] Filtraciya v Prisma; ubrat in-memory slice posle fetch 500
- [ ] `pagination.total` iz `count`, ne iz `rows.length` posle filter

### Client sheet tabs — P2
- [ ] Bookings tab — `GET /clients/:id/bookings?take&offset` (seychas `take: 100` v include)
- [ ] Payments tab — otdelnyy endpoint s paginaciyey (seychas `take: 50`)
- [ ] Gifts tab — pager v tabe (seychas `take: 20`)

### Coach finance drawer — P2
- [ ] Sessii za mesyac — pager esli > ~50

---

## Faza 5 — Po neobhodimosti

- [ ] Manager: `/manager/clients`, `/manager/bookings`, `/manager/coaches`, `/manager/waitlists`
- [ ] Admin Packages — nizkiy prioritet
- [ ] Admin Analytics — ne row-list; disclaimer `ANALYTICS_BOOKINGS_SAMPLE_LIMIT = 1000`

---

## Inventar (aktualno)

| Oblast | Stranica | API | UI pager | Status |
|--------|----------|-----|----------|--------|
| Admin | `/admin/clients` | take/offset (in-memory ⚠️) | da | done, DB debt |
| Admin | `/admin/bookings` list | take/offset/total | da | done |
| Admin | `/admin/finance` payments | take/offset/total | da | done |
| Admin | `/admin/finance` coach tab | salary-summaries take/offset | da | done |
| Admin | `/admin/waitlists` | take/offset/total | da | done |
| Admin | `/admin/gift-cards` | take/offset/total | da | done |
| Admin | `/admin/notifications` | scheduled + deliveries paginated | da | done |
| Admin | `/admin/schedule` list | take/offset/total | da | done |
| Admin | `/admin/coaches` | take/offset/total | da | done |
| Admin | client sheet tabs | hard limits | net | Faza 4 |
| User | `/user/bookings` past | scope + take/offset | da | done |
| User | `/user/payments` | take/offset/total | da | done |
| User | `/user/gift-cards` | take/offset (2 sekcii) | da | done |

---

## Rekomenduemyy poryadok (dalnee)

1. **Faza 4 P0** — Clients API DB pagination (razblokiruet korrektnyy total pri filtrah)
2. **Faza 4 P2** — Client sheet tabs (bookings → payments → gifts)
3. **Faza 4 P2** — Coach finance drawer sessions
4. **Faza 5** — Manager stranicy (povtorit pattern admin)
