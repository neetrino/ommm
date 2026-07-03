# Նախավաճառքի օր — պատրաստության պլան

**Նպատակ:** 25,000+ այցելություն մեկ օրվա ընթացքում, **ճիշտ 100 package նախավաճառք**, առանց oversell, առանց կայքի crash, admin-ում վստահելի live վաճառքի հաշվառում։

**Կարգավիճակ:** Planning / pre-implementation  
**Կապված docs:** [`PACKAGES_SCHEDULE_UAT_ROLLOUT_CHECKLIST.md`](./PACKAGES_SCHEDULE_UAT_ROLLOUT_CHECKLIST.md), [`SSE_REALTIME_IMPLEMENTATION.md`](./SSE_REALTIME_IMPLEMENTATION.md), [`DEPLOY_ENV_PLACEMENT.md`](./DEPLOY_ENV_PLACEMENT.md)

---

## 1. Եզրակացություն (կարճ)

| Հարց | Այս պահին | Պետք է լինի նախավաճառքից առաջ |
|------|-----------|-------------------------------|
| 25k մարդ կկարդա marketing էջերը | ✅ Cache-ով հավանական է դիմանա | Infra checklist (§3) |
| Կայքը կկոտրվի | ⚠️ Crash հազվագյուտ; latency spike հնարավոր | Cloudflare + Redis + API tier |
| Բոլորը կարողանան գրանցվել | ⚠️ Միջինում այո; պիկում throttle risk | Auth tuning (§5) |
| Ճիշտ 100 package կվաճառվի | ❌ **Հիմա inventory limit չկա** | Code + DB (§4) — **P0** |
| Admin-ում վաճառքը «միանգամից» երևա | ❌ Package presale SSE event չկա | Admin live counter (§6) |
| Home-ում թիվ ցուցադրել | ➖ Պետք չէ (որոշված է) | — |

**Կարևոր:** Millisecond real-time **չենք ստանում** և **չի պետք է promise անենք**։ Արդյունավետ նպատակը՝ admin-ում **1–3 վայրկյան内** թարմացում SSE + debounced refetch-ով, իսկ վճարման correctness-ը՝ **DB transaction + atomic inventory**։

---

## 2. Ինչ ունենք հիմա (կոդի իրականություն)

### 2.1 Լավ աշխատող մասեր

- **Marketing read traffic:** Next.js ISR (`PUBLIC_REVALIDATE_SEC = 60`) + API Redis cache (`schedule`, `coaches`, `packages`, `studio`).
- **Gift card limited stock:** atomic `updateMany` + `availableQuantity: { decrement: 1 }` — oversell-safe pattern (`payments-fulfillment.service.ts`).
- **Drop-in payment fulfillment:** capacity check transaction-ի **ներսում** (`fulfillDropInPayment`).
- **SSE:** schedule/session/cancel-intent public channel; authenticated channel admin/user events-ի համար.
- **API throttle:** global `120 req / 60s / IP` (`ThrottlerModule`).
- **Vercel cron:** API warm-up յուրաքանչյուր 14 րոպե (`/api/cron/warm-api`).

### 2.2 Խնդիրներ (նախավաճառքի համար)

#### A. Package subscribe — inventory չկա

`POST /v1/packages/me/subscribe` (`packages-public.service.ts`):

- Ստուգում է միայն `plan.isActive` և `priceCents > 0`.
- **`maxSales` / `availableQuantity` դաշտ չկա** `PackagePlan` schema-ում.
- Concurrent 200 գնորդ → theoretically 200 `UserPackage` + `Payment` կարող է ստեղծվել.

#### B. Ե՞րբ հաշվենք «վաճառված»

Card flow-ում.

1. `subscribe` → `UserPackage` **PENDING** + `Payment` **PENDING**
2. Arca callback → `confirmPendingCardPayment` → `UserPackage` **ACTIVE**

