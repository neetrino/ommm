# Pagination — plan

Postrannaya paginaciya dlya spiskov v admin i user account.  
Profile-stranicy (`/admin/profile`, `/user/profile`, coach/manager) — formy, paginaciya ne nuzhna.

**Tekushchee sostoyanie:** UI-komponenta paginacii net. Backend chastichno gotov (`/clients`, `/payments/admin`, `/packages/admin/all`, waitlist `take`).

**Konstanty (predlozhenie):** `DEFAULT_LIST_PAGE_SIZE = 25`, `MAX_LIST_PAGE_SIZE = 100`.  
**URL:** `page` (1-based) + `pageSize` → `offset = (page - 1) * pageSize`. Pri smene filtrov — sbros na `page=1`.

---

## Faza 0 — Obshchaya infrastruktura

- [x] `OmmListPagination` — footer pod spiskom: «Pokazano X–Y iz Z», Prev/Next, nomera stranic
- [x] Opcionalno: vybor razmera stranicy (25 / 50 / 100)
- [x] Helpers: `parseListPageParams`, `buildListPageQuery`, konvertaciya page ↔ offset
- [x] i18n: `adminPages.pagination.*`, `userPages.pagination.*`
- [x] Layout token dlya pagera pod admin/user tablicami

---

## Faza 1 — Quick wins (API uzhe podderzhivaet take/offset)

### Admin Clients — P0
- [x] Stranica: `/admin/clients`
- [x] Peredavat `take` / `offset` iz URL v `buildAdminClientsApiSearchParams`
- [x] `AdminClientsManagement`: render `OmmListPagination` po `payload.pagination`
- [x] Summary cards — po vsem rezultatam (`summary`), ne po tekushchey stranice
- [ ] ⚠️ Pozzhe (Faza 4): API seychas slice v pamyati posle fetch 500 — nuzhna DB-pagination

### Admin Finance — payments — P0
- [x] Stranica: `/admin/finance`
- [x] Tablica platezhey: `offset` iz URL, pokazat `total` iz `FinancePaymentsPayload`
- [x] User finance tab: tot zhe pager dlya spiska klientov + payments sub-list

---

## Faza 2 — Admin tyazhelye spiski (nuzhen backend)

### Admin Bookings — P0
- [x] Stranica: `/admin/bookings`
- [x] API: `GET /bookings/admin/management` — `take`, `offset`, `total` (+ `userId` filter)
- [x] Frontend: paginaciya v list view; calendar views — fetch po diapazonu dat bez paginacii

### Admin Waitlists — P1
- [ ] Stranica: `/admin/waitlists`
- [ ] API: `offset` + `total` (seychas tolko `take=250`)
- [ ] Frontend: pager v `AdminWaitlistManagement`

### Admin Gift cards — P1
- [ ] Stranica: `/admin/gift-cards`
- [ ] API: `take` / `offset` dlya batches (seychas do 500 bez offset)
- [ ] Frontend: `AdminGiftCardsManagement`

### Admin Notifications — P1
- [ ] Stranica: `/admin/notifications`
- [ ] API: paginaciya dlya scheduled (take 200) i deliveries (take do 2000)
- [ ] Frontend: sekcii scheduled + deliveries

### Admin Schedule (list view) — P1
- [ ] Stranica: `/admin/schedule`
- [ ] List view: server pagination ili lazy load po nedelyam
- [ ] Calendar view: ostavit diapazon dat, ne postrannuyu paginaciyu

### Admin Coaches — P1
- [ ] Stranica: `/admin/coaches`
- [ ] API: `take` / `offset` dlya `/coaches/admin/list`
- [ ] Frontend: `AdminCoachesDirectory`

### Admin Finance — coach tab — P2
- [ ] Coach finance tab: paginaciya po spisku trenerov (seychas ves spisok + lokalnyy filtr)

---

## Faza 3 — User account

