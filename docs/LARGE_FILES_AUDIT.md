# Ommm — մեծ կոդային ֆայլերի աուդիտ

**Ամսաթիվ:** 2026-07-02  
**Թարմացում:** 2026-07-02 — բոլոր 400+ ֆայլերը բաժանվել են  
**Նպատակ:** ամբողջ պրոյեկտի կոդային բազայի սկանավորում և **400+ տող** ունեցող ֆայլերի ամբողջական ցանկ։

> **Կարգավիճակ.** Ռեֆակտորինգից հետո **0** կոդային ֆայլ ≥ 400 տող (սկան 2026-07-02)։ Ստորև՝ նախնական աուդիտի արդյունքները պատմական տեսքով։

---

## Մեթոդաբանություն

Սկանավորվել են բոլոր կոդային ֆայլերը հետևյալ ընդլայնումներով.

| Ընդլայնում | Նկարագրություն |
|-------------|----------------|
| `.ts`, `.tsx` | TypeScript / React |
| `.js`, `.jsx`, `.mjs`, `.cjs` | JavaScript |
| `.css`, `.scss` | Ստիլեր |
| `.sql` | Prisma միգրացիաներ |
| `.prisma` | DB սխեմա |

**Բացառված թղթապանակներ** (կոդ չեն համարվում կամ գեներացված են).  
`node_modules/`, `dist/`, `.next/`, `build/`, `coverage/`, `.turbo/`, `.git/`, `android/`, `ios/`, `.expo/`

**Չի ներառվել.** Markdown, JSON կոնֆիգներ, lock-ֆայլեր, `.env`, թեստի արտածումներ (`test-results/`, `playwright-report/`), `uploads/` — դրանք կոդային ֆայլեր չեն։

---

## Պրոյեկտի ամփոփում

**Ommm** — monorepo (`apps/web`, `apps/api`, `apps/mobile`, `packages/database`), feature-based կառուցվածք։

| Մետրիկա | Արժեք |
|---------|-------|
| Սկանավորված կոդային ֆայլեր | **1 477** |
| Ընդհանուր տողեր (կոդ) | **127 613** |
| Ֆայլեր ≥ 400 տող | **39** |
| Ֆայլեր 300–399 տող | **30** |
| Ֆայլեր 200–299 տող | **75** |
| Ֆայլեր 100–199 տող | **267** |
| Ֆայլեր &lt; 100 տող | **1 066** |

### Ըստ հավելվածի / package-ի

| Գոտի | Ֆայլեր | Տողեր |
|------|--------|-------|
| `apps/web` | 1 096 | 94 019 |
| `apps/api` | 217 | 22 382 |
| `apps/mobile` | 99 | 7 864 |
| `packages` | 61 | 3 212 |
| `scripts` | 2 | 103 |
| արմատ | 2 | 33 |

### Ըստ ընդլայնման

| Ընդլայնում | Ֆայլեր | Տողեր |
|-------------|--------|-------|
| `.tsx` | 674 | 66 125 |
| `.ts` | 670 | 49 428 |
| `.css` | 73 | 10 118 |
| `.sql` | 46 | 1 097 |
| `.prisma` | 1 | 583 |
| `.mjs` / `.cjs` / `.js` | 13 | 262 |

---

## Ֆայլեր ≥ 400 տող — ամբողջական ցանկ (39)

Պրոյեկտի կանոններում (`00-core.mdc`) նշված է **ֆայլ ≤ 300 տող** — ստորև բոլոր խախտողները (400+)։

