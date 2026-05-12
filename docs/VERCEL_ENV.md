# Vercel environment variables (`apps/web`)

## Պարզ ասած (ինչու են պետք երեքը)

Պատկերացրու՝ **կայքը** Vercel-ի վրա է, **API-ն ու բազան**՝ ուրիշ տեղ (օր. առանձին սերվեր)։

1. **`NEXT_PUBLIC_SITE_URL`** — «քո կայքի հասցեն ինչ է ինտերնետում»։ Օգտագործվում է, երբ սերվերը կամ կոդը պետք է գրի ամբողջական հղում (օր. absolute URL)։ Օրինակ՝ `https://ommm.com`։

2. **`NEXT_PUBLIC_API_URL`** — «բրաուզերը API-ին որտեղից է տեսնում»։ Երբ օգտվողի բրաուզերը ուղիղ հարցում է անում API-ին, պետք է **իրական production** API-ի հասցեն լինի, ոչ `localhost`։

3. **`API_INTERNAL_URL`** — «Vercel-ի **սեփական սերվերը** (Next-ը) ներսից API-ին որտեղից է դիմում»։ `next.config`-ի rewrite-ը `/api/v1/...` հարցումները ուղարկում է այս հասցեին։ Տեղային մեքենայում դա `127.0.0.1:4000` է, բայց **Vercel-ի վրա դա չի աշխատի**՝ այնտեղ պետք է նույն հանրային API URL-ը, ինչ production-ում (սովորաբար նույնը, ինչ `NEXT_PUBLIC_API_URL`)-ը, առանց localhost-ի։

**Այլ բաներ** (DB, JWT, Stripe, նամակ, R2) Vercel-ի Next պրոյեկտում **չես դնում**, եթե դրանք միայն Nest API-ն է օգտագործում՝ դնում ես API deploy-ի env-ում։

`NEXT_PUBLIC_`-ով սկսվող արժեքները **build**-ի ժամանակ են «կպչում» կոդին — փոխելուց հետո նոր deploy արա։

---

This project loads env from the **monorepo root** `.env` / `.env.local` in development. On Vercel, configure variables in **Project → Settings → Environment Variables**, scoped to **Production** and/or **Preview**.

Assumption: **Next.js** is deployed on Vercel; **Nest API**, database, and secrets live on another host (or another Vercel project). Adjust if your layout differs.

## Required (Production)

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Public site URL (SSR, links, metadata). No trailing slash unless your app expects one. |
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com` | Browser-facing API base URL (client-side requests, asset URLs). |
| `API_INTERNAL_URL` | `https://api.your-domain.com` | Server-side proxy target for `/api/v1/*` rewrites in `apps/web/next.config.ts`. **Must not** be `http://127.0.0.1:4000` on Vercel. |

`NODE_ENV` is set by Vercel; do not override unless you have a specific reason.

## Preview / branch deployments

Use the same three variables with **staging** values (staging API URL, staging site URL if you have one). If you use Vercel preview URLs only, set `NEXT_PUBLIC_SITE_URL` to that preview origin or your staging front URL—whichever matches how users and callbacks reach the app.

Ensure the **Nest API CORS** allowlist includes each Vercel preview **origin** you use: production allows only `WEB_APP_URL` plus exact strings in `CORS_ORIGINS` (comma-separated). Wildcards like `https://*.vercel.app` are **not** supported by this codebase—add full preview URLs if needed.

## Not needed on Vercel (when API is separate)

Keep these on the **API** host only, unless a future change reads them from Next:

