# Admin Finance — plan reorganizacii

**UI-pravilo:** pri sborke tabov — tolko sushestvuyushiy admin-dizayn: `AdminPageHero`, `AdminIntegratedSearchFilters`, `AdminContentFrame`, `AdminSectionShell`, `adminChrome`, `OmmListPagination`, `OmmButton`, list-layout tokeny (`admin-*-list-layout.ts`); bez novyh vizualnyh patternov, bez inline styles, bez novyh tokenov bez neobhodimosti — kanon iz `/admin/clients`, `/admin/coaches`, `/admin/bookings`.

Reorganizaciya `/admin/finance` po patternu [NBOS Finance/CRM](https://github.com/neetrino/nbos): **odin hero**, **taby vverhu**, **search + filtry menyayutsya s tabom**, **CSV v trailing**, bez dublej.

Spec: `CRM - Ommm - code.md` §9 (Finance).  
Analytics (`/admin/analytics`) — otdelno (charts/trends); Finance — operacii i dengi.

---

## Tekushchee sostoyanie (problemy)

- Odin dlinnyy page: KPI + gift credits + CSV block + taby vnizu + vtoroy search v tabah.
- **Dva poiska:** verhniy (`AdminFinanceFilters`) i nizhniy (User/Coach tab) — raznaya logika, pутаница.
- Parametr URL `q` v verhnem search **ne podklyuchen** k API (mertvyy).
- **Billing history** prikleena k User tab, filtruetsya verhnimi filtami — neponyatno chto k chemu.
- KPI s **raznymi periodami** bez podpisey (Total = all time, Monthly = calendar month, Pending/… = rangeDays).
- CSV export — otdelnyy blok poseredine stranicy.
- Description v hero dubliruet nav subtitle.
- `finance-payments-table.tsx` — udaleno; lokalnyy `FinancePaymentsTable` v `admin-finance-payments-panel.tsx`.
- Members tab nepolnyy vs spec §9.3 (net Plan / Cost / Expiration).
- Coaches tab — MVP (estimated salary, month ne filtruet API).

---

## Celevaya arhitektura

### 4 taba v hero

| Tab | Zadacha | Kontent | Search + filtry v hero |
|-----|---------|---------|------------------------|
| **Overview** | Analitika za period | KPI, revenue by source, gift credits | **Period** (7 / 30 / 90 / this month). Bez text search. Trailing: Export payments CSV + Export gift credits CSV |
| **Payments** | Zhurnal tranzakciy (billing history §9.1) | Tablica payments, Mark paid / Reject, pagination | **Search:** client, email, payment ID. **Filters:** period, source, status. Trailing: Export payments CSV |
| **Members** | Finansovyy srez klientov (User finance §9.3) | Klienty: plan, cost, expiration, payment status, gift card, actions | **Search:** name, phone, email. **Filters:** payment status, gift card, sort, quick chips |
| **Coaches** | Zarplaty trenerov (Coach finance §9.4) | Coaches + salary, sessions, payout status | **Search:** coach name / phone. **Filters:** month, payout status, sort |

### Vizualnaya skhema

```
┌─────────────────────────────────────────────────────────────┐
│ Finance                                                     │
│ [Overview] [Payments] [Members] [Coaches]                   │
│ ┌──────────────────────────────────────┐ [Export] [Export]  │
│ │ search (menyaetsya po tabu)  Filters│                    │
│ └──────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘

Overview → KPI + revenue by source + gift credits
Payments → payments table + pagination
Members  → client finance table + drawer
Coaches  → coach finance table + sessions drawer
```

### URL (rekomendaciya: routes, kak NBOS)

```
/admin/finance              → redirect → /admin/finance/overview
/admin/finance/overview
/admin/finance/payments
/admin/finance/members
/admin/finance/coaches
```

Query-params dlya filtrov i paginacii — **prefiks po tabu** (ne smeshivat):

| Tab | Query keys (primer) |
|-----|---------------------|
| Overview | `rangeDays` |
| Payments | `rangeDays`, `source`, `status`, `q`, `payPage`, `payPageSize` |
| Members | `q`, `paymentStatus`, `order`, `giftCardOnly`, `quick`, `userPage`, `userPageSize` |
| Coaches | `q`, `month`, `payoutStatus`, `order`, `quick`, `coachPage`, `coachPageSize` |

Pri smene taba — sbros chuzhih query keys (tolko svoi ostayutsya).

Legacy: `/admin/finance?tab=user` → redirect `/admin/finance/members`; `?tab=coach` → `/admin/finance/coaches`.

---

## Faza 0 — Podgotovka i dogovorennosti

- [x] Utverdit 4 taba i imena URL (Overview / Payments / Members / Coaches)
- [x] Utverdit: routes vs odin page + `?tab=` (plan = **routes**)
- [x] Zafiksirovat granicu Finance vs Analytics (ne perenosit charts syuda)

---

## Faza 1 — Layout i routing (P0, tolko UI-skelet)

### 1.1 Finance layout

- [x] `apps/web/src/app/[locale]/(admin)/admin/finance/layout.tsx`
  - `AdminPageHero` s title «Finance»
  - Tab nav: `PageHeroNavLinks` pattern (ili analog na `Link` + active state)
  - Slot dlya tab-specific search (children ili context)
- [x] Redirect `/admin/finance` → `/admin/finance/overview`
- [x] Legacy redirect `?tab=user|coach` → members|coaches

### 1.2 Stranicy tabov

- [x] `finance/overview/page.tsx` — perenesti KPI, revenue by source, gift credits iz tekushchego `page.tsx`
- [x] `finance/payments/page.tsx` — billing history (iz `AdminUserFinanceTab` → otdelnyy komponent)
- [x] `finance/members/page.tsx` — user finance list (bez billing history)
- [x] `finance/coaches/page.tsx` — coach finance tab

### 1.3 Obshchie komponenty

- [x] `admin-finance-tab-nav.tsx` — tab links + i18n
- [x] `admin-finance-hero-filters.tsx` — render raznyh `AdminIntegratedSearchFilters` po aktivnomu tabu
- [x] Razbit `admin-finance-url.ts` na tab-specific parse/build helpers
- [x] Udalit / ne ispolzovat staryy monolit `admin/finance/page.tsx` (posle migracii)

### 1.4 Uborka dublej (v ramkah Fazy 1)

- [x] Ubrat description iz hero (ostavit tolko nav subtitle)
- [x] Ubrat CSV export block poseredine stranicy
- [x] CSV knopki → `trailing` hero (Overview: 2 knopki; Payments: 1 knopka)
- [x] Ubrat vnutrennie search-bary iz Members / Coaches tabov
- [x] Ubrat Billing history iz Members taba (uzhe v Payments)
- [x] ~~Udalit mertvyy `finance-payments-table.tsx`~~ — udaleno / vstroeno v `admin-finance-payments-panel.tsx` (`FinancePaymentsTable`)

---

## Faza 2 — Tab-specific search i filtry (P0)

### Overview

- [x] Hero: tolko `rangeDays` (7 / 30 / 90) + opcionalno «This month»
- [x] Net text search
- [x] Trailing: Export payments CSV, Export gift credits CSV (`from` iz rangeDays)
- [x] Podpisi u KPI: «All time», «This month», «Last N days» — chtoby cifry ne putalis

### Payments

- [x] Hero search `q` → API `/payments/admin` (nuzhen backend: sm. Faza 4)
- [x] Filtry: rangeDays, source, status (kak seychas, no tolko na etom tabe)
- [x] `BillingHistoryTable` / payments table + `OmmListPagination`
- [x] `AdminFinancePaymentActions` (Mark paid / Reject)

### Members

- [x] Hero search → `/clients?search=…&meta=true`
- [x] Filtry: paymentStatus, order, giftCardOnly, quick chips
- [x] Ubrat dubli payment status filtra esli oni est v hero
- [x] `AdminFinanceUserCompactRow` + drawer
- [x] Pagination: `userPage`, `userPageSize`

### Coaches

- [x] Hero search — server (`/coaches/admin/salary-summaries?search=…`)
- [x] Filtry: month, payoutStatus, order, quick chips
- [x] `AdminCoachSessionsDrawer`
- [x] Ostavit informacionnyy banner pro estimated salary (do backend payroll)

---

## Faza 3 — KPI i periody (P1)

- [x] Total revenue — yavno «All time» (ili peremestit na Overview s podpisyu)
- [x] Monthly revenue — «This calendar month»
- [x] Pending / Completed / Refunded — sinhron s `rangeDays` + podpis «Last N days»
- [x] Revenue by source + Gift credits — tot zhe `rangeDays` chto na Overview
- [ ] (Opcionalno) ubrat `dashboardRes.revenueCentsTotal` s Overview esli dubliruet Monthly + range — soglasovat s product

---

## Faza 4 — Backend (P1–P2)

### Payments search

- [x] API `GET /payments/admin` — param `q` (email, name, payment id, description)
- [x] Frontend: peredavat `q` iz hero Payments tab

### Members — polnye kolonki (spec §9.3)

- [x] API `/clients` — v `meta=true` otdavat active package: plan name, cost, expiration (esli net — dobavit v clients.service)
- [x] UI kolonki: Plan, Cost, Expiration (i18n uzhe est v `userTab`)
- [ ] Actions: pause membership, refund request, notification (chastichno est modalki — dovesti do spec)

### Coaches

- [x] API: `GET /coaches/admin/salary-summaries?month=YYYY-MM` — filtr po mesyacu
- [ ] Pagination `/coaches/admin/list` — `take` / `offset` (svyaz s `todo.md` Faza 2 Coaches)
- [x] Coach finance tab: server pagination vmesto lokalnogo filtra

### Clients API hardening (svyaz s todo.md Faza 4)

- [ ] DB pagination vmesto in-memory slice 500

---

## Faza 5 — i18n i docs (P1)

- [x] `adminPages.finance.tabs.overview|payments|members|coaches`
- [x] Tab-specific filter labels / placeholders
- [ ] Ubrat neispolzuemye klyuchi (`exportHeading`, `exportHint` esli block udalen)
- [x] Obnovit `hy.json`, `ru.json`, `en.json`
- [ ] (Opcionalno) kratkaya zametka v `docs/SITE_FULL_ANALYSIS.md` — novaya struktura Finance

---

## Faza 6 — QA i polish (P2)

- [ ] Smena taba: search/filters ne «protekaют» mezhdu tabami
- [ ] Smena filtra: sbros page na 1
- [ ] Sticky hero rabotaet na vseh tabah
- [ ] Mobile: tab nav scroll / wrap
- [ ] A11y: `role="tablist"`, `aria-selected`, aria labels
- [ ] Proverit auth error state na kazhdom tabe
- [ ] Udalit mertvye importy / tipy (`FinanceTab` user|coach → novye tab id)

---

## Inventar faylov (orientir)

| Deystvie | Fayl |
|----------|------|
| Sozdat | `admin/finance/layout.tsx` |
| Sozdat | `admin/finance/overview/page.tsx` |
| Sozdat | `admin/finance/payments/page.tsx` |
| Sozdat | `admin/finance/members/page.tsx` |
| Sozdat | `admin/finance/coaches/page.tsx` |
| Sozdat | `admin-finance-tab-nav.tsx` |
| Sozdat | `admin-finance-hero-filters.tsx` (ili po tabu: `admin-finance-overview-filters.tsx`, …) |
| Refaktor | `admin-finance-url.ts` |
| Refaktor | `admin-finance-management.tsx` → ubrat ili zamenit layoutom |
| Refaktor | `admin-user-finance-tab.tsx` → members content bez billing |
| Refaktor | `admin-coach-finance-tab.tsx` → coaches page content |
| Refaktor | `admin-finance-filters.tsx` → razbit po tabam |
| Udalit? | `admin/finance/page.tsx` (posle migracii) |
| Udalit? | ~~`finance-payments-table.tsx`~~ — done (inline v panel) |

---

## Chto NE delaem v etom plane

- Polnyy payroll backend dlya coaches (otdelnyy epic)
- Perenos Analytics charts na Finance
- Izmenenie `/admin/clients` ili `/admin/coaches` — oni ostayutsya CRM/roster
- User account billing (`/user/payments`) — ne trogaem

---

## Rekomenduemyy poryadok rabot

1. **Faza 0** — utverzhdenie tabov i URL
2. **Faza 1** — layout + 4 stranicy + uborka dublej (mozhno bez novogo backend)
3. **Faza 2** — podklyuchit tab-specific search k sushestvuyushim API
4. **Faza 3** — podpisi KPI / periody
5. **Faza 4** — payments `q`, members kolonki, coaches month + pagination
6. **Faza 5–6** — i18n, QA

---

## Kriterii gotovnosti (DoD)

- [x] Odin search-bar v hero; pri smene taba menyayutsya placeholder, filtry i trailing
- [x] Net vtorogo poiska nad tablicami v Members / Coaches
- [x] Billing history tolko na tabe Payments
- [x] CSV export v hero, ne otdelnym blokom
- [x] `/admin/finance?tab=*` redirect na novye URL
- [x] Vse 3 locale obnovleny
- [x] Net mertvogo `q` bez effekta (libo rabotaet na Payments, libo ubran)