| # | Տողեր | Ֆայլ | Գոտի | Տիպ |
|---|-------|------|------|-----|
| 1 | 1 569 | `apps/web/src/components/admin/admin-schedule-management.tsx` | web | Admin UI — ժամանակացույցի կառավարում |
| 2 | 1 471 | `apps/web/src/app/globals.css` | web | Գլոբալ CSS / դիզայն-տոկեններ |
| 3 | 1 169 | `apps/api/src/gift-cards/gift-cards.service.ts` | api | NestJS service — նվեր քարտեր |
| 4 | 1 115 | `apps/api/src/bookings/bookings.service.ts` | api | NestJS service — ամրագրումներ |
| 5 | 1 102 | `apps/web/src/components/marketing/home/marketing-public-home-footer.module.css` | web | Marketing CSS module |
| 6 | 1 089 | `apps/api/src/coaches/coaches.service.ts` | api | NestJS service — մարզիչներ |
| 7 | 962 | `apps/api/src/notifications/notifications.service.ts` | api | NestJS service — ծանուցումներ |
| 8 | 945 | `apps/api/src/reports/reports.service.ts` | api | NestJS service — հաշվետվություններ |
| 9 | 869 | `apps/api/src/packages/packages.service.ts` | api | NestJS service — փաթեթներ |
| 10 | 863 | `apps/web/src/components/admin/admin-package-form.tsx` | web | Admin UI — փաթեթի ձև |
| 11 | 855 | `apps/api/src/payments/payments.service.ts` | api | NestJS service — վճարումներ |
| 12 | 847 | `apps/web/src/components/admin/admin-packages-management.tsx` | web | Admin UI — փաթեթների կառավարում |
| 13 | 844 | `apps/web/src/components/marketing/packages/packages-page-accordion.tsx` | web | Marketing UI — փաթեթների էջ |
| 14 | 775 | `apps/web/src/components/marketing/marketing-site-header-nav-pill.module.css` | web | Marketing CSS module |
| 15 | 769 | `apps/web/src/components/admin/admin-bookings-management.tsx` | web | Admin UI — ամրագրումների կառավարում |
| 16 | 754 | `apps/api/src/classes/classes.service.ts` | api | NestJS service — դասեր |
| 17 | 753 | `apps/api/src/clients/clients.service.ts` | api | NestJS service — հաճախորդներ |
| 18 | 683 | `apps/web/src/components/admin/admin-create-coach-form.tsx` | web | Admin UI — մարզիչ ստեղծում |
| 19 | 634 | `apps/web/src/components/marketing/packages/packages-page-accordion.module.css` | web | Marketing CSS module |
| 20 | 607 | `apps/web/src/components/ui/dropdown-select.tsx` | web | Shared UI — dropdown |
| 21 | 583 | `packages/database/prisma/schema.prisma` | packages | Prisma DB սխեմա |
| 22 | 569 | `apps/api/src/packages/package-usage.service.ts` | api | NestJS service — փաթեթի օգտագործում |
| 23 | 528 | `apps/api/src/waitlist/waitlist.service.ts` | api | NestJS service — սպասացուցակ |
| 24 | 528 | `apps/web/src/components/admin/admin-clients-management.tsx` | web | Admin UI — հաճախորդներ |
| 25 | 516 | `apps/api/src/content/content.service.ts` | api | NestJS service — բովանդակություն |
| 26 | 486 | `apps/web/src/components/shared/search/integrated-search-filters.tsx` | web | Shared UI — որոնում/ֆիլտրեր |
| 27 | 486 | `apps/web/src/components/admin/admin-schedule-form.tsx` | web | Admin UI — ժամանակացույցի ձև |
| 28 | 480 | `apps/web/src/components/marketing/schedule/marketing-schedule-view.tsx` | web | Marketing UI — ժամանակացույց |
| 29 | 469 | `apps/web/src/components/admin/admin-waitlist-management.tsx` | web | Admin UI — սպասացուցակ |
| 30 | 463 | `apps/mobile/src/features/home/components/NextClassSection.tsx` | mobile | Mobile UI — հաջորդ դաս |
| 31 | 457 | `apps/api/src/users/users.service.ts` | api | NestJS service — օգտատերեր |
| 32 | 448 | `apps/web/src/components/admin/admin-finance-url.ts` | web | Admin — ֆինանսների URL/հելպերներ |
| 33 | 432 | `apps/web/src/components/ui/date-picker-input.tsx` | web | Shared UI — ամսաթվի ընտրիչ |
| 34 | 428 | `apps/web/src/hooks/use-session-booking.tsx` | web | Hook — սեսիայի ամրագրում |
| 35 | 427 | `apps/web/src/components/admin/admin-create-gift-card-form.tsx` | web | Admin UI — նվեր քարտ |
| 36 | 425 | `apps/mobile/src/features/home/components/ExploreSection.tsx` | mobile | Mobile UI — explore բաժին |
| 37 | 416 | `apps/web/src/components/admin/admin-notifications-scheduled-section.tsx` | web | Admin UI — ծանուցումներ |
| 38 | 413 | `apps/web/src/components/account/account-profile-info-form.tsx` | web | Account UI — պրոֆիլ |
| 39 | 409 | `apps/web/src/components/marketing/marketing-site-header.tsx` | web | Marketing UI — header |