### User Bookings — P0
- [x] Stranica: `/user/bookings`
- [x] API: `GET /bookings/me?scope=past&take&offset` (+ `scope=upcoming`; legacy `/bookings/me` bez scope)
- [x] Frontend: paginaciya dlya **Past** (Upcoming obychno korotkiy); waitlist — po neobhodimosti

### User Payments — P0
- [x] Stranica: `/user/payments`
- [x] API: rasshirit `listPayments` — metadata `{ items, total, take, offset }` (+ legacy bez take/offset)
- [x] Frontend: `UserPaymentsHistory`

### User Gift cards — P1
- [ ] Stranica: `/user/gift-cards`
- [ ] API: `take` / `offset` na `/gift-cards/me/purchased` i `/me/received`
- [ ] Frontend: `UserGiftCardsBoard` (dva spiska ili obshchiy pager)

### Ne trebuet paginacii (user)
- `/user/profile` — forma
- `/user/notifications` — tolko prefs
- `/user/packages` — obychno malo zapisey
- `/user/progress` — achievements, obychno malo
- `/user/classes` — okno 14 dney (`ACCOUNT_SESSION_RANGE_DAYS`); paginaciya tolko esli rasshirim diapazon

---

## Faza 4 — Detail sheet vlozhennye spiski + API hardening

### Client sheet tabs — P2
- [ ] Bookings tab — API: `take: 100` v include; nuzhny `GET /clients/:id/bookings?take&offset`
- [ ] Payments tab — API: `take: 50`; otdelnyy endpoint s paginaciyey
- [ ] Gifts tab — API: `take: 20` purchased/received; pager vnutri taba

### Coach finance drawer — P2
- [ ] Sessii za mesyac — pager esli > ~50

### Clients API — P0 (tech debt)
- [ ] Perenesti filtraciyu v Prisma; ubrat in-memory slice posle fetch 500
- [ ] `pagination.total` — iz `count`, ne iz `rows.length` posle filter

---

## Faza 5 — Po neobhodimosti

- [ ] Manager: `/manager/clients`, `/manager/bookings`, `/manager/coaches`, `/manager/waitlists`
- [ ] Admin Packages — nizkiy prioritet (katalog obychno mal)
- [ ] Admin Analytics — ne row-list; ostavit sampled disclaimer (`ANALYTICS_BOOKINGS_SAMPLE_LIMIT = 1000`)

---

## Inventar (spravochno)

| Oblast | Stranica / mesto | API seychas | UI seychas | Prioritet |
|--------|------------------|-------------|------------|-----------|
| Admin | `/admin/clients` | take/offset (in-memory) | net | P0 |
| Admin | `/admin/bookings` | do 1000 rows | lokalnyy filtr | P0 |
| Admin | `/admin/finance` payments | take/offset/total | take=100, offset=0 | P0 |
| Admin | `/admin/waitlists` | take=250 | net | P1 |
| Admin | `/admin/gift-cards` | do 500 | lokalnyy filtr | P1 |
| Admin | `/admin/notifications` | do 2000 deliveries | lokalnyy filtr | P1 |
| Admin | `/admin/schedule` list | vse sessii | net | P1 |
| Admin | `/admin/coaches` | bez limita | net | P1 |
| Admin | client sheet tabs | take 100/50/20 | net | P2 |
| User | `/user/bookings` | bez limita | net | P0 |
| User | `/user/payments` | take=100 | net | P0 |
| User | `/user/gift-cards` | bez limita | net | P1 |

---

## Rekomenduemyy poryadok rabot

1. Faza 0 — `OmmListPagination` + URL helpers
2. Faza 1 — Admin Clients + Admin Finance payments
3. Faza 3 — User Bookings + User Payments
4. Faza 2 — Admin Bookings (backend + frontend)
5. Faza 2 — Waitlists, Gift cards, Notifications
6. Faza 4 — Sheet tabs + Clients DB pagination
