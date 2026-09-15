# Որտեղ ինչ env դնել (Vercel + Render + Coolify)

Կարճ ցուցակ՝ **քո root `.env`-ի key-երի** հիման վրա։ Արժեքները **չեն** գրված այստեղ — միայն deploy UI-ում։

## Coolify (Docker) — `apps/web` + `apps/api`

| Key | Որտեղ | Production արժեք |
|-----|--------|------------------|
| `NEXT_PUBLIC_API_URL` | web | Հանրային API base (`https://api.ommm.am`) — browser-facing URLs / assets։ |
| `API_INTERNAL_URL` | web | **Docker-network** Nest URL (օր. `http://<api-service-name>:8080`), **ոչ** `https://api.ommm.am`։ Հանրային URL-ը Cloudflare hairpin է անում և կոտրում է SSE (`socket hang up` → HTTP 500)։ |
| `WEB_APP_URL` | api | `https://www.ommm.am` (կամ canonical site origin) — CORS + OAuth redirects։ |

Web և API պետք է լինեն **նույն Docker network**-ում, որպեսզի `API_INTERNAL_URL`-ը resolv լինի։ SSE մնում է same-origin `/api/v1/realtime/*` (host-only cookie)՝ dedicated App Router proxy-ով։

## Vercel — միայն `apps/web`

| Key | Production արժեք (ինչ դնել) |
|-----|-----------------------------|
| `NEXT_PUBLIC_SITE_URL` | Քո frontend-ի `https://…` (Vercel domain կամ custom)։ |
| `NEXT_PUBLIC_API_URL` | Քո Render API-ի հանրային `https://…` (base, առանց `/v1`)։ |
| `API_INTERNAL_URL` | Սովորաբար **նույնը**, ինչ `NEXT_PUBLIC_API_URL` (Vercel-ից localhost չի հասնում)։ |

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
| `WHATSAPP_GATEWAY_URL` | Fallback Gateway URL if Admin → Settings → WhatsApp is empty։ |
| `WHATSAPP_GATEWAY_TOKEN` | Fallback project token if the admin DB row is empty։ |
| `R2_ACCOUNT_ID` | R2 dashboard։ |
| `R2_S3_ENDPOINT` | R2 S3 API URL։ |
| `R2_API_TOKEN` | Քո `.env`-ում կա; Nest upload path-ը **չի** կարդում այս key-ը — կարող ես Render-ում չդնել, եթե ուրիշ ծառայություն չի պահանջում։ |
| `R2_ACCESS_KEY_ID` | S3 access key։ |
| `R2_SECRET_ACCESS_KEY` | S3 secret։ |
| `R2_BUCKET_NAME` | Որքան `.env`-ում։ |
| `R2_PUBLIC_URL` | Հանրային asset base URL։ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (միայն Render — Vercel-ում **չդնես**)։ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (միայն Render)։ |
| `GOOGLE_CALLBACK_URL` | `https://ommm.am/api/v1/auth/google/callback` (frontend origin + Next proxy, **ոչ** `onrender.com`)։ |

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

## Մեկ տողով

- **Vercel**՝ 3 հանրային URL (`SITE` + `API` + `INTERNAL` = API base)։  
- **Render**՝ բոլոր backend secret-ները + `WEB_APP_URL` = frontend `https://…`։  
- **Expo / Figma**՝ deploy web+API-ից դուրս։