**Ճիշտ inventory decrement-ը պետք է լինի payment SUCCEEDED-ի պահին**, ոչ թե subscribe սկզբում (այլապես pending checkout-ները կպահեն տեղեր)։

#### C. Session booking race (եթե նախավաճառքը session capacity-ով է)

`bookings-client.service.ts` — capacity check transaction-ից **դուրս** է։ Session-based presale-ի դեպքում oversell risk կա (տե՛ս §4.4)։

#### D. Admin live presale counter — չկա

`REALTIME_EVENT_NAMES`-ում կա `dashboard.invalidate`, բայց package presale-ի համար dedicated event + admin UI counter **դեռ implement չէ**։

---

## 3. Infrastructure checklist (պատվավոր օրից առաջ)

### 3.1 Production env — պարտադիր

| Env | Որտեղ | Նպատակ |
|-----|--------|--------|
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | Render (Nest API) | Public read cache → DB load ↓ |
| `DATABASE_URL` (Neon **pooled**) | Render API | Connection pooling |
| `DATABASE_CONNECTION_LIMIT` | Render API | Օր. `10` (Neon plan-ին համաձայն) |
| `CRON_SECRET` | Vercel | API warm cron |
| `API_INTERNAL_URL` | Vercel | Server-side Nest proxy |
| `NEXT_PUBLIC_API_ORIGIN` | Vercel | Browser SSE + client API |

### 3.2 Hosting tiers (minimum)

| Service | Minimum | Ինչու |
|---------|---------|------|
| **Vercel** (web) | Pro կամ բավարար bandwidth | 25k SSR/cache hit |
| **Render** (API) | ≥512MB–1GB RAM | SSE + booking/payment spike |
| **Neon** | Compute ոչ sleep / adequate CU | Transaction spike |
| **Cloudflare** | WAF + CDN դիմաց | DDoS, edge cache, rate limit |

### 3.3 Cloudflare (խորհուրդ — §3 optional բայց strong P0 ops-ի համար)

- TLS + HNS
- Rate limit auth endpoints (`/v1/auth/register`, `/v1/auth/login`) — բարձր threshold, bot challenge
- Cache static assets + `Cache-Control` public API reads որտեղ հնարավոր է
- **Չcache անել** `POST` checkout / subscribe / payment callback

### 3.4 Մոնիտորինգ (պատվավոր օրը)

- Neon: connections, CPU, slow queries
- Render: memory, restarts, 5xx rate
- Vercel: function duration, errors
- API logs: `429`, `503`, payment confirm failures, inventory `out of stock`
- Upstash: hit rate

### 3.5 Go / No-Go (T-24h)

- [ ] Redis cache hit rate >80% staging load test-ում
- [ ] `GET /v1/health` stable, cron warm works
- [ ] Arca sandbox + production callback URL verified
- [ ] §8 load test passed
- [ ] Admin presale counter tested with 2 browsers
- [ ] Rollback plan written (§10)

---

## 4. Package presale — 100 հատ, zero oversell (P0 code)

### 4.1 DB schema

Ավելացնել `PackagePlan`-ին (կամ առանձին `PackagePresaleBatch` table — եթե մի plan-ը միշտ general է, presale-ը event-specific):

**Տարբերակ A (պարզ)** — plan-ի վրա:

```prisma
// packages/database/prisma/models/package.prisma
model PackagePlan {
  // ... existing fields
  presaleTotalQuantity     Int?   // null = unlimited (նախկին վարք)
  presaleAvailableQuantity Int?   // null = unlimited; sync with total on create
}
```

**Invariant:** `presaleAvailableQuantity` միշտ `>= 0`, `<= presaleTotalQuantity`.

Admin panel-ում ցուցադրել `sold / total` = `(total - available) / total`.

### 4.2 Atomic decrement (պարտադիր pattern)

Gift card-ի նման — **միայն payment success transaction-ի ներսում**:

