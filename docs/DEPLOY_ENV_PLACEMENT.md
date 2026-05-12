# Որտեղ ինչ env դնել (Vercel + Render)

Կարճ ցուցակ՝ **քո root `.env`-ի key-երի** հիման վրա։ Արժեքները **չեն** գրված այստեղ — միայն deploy UI-ում (`Vercel` / `Render` → Environment)։

## Vercel — միայն `apps/web`

| Key | Production արժեք (ինչ դնել) |
|-----|-----------------------------|
| `NEXT_PUBLIC_SITE_URL` | Քո frontend-ի `https://…` (Vercel domain կամ custom)։ |
| `NEXT_PUBLIC_API_URL` | Քո Render API-ի հանրային `https://…` (base, առանց `/v1`)։ |
| `API_INTERNAL_URL` | Սովորաբար **նույնը**, ինչ `NEXT_PUBLIC_API_URL`։ |

**Չդնես Vercel-ում** (քո `.env`-ում չկան կամ backend-only են). `NODE_ENV`-ը Vercel-ը սովորաբար ինքն է լուծում։

## Render — միայն `apps/api` (Nest)

| Key | Նշում |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | Թող Render-ի default (Nest-ը կարդում է `PORT`)։ |
| `API_LISTEN_HOST` | `0.0.0.0` (Render-ի համար նորմալ է)։ |
| `WEB_APP_URL` | **Նույն origin-ը**, ինչ Vercel-ի `NEXT_PUBLIC_SITE_URL` (CORS + redirect/href-ներ)։ |
| `DATABASE_URL` | Նույն pooled Neon string-ը, ինչ տեղային `.env`-ում։ |
| `DIRECT_URL` | Նույն direct Neon string-ը։ |
| `DATABASE_CONNECTION_LIMIT` | Որքան տեղայինում (`10`)։ |
| `DATABASE_POOL_TIMEOUT` | Որքան տեղայինում (`20`)։ |
| `JWT_SECRET` | Production secret (տեղային dev արժեքը չօգտագործես prod-ում)։ |
| `JWT_EXPIRES_SEC` | Որքան տեղայինում։ |
| `UPSTASH_REDIS_REST_URL` | Եթե Redis-ը օգտագործում ես։ |
| `UPSTASH_REDIS_REST_TOKEN` | Եթե Redis-ը օգտագործում ես։ |
| `RESEND_API_KEY` | Production Resend key։ |
| `RESEND_FROM_EMAIL` | Որքան հաստատված sender-դ։ |
| `RESEND_FROM` | Display from string։ |
| `R2_ACCOUNT_ID` | R2 dashboard։ |
| `R2_S3_ENDPOINT` | R2 S3 API URL։ |
| `R2_API_TOKEN` | Քո `.env`-ում կա; Nest upload path-ը **չի** կարդում այս key-ը — կարող ես Render-ում չդնել, եթե ուրիշ ծառայություն չի պահանջում։ |
| `R2_ACCESS_KEY_ID` | S3 access key։ |
| `R2_SECRET_ACCESS_KEY` | S3 secret։ |
| `R2_BUCKET_NAME` | Որքան `.env`-ում։ |
| `R2_PUBLIC_URL` | Հանրային asset base URL։ |

`MAIL_TRANSPORT` քո `.env`-ում չկա — production-ում Nest-ը default-ով **Resend** է վերցնում; եթե ուզես log-only, Render-ում ավելացրու `MAIL_TRANSPORT=log`։

**Preview deploy-ներ** (Vercel PR URL). production CORS-ը թույլ է տալիս միայն `WEB_APP_URL` + `CORS_ORIGINS`։ Wildcard չկա — յուրաքանչյուր preview `https://…vercel.app` ավելացրու **Render**-ի `CORS_ORIGINS`-ում ստորակետով։

## Չի գնում ո՛ Vercel, ո՛ Render (այլ միջավայր)

| Key | Ուր |
|-----|-----|
| `APP_URL` | Nest/web-ի ընթացիկ կոդում չի օգտագործվում — կարող ես **չդնել**։ |
| `EXPO_PUBLIC_API_URL` | Միայն **Expo / mobile** build (EAS կամ տեղային)։ |
| `FIGMA_ACCESS_TOKEN` | Միայն **տեղային** dev / MCP։ |

## Չկա քո `.env`-ում, բայց prod-ում կարող պետք գալ

| Key | Ուր |
|-----|-----|
| `CORS_ORIGINS` | **Render** — Vercel preview origin-ներ, լրացուցիչ domain-ներ։ |
| `STRIPE_*` | **Render** — երբ Stripe միացնես։ |

## Մեկ տողով

- **Vercel**՝ 3 հանրային URL (`SITE` + `API` + `INTERNAL` = API base)։  
- **Render**՝ բոլոր backend secret-ները + `WEB_APP_URL` = frontend `https://…`։  
- **Expo / Figma**՝ deploy web+API-ից դուրս։
