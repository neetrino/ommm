# Class type / package booking — հայտնաբերված խնդիրներ և ուղղման պլան

**Ամսաթիվ:** 2026-07-28  
**Կարգավիճակ:** P0/P1 հիմնական ֆիքսերը **կիրառված են** (տես ստորև)  
**Շրջանակ:** ACTIVE package ունեցող հաճախորդների booking eligibility, class type delete/rename, plan allocations

Այս փաստաթուղթը ամփոփում է չատում քննարկված խնդիրները և կատարված ուղղումները։

---

## Համաձայնեցված կանոններ (class type)

| Գործողություն | Կանոն |
|---|---|
| **Rename** | Թույլատրել։ Միայն անունը փոխել, **նույն `classTypeId`**։ |
| **Delete (UI)** | Soft-archive (`archivedAt`)։ Տողը և `id`-ն մնում են։ Sessions, bookings և package balances շարունակում են աշխատել։ Catalog-ում և նոր session-ում archived type չի երևում։ |

**Նշում.** «Ջնջել + նոր class type ստեղծել» rename չէ։ Դա replace է և առանց remap-ի կոտրում է հին գնումները։

---

## Կատարված ուղղումներ (2026-07-28)

### Data repair

One-shot script-ը կիրառվել է 2026-07-28 և ջնջվել է repo-ից (այլևս պետք չէ)։

| Ինչ | Արդյունք |
|---|---|
| Manana missing Reformer Group balance | Ավելացված է 2/2; package 8/8 = balances 8/8 |
| `Reformer Group 16 classes` մեռած allocation id | Remap → live `Reformer Group` id |
| Balance snapshot անուններ | Sync ընթացիկ `ClassType.name`-ի հետ |
| ACTIVE remaining mismatches | **0** |

### Code

| Փոփոխություն | Ֆայլ |
|---|---|
| Purchase՝ missing class type → **BadRequestException** (ոչ silent skip) | `apps/api/src/packages/packages-user-package-balances.util.ts` |
| Delete guards՝ sessions, bookings, waitlist, balances, plan refs | `apps/api/src/classes/classes-types.service.ts` |
| Unit tests | `classes-types.service.spec.ts`, `packages-user-package-balances.util.spec.ts` |

### Այլ

| Ինչ | Կարգավիճակ |
|---|---|
| Finance → Members tab | Հեռացված (Overview / Payments / Coaches) |

---

## Մնացած / ընտրովի

#### `planId = null` ACTIVE packages (4 user, Reformer Group 8)

Booking-ը աշխատում է balances-ով։ Ցանկության դեպքում՝ վերականգնել/կապել plan կամ soft-delete քաղաքականություն։

#### `12 Mat/Power/Yoga Sessions` — անուն vs coverage

Plan-ը ծածկում է միայն Mat Pilates Group։ Product որոշում՝ անուն փոխել կամ allocations ընդլայնել։

#### OVERDUE payment behavior (Clients mapper)

`FAILED` պատմություն → `overdue`, նույնիսկ եթե հետո SUCCEEDED կա։ Members tab-ը հանված է; ուղղել եթե label-ը նորից ցուցադրվի։

---

## Անվտանգության սկզբունքներ

- Վճարումներին / գներին / refund-ին **չդիպչել**
- Session քանակը **պահել** այնքան, ինչի համար վճարել են
- Remap միայն **նույն իմաստի** successor class type-ին

---

## Վերաստուգում (post-fix)

- Manana՝ 4 balances (RG / RI / Mat Ind / Mat Group), յուրաքանչյուրը 2, pkg 8/8  
- Dead plan classType id՝ **0**  
- ACTIVE `sessionsRemaining` vs balances sum mismatch՝ **0**