```typescript
// Conceptual — implement in packages fulfillment path
const decremented = await tx.packagePlan.updateMany({
  where: {
    id: planId,
    presaleAvailableQuantity: { gt: 0 },
    isActive: true,
  },
  data: { presaleAvailableQuantity: { decrement: 1 } },
});
if (decremented.count !== 1) {
  throw new BadRequestException('Presale package is sold out');
}
```

**Կարևոր կանոններ:**

1. **Չdecrement անել** `subscribe`-ի PENDING ստեղծման պահին.
2. **Decrement անել** `confirmPayment` / Arca success → `fulfillPackagePayment` path-ում, **նախքան** `UserPackage` → `ACTIVE`.
3. Եթե decrement fail (sold out) — payment-ը **չconfirm անել** / refund flow (Arca) — սա P0 business ops decision, document in runbook.
4. Pending payments sold out դեպքում — user-ին clear error + admin-ում pending list.

### 4.3 Subscribe path — նախնական gate

`subscribe`-ում (նախքան PENDING ստեղծելը) արագ read check.

```typescript
if (plan.presaleAvailableQuantity !== null && plan.presaleAvailableQuantity <= 0) {
  throw new BadRequestException('Presale sold out');
}
```

Սա միայն UX gate է — **իրական պաշտպանությունը միայն atomic decrement-ն է** confirm-ի ժամանակ։

### 4.4 Եթե նախավաճառքը session 100 տեղ է (ոչ package)

Պարտադիր fix `bookings-client.service.ts` `book()`-ում.

- Capacity `count` **transaction ներսում**, create-ից առաջ (ինչպես `fulfillDropInPayment`).
- Կամ `SELECT ... FOR UPDATE` session row-ի վրա.

Առանց սրա — session presale-ում oversell risk։

### 4.5 Cache invalidation

Package presale sell-ից հետո.

- `invalidatePublicPlansCache()` — marketing plans list
- Նոր SSE event (§6) — admin counter

### 4.6 Arca / card edge cases

| Սցենար | Ակնկալվող վարք |
|--------|----------------|
| 100-րդ վճարում success | decrement OK, ACTIVE |
| 101-րդ concurrent success | decrement `count=0` → error, payment չի finalize |
| User սկսեց checkout, sold out while on Arca | Callback-ում fail gracefully, redirect failed |
| Duplicate callback | `PaymentStatus` idempotency — արդեն կա `ConflictException` pending-only |

---

## 5. Գրանցում և login (25k այցելություն)

### 5.1 Ինչ ունենք

- `POST /v1/auth/register`, `POST /v1/auth/login` — **Throttle ON** (120 req/min/IP).
- Email uniqueness → `ConflictException` (նորմալ).
- Google OAuth path — առանձին load.

### 5.2 Ռիսկեր

| Ռիսկ | Երբ | Լուծում |
|------|-----|--------|
| `429 Too Many Requests` | Պիկում շատ register/login նույն office/WiFi IP-ից | Cloudflare rate limit + `@SkipThrottle()` **միայն** register/login-ի համար **բարձր** custom limit, կամ IP+user composite |
| DB pressure register spike | 1000+ register/10min | Neon pooler, index on `User.email` (կա) |
| Email delivery delay | verify email | Նախավաճառքում **չպահանջել email verify** գնման համար, եթե business թույլ է |

### 5.3 Խորհուրդներ (առանց UX փչացնելու)

- [ ] **P1:** Register/login-ի համար առանձին throttle profile (օր. 30 req/min/IP բավարար է bot protection-ի համար, բայց shared NAT-ը չսեղմի)
- [ ] **P1:** Google OAuth button prominent — նվազեցնում է register API load
- [ ] **P0:** Staging-ում simulate 50 concurrent register
- [ ] **Ops:** Պատվավոր օրը monitor `429` on `/auth/*`

### 5.4 «Բոլորը հանգիստ կգրանցվե՞ն»

**Այո, միջին օրվա spread-ով** — 25k այցելություն ≠ 25k միաժամանակյա register.

Եթե բոլորը **նույն րոպեին** (օր. 10:00 բացում) register + buy են անում.