---

## Խմբավորում ըստ գոտու (≥ 400 տող)

| Գոտի | Ֆայլերի քանակ | Ընդհանուր տողեր (միայն այս ցանկից) |
|------|----------------|--------------------------------------|
| `apps/web` | 25 | 15 892 |
| `apps/api` | 12 | 9 406 |
| `apps/mobile` | 2 | 888 |
| `packages` | 1 | 583 |

## Խմբավորում ըստ տիպի (≥ 400 տող)

| Տիպ | Ֆայլեր |
|-----|--------|
| React/TSX կոմպոնենտներ և hooks | 22 |
| NestJS `*.service.ts` | 12 |
| CSS / CSS modules | 4 |
| Prisma schema | 1 |

---

## API — մեծ service ֆայլեր (բոլորը ≥ 400 տող)

| Տողեր | Service |
|-------|---------|
| 1 169 | `gift-cards.service.ts` |
| 1 115 | `bookings.service.ts` |
| 1 089 | `coaches.service.ts` |
| 962 | `notifications.service.ts` |
| 945 | `reports.service.ts` |
| 869 | `packages.service.ts` |
| 855 | `payments.service.ts` |
| 754 | `classes.service.ts` |
| 753 | `clients.service.ts` |
| 569 | `package-usage.service.ts` |
| 528 | `waitlist.service.ts` |
| 516 | `content.service.ts` |
| 457 | `users.service.ts` |

**Դիտարկում.** API-ի ամենամեծ ֆայլերի մեծ մասը domain service-ներ են — հավանական ռեֆակտորինգի թիրախ՝ controller/DTO-ից բացի բիզնես-լոգիկայի բաժանում փոքր մոդուլների կամ feature-ֆայլերի։

---

## Web — ամենամեծ UI ֆայլեր (≥ 400 տող, առանց CSS)

| Տողեր | Կոմպոնենտ / hook |
|-------|-------------------|
| 1 569 | `admin-schedule-management.tsx` |
| 863 | `admin-package-form.tsx` |
| 847 | `admin-packages-management.tsx` |
| 844 | `packages-page-accordion.tsx` |
| 769 | `admin-bookings-management.tsx` |
| 683 | `admin-create-coach-form.tsx` |
| 607 | `dropdown-select.tsx` |
| 528 | `admin-clients-management.tsx` |
| 486 | `integrated-search-filters.tsx` |
| 486 | `admin-schedule-form.tsx` |
| 480 | `marketing-schedule-view.tsx` |
| 469 | `admin-waitlist-management.tsx` |
| 448 | `admin-finance-url.ts` |
| 432 | `date-picker-input.tsx` |
| 428 | `use-session-booking.tsx` |
| 427 | `admin-create-gift-card-form.tsx` |
| 416 | `admin-notifications-scheduled-section.tsx` |
| 413 | `account-profile-info-form.tsx` |
| 409 | `marketing-site-header.tsx` |

**CSS (≥ 400).** `globals.css` (1 471), `marketing-public-home-footer.module.css` (1 102), `marketing-site-header-nav-pill.module.css` (775), `packages-page-accordion.module.css` (634).

---

## Mobile (≥ 400 տող)

| Տողեր | Ֆայլ |
|-------|------|
| 463 | `src/features/home/components/NextClassSection.tsx` |
| 425 | `src/features/home/components/ExploreSection.tsx` |

Mobile-ում մեծ ֆայլերի քանակը փոքր է՝ ընդհանուր 99 կոդային ֆայլի դեմ։