- `DATABASE_URL`, `DIRECT_URL`, `DATABASE_CONNECTION_LIMIT`, `DATABASE_POOL_TIMEOUT`
- `JWT_SECRET`, `JWT_EXPIRES_SEC`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `MAIL_TRANSPORT`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM`
- `R2_*` (and optional `R2_HOME_IMAGE_REQUIRED`)
- `CORS_ORIGINS` (Nest)
- `EXPO_PUBLIC_*` (Expo / mobile, not the Vercel Next app)
- `FIGMA_ACCESS_TOKEN` (local/MCP tooling)

## Build-time note

`NEXT_PUBLIC_*` values are inlined at **build** time. After changing them, trigger a **new deployment** (rebuild).

## Render (Nest API) + Vercel (Next) — ինչը որտեղ

Նույն **production** frontend URL-ը երկու տեղ պետք է **նույն արժեքով** լինի՝ Vercel-ի `NEXT_PUBLIC_SITE_URL` և Render-ի `WEB_APP_URL` (CORS, redirect, նամակների հղումներ)։ **API-ի հանրային base URL-ը** (Render service կամ custom domain, առանց path-ի, օր. `https://your-api.onrender.com`) դիր Vercel-ի `NEXT_PUBLIC_API_URL` և `API_INTERNAL_URL`-ում — սովորաբար **նույն արժեքը** երկուսում։

### Vercel (`apps/web`) — env

| Variable | Value (production) |
|----------|-------------------|
| `NEXT_PUBLIC_SITE_URL` | Քո կայքի URL — նույնը, ինչ `WEB_APP_URL` Render-ում (օր. `https://yourapp.vercel.app`)։ |
| `NEXT_PUBLIC_API_URL` | Render-ի **Nest** service-ի հանրային URL (օր. `https://your-api.onrender.com`)։ |
| `API_INTERNAL_URL` | Սովորաբար **նույնը**, ինչ `NEXT_PUBLIC_API_URL` (Vercel server → Nest proxy)։ |

Մնացածը (DB, JWT, Stripe, …) **չի** գնում Vercel, եթե Next-ը դրանք ուղիղ չի կարդում։

### Render (`apps/api`) — env

| Variable | Value (production) |
|----------|-------------------|
| `NODE_ENV` | `production` (Render-ում հաճախ արդեն set է)։ |
| `PORT` | Render-ը սովորաբար ինքն է տալիս — թող default-ով, Nest-ը կարդում է `PORT`։ |
| `WEB_APP_URL` | Քո **Vercel frontend**-ի ամբողջական origin (`https://...`) — **պարտադիր ճիշտ**, այլապես production CORS-ը կկտրի բրաուզերի հարցումները։ |
| `CORS_ORIGINS` | Լրացուցիչ origin-ներ **ստորակետով** (օր. Vercel preview URL-եր, եթե պետք են)։ |
| `DATABASE_URL` | Neon pooled connection string։ |
| `DIRECT_URL` | Neon direct (migrations / Prisma)։ |
| `DATABASE_CONNECTION_LIMIT`, `DATABASE_POOL_TIMEOUT` | Ըստ `.env.example` կամ ձեր pool-ի։ |
| `JWT_SECRET`, `JWT_EXPIRES_SEC` | Auth։ |
| `STRIPE_*` | Եթե վճարումներն ես միացնում։ |
| `UPSTASH_REDIS_*` | Եթե cache-ը օգտագործում ես։ |
| `MAIL_TRANSPORT`, `RESEND_*` | Եթե production-ում նամակ ես ուղարկում։ |
| `R2_*` | Ֆայլերի / home image upload-ի համար (տես `.env.example`)։ |

`APP_URL` այս monorepo-ի Nest կոդում **չի** օգտագործվում (կարևոր է `WEB_APP_URL`)։ Եթե հետագայում payment callback doc-երը խնդրեն `APP_URL`, համաձայնեցրու frontend base URL-ը env անվան հետ։

### Ստուգման կարճ ցուցակ

1. Բրաուզերը բացում է Vercel URL → API հարցումները գնում են `NEXT_PUBLIC_API_URL` կամ Next `/api/v1` rewrite-ով `API_INTERNAL_URL`։  
2. `WEB_APP_URL` (Render) = քո frontend-ի **ճիշտ** `https://...` origin։  
3. Preview branch-երի համար կամ նոր `CORS_ORIGINS` ավելացրու **ամբողջական** preview URL, կամ օգտագործիր առանձին staging API + staging front։

## Reference

See root `.env.example` for the full list of variables used across the monorepo.
