# Որտեղ ինչ env դնել (Coolify Docker — primary)

Կարճ ցուցակ՝ **քո root `.env`-ի key-երի** հիման վրա։ Արժեքները **չեն** գրված այստեղ — միայն deploy UI-ում։

**Production canonical:** Hetzner + Coolify + **Docker only** (տես [`COOLIFY_DOCKER_DEPLOY.md`](./COOLIFY_DOCKER_DEPLOY.md)).  
**Nixpacks չօգտագործել** այս monorepo-ի համար։

## Coolify (Docker) — `apps/web` + `apps/api`

Առաջարկվող՝ մեկ resource `compose.yaml`-ով։ Այլընտրանք՝ երկու Dockerfile service։

| Key | Որտեղ | Production արժեք |
|-----|--------|------------------|
| `NEXT_PUBLIC_SITE_URL` | web (**build** + runtime) | `https://www.ommm.am` |
| `NEXT_PUBLIC_API_URL` | web (**build** + runtime) | Հանրային API base (`https://api.ommm.am`) — browser-facing URLs / assets։ |
| `NEXT_PUBLIC_API_ORIGIN` | web (**build** + runtime) | Սովորաբար նույնը, ինչ `NEXT_PUBLIC_API_URL`։ |
| `API_INTERNAL_URL` | web (runtime) | **Docker-network** Nest URL։ Compose-ում արդեն `http://api:8080`։ Split services՝ `http://<api-service-name>:8080`։ **Ոչ** `https://api.ommm.am` (Cloudflare hairpin → SSE `socket hang up` / HTTP 500)։ |
| `WEB_APP_URL` | api | `https://www.ommm.am` — CORS + OAuth redirects։ |
| `PORT` | api | `8080` (համընկնում է `Dockerfile.api` / compose-ի հետ)։ |
| `API_LISTEN_HOST` | api | `0.0.0.0` |
| `RUN_DB_MIGRATE` | api | `true` (default) — entrypoint-ը անում է `prisma migrate deploy`։ |
| `DATABASE_URL` / `DIRECT_URL` | api | Neon pooled + direct։ |
| `JWT_SECRET` / `JWT_EXPIRES_SEC` | api | Production secret։ |
| `ENABLE_BOOKING_BACKGROUND_JOBS` | api | `true` prod-ում։ |
| `ENABLE_BACKGROUND_REMINDERS` | api | `true` prod-ում։ Class reminders 24h + 2h, membership expiry WhatsApp։ Պիտի լինի `compose.api.yaml` environment-ում, այլապես container չի տեսնի։ |
| Resend / R2 / Google / Upstash / WhatsApp | api | Ըստ `.env.example`-ի։ |
| `GOOGLE_CALLBACK_URL` | api | `https://www.ommm.am/api/v1/auth/google/callback` (frontend origin + Next proxy)։ |
| `CORS_ORIGINS` | api | Լրացուցիչ browser origin-ներ, ստորակետով։ |

Web և API պետք է լինեն **նույն Docker network**-ում։ SSE մնում է same-origin `/api/v1/realtime/*` (host-only cookie)՝ dedicated App Router proxy-ով։

### Coolify UI — պարտադիր

| Setting | Value |
|---------|--------|
| Build Pack | **Dockerfile** կամ **Docker Compose** |
| Web Dockerfile | `Dockerfile` |
| API Dockerfile | `Dockerfile.api` |
| Compose file | `compose.yaml` |
| Nixpacks | **արգելված** |

## Legacy notes (Vercel / Render)

Հին split hosting-ի համար կարող ես դեռ օգտագործել ստորև՝ եթե ժամանակավոր ես մնում այդ stack-ում։ **Նոր prod deploy-ի համար օգտագործիր Coolify Docker։**

### Vercel — միայն `apps/web` (legacy)

| Key | Production արժեք (ինչ դնել) |
|-----|-----------------------------|
| `NEXT_PUBLIC_SITE_URL` | Քո frontend-ի `https://…`։ |
| `NEXT_PUBLIC_API_URL` | API-ի հանրային `https://…` (base, առանց `/v1`)։ |
| `API_INTERNAL_URL` | Սովորաբար **նույնը**, ինչ `NEXT_PUBLIC_API_URL` (Vercel-ից Docker network չի հասնում)։ |

**Չդնես Vercel-ում** (backend-only են). `NODE_ENV`-ը Vercel-ը սովորաբար ինքն է լուծում։

### Render — միայն `apps/api` (legacy)

| Key | Նշում |
|-----|--------|
| `NODE_ENV` | `production` |
| `PORT` | Թող platform default (Nest-ը կարդում է `PORT`)։ |
| `API_LISTEN_HOST` | `0.0.0.0` |
| `WEB_APP_URL` | Frontend `https://…` (CORS + redirects)։ |
| `DATABASE_URL` / `DIRECT_URL` | Neon։ |
| `DATABASE_CONNECTION_LIMIT` / `DATABASE_POOL_TIMEOUT` | Ինչպես տեղայինում։ |
| `JWT_*`, Resend, R2, Google, Upstash, WhatsApp | Ինչպես Coolify API աղյուսակում։ |
| `GOOGLE_CALLBACK_URL` | Frontend origin + `/api/v1/auth/google/callback`։ |

`MAIL_TRANSPORT` քո `.env`-ում կարող է չլինել — production-ում Nest-ը default-ով **Resend** է վերցնում; եթե ուզես log-only՝ `MAIL_TRANSPORT=log`։

**Preview deploy-ներ.** Wildcard CORS չկա — յուրաքանչյուր preview origin ավելացրու `CORS_ORIGINS`-ում։

## Չի գնում web/API deploy (այլ միջավայր)

| Key | Ուր |
|-----|-----|
| `APP_URL` | Nest/web-ի ընթացիկ կոդում չի օգտագործվում — կարող ես **չդնել**։ |
| `EXPO_PUBLIC_API_URL` | Միայն **Expo / mobile** build։ |
| `FIGMA_ACCESS_TOKEN` | Միայն **տեղային** dev / MCP։ |

## Մեկ տողով

- **Coolify Docker**՝ web + api, Compose կամ երկու Dockerfile, `API_INTERNAL_URL` = internal DNS։  
- **Nixpacks**՝ ոչ։  
- **Expo / Figma**՝ web+API deploy-ից դուրս։