---

## Լրացուցիչ — 300–399 տող (30 ֆայլ)

Կանոնի սահմանին մոտ, բայց դեռ **չեն** հատել 400-ը. ապագա ռեֆակտորինգի համար օգտակար։

| Տողեր | Ֆայլ |
|-------|------|
| 391 | `apps/web/src/components/marketing/home/home-gallery-mosaic-carousel.tsx` |
| 387 | `apps/web/src/components/account/user-bookings-section.tsx` |
| 386 | `apps/web/src/components/admin/admin-packages-shell.tsx` |
| 380 | `apps/web/src/components/admin/admin-coach-edit-form.use.ts` |
| 380 | `apps/web/src/components/marketing/home/marketing-public-home-coaches-carousel.tsx` |
| 379 | `apps/web/src/components/marketing/coaches/coaches-page-coach-card.module.css` |
| 374 | `apps/web/src/components/marketing/home/home-footer-section-tokens.ts` |
| 372 | `apps/web/src/components/admin/admin-coach-sheet-tab-panels.tsx` |
| 371 | `apps/web/src/components/account/package-subscribe-payment-modal.tsx` |
| 369 | `apps/web/src/components/marketing/home/gift-card-droplets.tsx` |
| 366 | `apps/web/src/components/shell/dashboard-app-shell.tsx` |
| 364 | `apps/web/src/components/admin/admin-client-sheet-tab-panels.tsx` |
| 348 | `apps/web/src/components/admin/admin-client-drawer.tsx` |
| 331 | `apps/web/src/components/admin/admin-create-client-form.tsx` |
| 327 | `apps/web/src/components/shell/header-notifications-menu.tsx` |
| 327 | `apps/web/src/components/admin/admin-gift-card-actions.tsx` |
| 327 | `packages/database/prisma/migrations/00000000000000_init/migration.sql` |
| 324 | `apps/web/src/components/admin/admin-bookings-query.ts` |
| 323 | `apps/api/src/notifications/notifications.service.spec.ts` |
| 320 | `apps/web/src/components/marketing/marketing-site-header-layout.ts` |
| 320 | `apps/web/src/components/ui/omm-filter-multi-select.tsx` |
| 319 | `apps/web/src/components/account/user-payments-history.tsx` |
| 316 | `apps/mobile/app/(auth)/register.tsx` |
| 315 | `apps/web/src/components/account/user-package-lifecycle-actions.tsx` |
| 310 | `apps/web/src/components/admin/admin-booking-details-sheet.tsx` |
| 310 | `apps/web/src/components/admin/admin-package-category-select.tsx` |
| 305 | `apps/api/src/reports/reports.service.spec.ts` |
| 302 | `apps/mobile/src/features/home/components/WaitlistSection.tsx` |
| 300 | `apps/web/src/components/marketing/home/home-hero-banner-tokens.ts` |
| 300 | `apps/web/src/components/marketing/home/marketing-public-home-footer.tsx` |

---

## Եզրակացություն

1. **1 477** կոդային ֆայլ է սկանավորվել — բաց թողնված չէ ոչ մի project source ֆայլ նշված ընդլայնումներով։
2. **39 ֆայլ** (2.6%) գերազանցում է **400 տող** սահմանը; ամենամեծը՝ `admin-schedule-management.tsx` (**1 569** տող)։
3. Խոշորագույն կենտրոնացումը **`apps/web`**-ում է (25/39), հատկապես **admin** և **marketing** UI։
4. **`apps/api`**-ում 12 service ֆայլ ≥ 400 տող — հիմնական backend ռեֆակտորինգի թիրախ։
5. **`apps/mobile`**-ը համեմատաբար կոմպակտ է (միայն 2 ֆայլ ≥ 400)։
6. **`schema.prisma`** (583 տող) — սովորական մեծ monolith schema; միգրացիաներից միայն `init` migration-ը մոտ է 300-ին (327)։

---

*Աուդիտը գեներացված է ավտոմատ տողերի հաշվարկով (PowerShell `Get-Content` + `Measure-Object -Line`)՝ 2026-07-02:*