- Infrastructure-ը կդիմանա
- Throttle + queue feeling հնարավոր է **մի քանի IP-ների** վրա
- **Լուծում:** §5.3 + Cloudflare

---

## 6. Admin live counter — «զգացվի» վաճառվածը

### 6.1 Ինչ է պետք (պահանջ)

- Home-ում թիվ **չենք ցուցադրում** ✅
- Admin էջում տեսնում ենք `վաճառված / 100` և վստահ ենք, որ payment-ները correct են
- Թարմացում **արագ**, բայց ոչ millisecond

### 6.2 Ինչ չունենք հիմա

- Package presale inventory դաշտեր
- Admin API endpoint `GET /v1/packages/admin/presale-stats` (կամ plan detail-ում embed)
- SSE event, օր. `presale.changed` կամ reuse `dashboard.invalidate`
- Admin UI component + `useRealtimeRefetch`

### 6.3 Նախատեսված իրականացում

```
Payment SUCCEEDED (package)
  → atomic decrement presaleAvailableQuantity
  → emitPrivate/admin: presale.changed { planId, sold, remaining, total }
  → Admin browser (authenticated SSE)
  → debounced refetch presale stats (300–500ms debounce)
  → UI updates sold count
```

**Latency ակնկալիք:** SSE heartbeat 30s max worst case; event-driven path **~0.5–2s** admin UI-ում։

**Չpromise անել** «միլիվայրկյանով» — ցանց, Arca redirect, debounce, React render։

### 6.4 Admin verification panel (P0)

Admin-ում ցուցադրել.

| Դաշտ | Աղբուր |
|------|--------|
| Presale sold | `total - presaleAvailableQuantity` |
| Presale remaining | `presaleAvailableQuantity` |
| Successful package payments (today) | `Payment` where `source=PACKAGE`, `status=SUCCEEDED`, filter plan |
| Pending checkouts | `Payment PENDING` count — ops alert եթե շատ |

**Cross-check rule:** `sold` պետք է համընկնի `SUCCEEDED` package payments count-ի հետ (±0)։

---

## 7. Traffic map — որտեղ շատ load կլինի

| Շերտ | Endpoint / path | Load տեսակ | Պաշտպանություն |
|------|-----------------|------------|----------------|
| CDN/Vercel | `/[locale]`, `/[locale]/package` | Read | ISR + Redis |
| Nest public | `GET /schedule/public`, `GET /packages/plans` | Read | Redis TTL |
| Nest SSE | `GET /realtime/public` | Long-lived | Max 5/IP; home+schedule only |
| Nest auth | `POST /auth/register`, `/login` | Write burst | Throttle + CF |
| Nest presale | `POST /packages/me/subscribe` | Write burst | Inventory + throttle |
| Nest payment | Arca callback | Write | Idempotent confirm |
| Neon | Payment confirm tx | DB write | Pool + atomic decrement |

**Կայք չի «տրաքի»** եթե read path-ը cache-ված է և write path-ը 100 transaction է, ոչ 25,000։

---

## 8. Pre-launch testing (պարտադիր)

### 8.1 Inventory correctness

- [ ] 100 sequential card purchases → `presaleAvailableQuantity = 0`
- [ ] 101-րդ purchase → rejected, payment not SUCCEEDED
- [ ] 50 concurrent purchase attempts (script) → **exactly** 100 success, rest sold out
- [ ] Duplicate Arca callback → no double decrement
- [ ] Admin sold count matches DB

### 8.2 Registration burst

- [ ] 20 parallel register (unique emails) → all 201
- [ ] Same email twice → 409 Conflict
- [ ] Monitor no `429` at expected load (adjust throttle if needed)

### 8.3 Read load (optional k6/artillery)

- [ ] 500 VUs GET home + packages for 5 min → p95 < 2s, error < 1%

### 8.4 Admin realtime

- [ ] Browser A: admin presale page open
- [ ] Browser B: complete purchase
- [ ] Browser A: counter updates within 3s

