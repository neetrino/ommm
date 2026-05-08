# Mobile app (Expo + React Native)

The native client lives in `apps/mobile` and talks to the existing Nest API (`apps/api`) over HTTP. Next.js (`apps/web`) is unchanged except shared monorepo scripts.

## Install dependencies

From the repository root:

```bash
pnpm install
```

## Run everything (web + API + mobile)

```bash
pnpm run dev
```

This runs `dev` in parallel for each package under `apps/*` (web, api, mobile). The Expo CLI opens in the same terminal multiplex — use a dedicated terminal for mobile if you prefer a clearer Metro log:

```bash
pnpm run dev:mobile
```

## Run individual apps

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm run dev:web` | Next.js on port 3000       |
| `pnpm run dev:api` | NestJS (default port 4000) |
| `pnpm run dev:mobile` | Expo (Metro)            |

Ensure the API is running before testing the mobile health screen.

## Environment variables

Use **one file**: the repo root **`.env`** (optional root **`.env.local`** for local overrides that win over `.env`).

| Location | Used by | Contents |
| -------- | ------- | -------- |
| Repo root `.env` | Web + API + Mobile | All variables. Next and Nest load this as before; Expo loads the same file in `apps/mobile/app.config.ts` before Metro starts. |
| Root `.env.local` | Same (optional) | Local overrides; Expo loads with `override: true` so these values replace `.env`. |
| `apps/web/.env.local` | Next only | Next-specific overrides |
| `apps/api/.env` | Nest only | Nest `envFilePath` precedence |

For mobile, only add **safe public** `EXPO_PUBLIC_*` keys to the root `.env` (e.g. `EXPO_PUBLIC_API_URL`). Do not rely on “hiding” server secrets in the client — Expo inlines only `EXPO_PUBLIC_*` into the bundle; keep `JWT_SECRET`, `DATABASE_URL`, Stripe keys server-side only.

If you previously used `apps/mobile/.env`, you can delete it so it does not conflict with the single root file.

### Mobile: `EXPO_PUBLIC_API_URL`

1. Copy root `.env.example` → `.env` (or add `EXPO_PUBLIC_API_URL` to your existing root `.env`).
2. Set the **API base URL** (no path suffix, no trailing `/`) for your device/emulator (table below).
3. Restart Expo after changes (`pnpm run dev:mobile` or restart Metro).

Which value to use:

| Where you run the app        | Typical `EXPO_PUBLIC_API_URL` | Notes |
| ---------------------------- | ------------------------------ | ----- |
| Android emulator             | `http://10.0.2.2:4000`         | `10.0.2.2` is the host loopback from the Android emulator. |
| iOS Simulator                | `http://localhost:4000`        | Same machine as the API. |
| Expo web (`pnpm --filter mobile web`) | `http://localhost:4000` | Browser on the same machine. |
| Physical device (same Wi‑Fi) | `http://<your-pc-lan-ip>:4000` | Example: `http://192.168.1.10:4000`. Find your IP with `ipconfig` (Windows) or `ip addr` (Linux). The Nest `listen` default binds all interfaces, so LAN access works if the firewall allows inbound TCP on the API port. |

The sample screen calls `GET /v1/health` (see `apps/api/src/app.controller.ts`).

### Backend CORS (web / Expo web)

Nest resolves CORS in `apps/api/src/cors-origin.ts`:

- Browsers send an `Origin` header; allowed origins include `WEB_APP_URL`, optional `CORS_ORIGINS` (comma-separated), localhost variants in development, and LAN `http(s)://IP:port` in development.
- Many native clients omit `Origin`; those requests are still allowed so React Native `fetch` works.

Production keeps stricter origin checks; extend explicit origins with `CORS_ORIGINS` if you add more web frontends.

## Monorepo notes

- `pnpm-workspace.yaml` includes `apps/*`. Dependencies install from the root; `apps/mobile/metro.config.js` points Metro at the workspace `node_modules` so resolution stays stable.
- TypeScript is strict in the mobile app; keep shared code in a future `packages/*` package if you outgrow a thin API client.

## Troubleshooting

- **`EXPO_PUBLIC_API_URL is not set`** — Add it to the **root `.env`** (see `.env.example`) and restart Expo.
- **Device cannot reach API** — Confirm PC and phone are on the same network; use LAN IP, not `localhost`. Allow the API port in the OS firewall.
- **Android emulator works but device does not** — Switch `.env` from `10.0.2.2` to your LAN IP for a real device.
- **Expo web CORS errors** — Add your Expo web origin to root `.env` as `CORS_ORIGINS` (e.g. `http://192.168.1.10:8081`) or rely on dev LAN matching in `cors-origin.ts`.

## Useful links

- [Expo environment variables](https://docs.expo.dev/guides/environment-variables/)
- [Expo monorepos](https://docs.expo.dev/guides/monorepos/)