---

## 9. Implementation backlog (կարգավորված)

### P0 — Blocker (առանց սրա NO-GO)

| # | Task | Owner | Files / area |
|---|------|-------|----------------|
| 1 | Add `presaleTotalQuantity` + `presaleAvailableQuantity` to schema + migration | Backend | `package.prisma` |
| 2 | Atomic decrement on package payment confirm | Backend | `payments-fulfillment.service.ts`, `packages-public.service.ts` |
| 3 | Sold-out gate on subscribe (UX) | Backend | `packages-public.service.ts` |
| 4 | Admin presale stats API | Backend | `packages.controller.ts`, admin service |
| 5 | Admin UI sold/remaining counter | Web | admin packages area |
| 6 | SSE `presale.changed` + admin refetch | API + Web | `realtime.types.ts`, admin component |
| 7 | Production Redis + pooler verified | Ops | Render/Vercel env |
| 8 | §8.1 concurrent test passed | QA | script / staging |

### P1 — Strongly recommended

| # | Task | Նշում |
|---|------|-------|
| 9 | Auth throttle tuning for presale day | `@SkipThrottle` or custom limit |
| 10 | Cloudflare WAF + rate limits | Perimeter |
| 11 | Pending payment admin alert | Ops visibility |
| 12 | Session booking in-tx capacity (եթե session presale էլ կա) | `bookings-client.service.ts` |

### P2 — Nice to have

| # | Task |
|---|------|
| 13 | Load test report archived |
| 14 | Presale runbook printed for ops |
| 15 | Post-mortem template |

---

## 10. Պատվավոր օրվա runbook

### T-1h

- [ ] Verify Redis, Neon, API health
- [ ] Admin presale page open on 2 devices
- [ ] `presaleAvailableQuantity = 100` confirmed in DB/admin
- [ ] Arca production mode on

### T-0 (բացում)

- [ ] Monitor Render logs + Neon dashboard
- [ ] Watch admin sold counter
- [ ] Եթե `429` spike → check Cloudflare/throttle

### Sold out (remaining = 0)

- [ ] Plan `isActive = false` կամ presale flag off (manual ops)
- [ ] Verify no new SUCCEEDED payments
- [ ] Public UI shows sold out / inactive (cache bust)

### Incident

| Symptom | Action |
|---------|--------|
| API 503 | Check Neon connections; scale Render |
| sold > 100 in DB | **STOP** presale; ops + dev; audit payments |
| Admin counter stale | Check SSE; manual refresh; API stats endpoint |
| Arca errors | Check Arca status; pause marketing CTA |

---

## 11. ՀՏՀ — հաճախակի հարցեր

### «Կայքը millisecond-ով update կլինի՞»

**Ոչ** որպես երաշխիք։ Schedule-ի համար SSE արդեն կա (վայրկյաններ)։ Package presale admin counter-ը պետք է **կառուցենք** (§6) — ակնկալիք **1–3 վայրկյան**, ոչ ms։

### «100 package, 25,000 մարդ — կդիմանա՞»

**Այո**, եթե P0 tasks-ը արված են։ 24,900-ը read-only են; critical path-ը 100 successful payment transaction է։

### «Գրանցում կարգին է՞»

**Միջինում այո**։ Պիկի համար §5.3 tuning խորհուրդ է տրված։

### «Ոչ մի սխալ oversell»**

**Հիմա չի երաշխավորվում** — package-ում inventory չկա։ **Երաշխավորվում է** միայն §4.2 atomic decrement-ից հետո + §8.1 test-ից հետո։

---

## 12. Sign-off

| Role | Name | Date | GO / NO-GO |
|------|------|------|------------|
| Product / Ops | | | |
| Backend | | | |
| Web | | | |
| QA | | | |

**NO-GO եթե:** §8.1 concurrent test fail, Redis off in prod, presale inventory code not deployed.

---

*Վերջին թարմացում: 2026-07-03*
