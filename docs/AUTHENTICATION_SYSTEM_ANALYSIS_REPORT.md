# Authentication System Analysis Report

## 1. Project Stack Overview

- **Monorepo / package manager:** pnpm workspace monorepo (`package.json`, `apps/*`, `packages/*`).
- **Frontend (web):** Next.js App Router + React + `next-intl` (`apps/web/package.json`, `apps/web/src/app`).
- **Backend API:** NestJS 11 (`apps/api/package.json`) with modular controllers/services under `apps/api/src/*`.
- **Mobile:** Expo + React Native + `expo-router` (`apps/mobile/package.json`, `apps/mobile/app`).
- **Database:** PostgreSQL via Prisma (`packages/database/prisma/schema.prisma`).
- **ORM:** Prisma Client (`@prisma/client`, package `@ommm/database`).
- **Auth libraries currently used:**
  - `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` (API)
  - `cookie-parser` (API cookie auth support)
  - `bcryptjs` (+ legacy `argon2` verification fallback)
- **Session/JWT/cookie strategy (current):**
  - API issues JWT access token only (no refresh token) in `AuthService.signAccessToken` (`apps/api/src/auth/auth.service.ts`).
  - JWT accepted from:
    - HttpOnly cookie `ommm_access` (`apps/api/src/common/constants.ts`, `apps/api/src/auth/jwt.strategy.ts`)
    - `Authorization: Bearer <token>` (`apps/api/src/auth/jwt.strategy.ts`)
  - Web uses cookie-based session (plus token returned in body).
  - Mobile stores bearer token in `expo-secure-store`/`AsyncStorage` and sends bearer headers.
- **Environment variable structure:**
  - Root `.env` model in `.env.example`
  - Core auth vars now: `JWT_SECRET`, `JWT_EXPIRES_SEC`, `WEB_APP_URL`, `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, `EXPO_PUBLIC_API_URL`.
  - API env loading precedence in `apps/api/src/app.module.ts`; web loads root env via `apps/web/next.config.ts`; mobile loads root env via `apps/mobile/app.config.ts`.

## 2. Current Login / Register Flow

### Registration

- **Endpoint:** `POST /v1/auth/register` (`apps/api/src/auth/auth.controller.ts`)
- **Input DTO:** `RegisterDto` (`apps/api/src/auth/dto/register.dto.ts`)
  Required: `email`, `password`, `name`, `lastName`, `phone`, optional `locale`.
- **Service flow:** `AuthService.register` (`apps/api/src/auth/auth.service.ts`)
  - lowercases email
  - checks unique email + phone
  - validates phone digit length
  - hashes password with bcrypt
  - creates `User` (default role from schema = `USER`)
  - creates `AuthToken` row for email verification (`EMAIL_VERIFY`)
  - sends verification email with token link
  - issues JWT access token
- **Response:** `{ user, accessToken }`
- **Also sets cookie:** HttpOnly `ommm_access` for 7 days.

### Login

- **Endpoint:** `POST /v1/auth/login` (`auth.controller.ts`)
- **Input DTO:** `LoginDto` (`email`, `password`)
- **Service flow:** `AuthService.login`
  - finds user by email
  - rejects if no `passwordHash`
  - verifies password (`verifyPassword`)
  - transparently migrates legacy argon2 hashes to bcrypt
  - issues JWT access token
- **Response:** `{ user: sanitizeUser(user), accessToken }`
- **Also sets cookie:** HttpOnly `ommm_access`.

### Credentials used

- Current auth is **email + password**.
- No OTP/SMS/phone login.
- Email verification exists via token table + `/auth/verify-email`, but login currently does **not** block unverified users.

### Post-login behavior

- **Web:** `apps/web/src/app/[locale]/(auth)/login/page.tsx` and `register/page.tsx`
  - calls `/api/v1/auth/login|register` via `apiFetch`
  - sets UI locale cookie
  - redirects by role via `homePathForRole`.
- **Mobile:** `SessionProvider.signInWithPassword/registerAccount`
  - receives `{ accessToken, user }`
  - stores token in secure storage
  - routes by role via `homeHrefForRole`.

### Token/session creation

- JWT creation in `AuthService.signAccessToken`.
- Cookie set in `AuthController` and refreshed in `UsersController.patchMe`.

### Client-side storage

- **Web:** HttpOnly cookie (`credentials: include` in `apps/web/src/lib/api.ts`).
- **Mobile:** `expo-secure-store` fallback `AsyncStorage` (`apps/mobile/src/auth/accessTokenStorage.ts`).

### Logout

- **API route:** `POST /v1/auth/logout`
  - clears cookie only (`res.clearCookie(...)`)
  - stateless JWT is not revoked server-side.
- **Web logout UI:** `apps/web/src/components/logout-button.tsx`
- **Mobile logout:** calls `/v1/auth/logout` with bearer (best-effort) then deletes local token (`SessionProvider.signOut`).

### Protected routes/pages

- **API:** `JwtAuthGuard` and `RolesGuard` on controllers/routes.
- **Web:** layout-level auth check via `requireAuthForLayout` calling `/users/me` (`apps/web/src/server/require-role-layout.ts`) and role-based redirects.
- **Mobile:** route group guards in `apps/mobile/app/(main)/*/_layout.tsx` by `isSignedIn` + role.

## 3. User Model / Database Schema

### User model

`packages/database/prisma/schema.prisma` -> `model User`

Key fields:
- Identity: `id`, `email` (unique), `phone` (unique, nullable)
- Password: `passwordHash` (nullable)
- Profile: `name`, `lastName`, `dateOfBirth`, `avatarUrl`, `homeImageUrl`, `locale`
- Role/status: `role` enum (`USER`, `COACH`, `MANAGER`, `CONTENT_ADMIN`, `ADMIN`)
- Verification/status-ish: `emailVerified` datetime nullable
- Billing-related: `stripeCustomerId`, `giftCreditsCents`
- Timestamps: `createdAt`, `updatedAt`

### Token model

`model AuthToken`:
- `userId`, `tokenHash` (unique), `type` (`EMAIL_VERIFY` | `PASSWORD_RESET`), `expiresAt`.
- Used for email verify/password reset; not for login sessions.

### Role relations

- No separate roles table; enum role on `User`.
- Role-specific relation: `CoachProfile` for coaches.
- No account/session/provider table for OAuth yet.

### OAuth readiness

Current schema is **not fully OAuth-ready**:
- missing provider account linkage table (`provider`, `providerAccountId`, etc.)
- no standardized auth provider metadata per user
- `passwordHash` is nullable (good for social-only accounts), but linking model is missing.

## 4. Existing Auth API Routes / Server Logic

### `POST /auth/register`

- **File:** `apps/api/src/auth/auth.controller.ts` -> `register`
- **Purpose:** Create local account + issue JWT + start email verification.
- **Request:** `RegisterDto`
- **Response:** `{ user, accessToken }`
- **Validation:** class-validator + global ValidationPipe (`main.ts`)
- **Security:** unique checks, password hashing, cookie HttpOnly.
- **Errors:** `ConflictException`, `BadRequestException`.

### `POST /auth/login`

- **File:** same controller -> `login`
- **Purpose:** local sign-in.
- **Request:** `LoginDto`
- **Response:** `{ user, accessToken }`
- **Token handling:** JWT issued; cookie set.
- **Errors:** `UnauthorizedException` invalid credentials.

### `POST /auth/logout`

- **Purpose:** clear auth cookie.
- **Response:** `{ ok: true }`
- **Security note:** no JWT revocation/blacklist.

### `POST /auth/verify-email`

- **Request:** `{ token }` (`VerifyEmailDto`)
- **Logic:** hash token, lookup `AuthToken`, check type+expiry, set `emailVerified`, delete token.
- **Response:** `{ ok: true }`.

### `POST /auth/request-password-reset`

- **Request:** `{ email }`
- **Logic:** if user exists, creates `PASSWORD_RESET` token + email.
- **Response:** `{ ok: true }` even for unknown users (anti-enumeration behavior).

### `POST /auth/reset-password`

- **Request:** `{ token, newPassword }`
- **Logic:** verify token + expiry, set new bcrypt hash, delete token.
- **Response:** `{ ok: true }`.

### `POST /auth/session`

- **Guarded by:** `JwtAuthGuard`
- **Response:** `{ user }`
- **Note:** appears unused by web/mobile clients currently.

### Related auth session/profile routes

- **`GET /users/me`** (guarded): primary web/mobile session hydration.
- **`PATCH /users/me`**: profile update + token refresh cookie.
- **`PATCH /users/me/password`**: password change.

## 5. Frontend Auth UI

### Web

- **Login page:** `apps/web/src/app/[locale]/(auth)/login/page.tsx`
- **Register page:** `apps/web/src/app/[locale]/(auth)/register/page.tsx`
- **Auth shell:** `apps/web/src/app/[locale]/(auth)/layout.tsx`
- **Verify email page:** `apps/web/src/app/[locale]/verify-email/page.tsx`

Form behavior:
- client-side validation (email format, password length, phone checks on register)
- submits to `/auth/login` and `/auth/register`
- redirects by role + locale.
- uses `apiFetch(..., credentials: include)`.

**Google/Apple button insertion points (web):**
- naturally below password form submit area on login/register pages.
- current components are clean and can accommodate additional button rows with minimal structural change.

### Mobile (React Native)

- **Login screen:** `apps/mobile/app/(auth)/login.tsx`
- **Register screen:** `apps/mobile/app/(auth)/register.tsx`
- **Welcome auth entry:** `apps/mobile/app/(auth)/welcome.tsx`
- **Auth button stack component:** `apps/mobile/src/features/auth/components/AuthPillButtonStack.tsx`

Form validation:
- local validation for email/password/phone/confirm password.
- calls `SessionProvider` methods that hit backend auth endpoints.

**Google/Apple button insertion points (mobile):**
- `welcome.tsx` (`AuthPillButtonStack`)
- `login.tsx` and potentially `register.tsx` below current CTA.

## 6. Role / Permission System

- **Roles enum:** `USER`, `COACH`, `MANAGER`, `CONTENT_ADMIN`, `ADMIN` (`schema.prisma`).
- **Default role:** `USER` via Prisma default.
- **Role assignment points:**
  - Registration: no explicit role -> default `USER` (`AuthService.register`).
  - Coach creation: explicit `Role.COACH` (`CoachesService.create`).
  - Seed: demo users for each role (`packages/database/prisma/seed.ts`).
- **Role checks:**
  - API: `@Roles(...)` + `RolesGuard`.
  - Web: role-gated layouts under `(admin)`, `(manager)`, `(coach)`, `(content-admin)`, `(account)/user`.
  - Mobile: role-gated route groups.
- **Admin/superadmin logic:** no separate superadmin role; `ADMIN` is highest in current enum.
- **Social login default recommendation:** new OAuth users should default to `USER` unless explicit business rule maps differently.

## 7. Mobile App / React Native Auth, If Present

Mobile app **exists** (`apps/mobile` with Expo).

- **Auth implementation:** `SessionProvider` + API clients.
- **Backend usage:** same Nest backend endpoints (`/v1/auth/*`, `/v1/users/me`).
- **Token storage:** SecureStore on iOS/Android when available, otherwise AsyncStorage.
- **For Google login on mobile:** add native OAuth flow (Expo AuthSession / provider SDK), then exchange provider token/id_token with backend for first-party JWT.
- **For Apple login on iOS:** use Apple Sign In flow (Expo Apple auth / native), then same backend token exchange.
- **Shared backend logic:** yes, web and mobile should share one backend OAuth/account-linking implementation; clients only perform provider auth initiation and callback/token handoff.

## 8. Professional Google Login Implementation Plan

1. **Google Cloud setup**
   - Create OAuth consent screen.
   - Create separate OAuth clients:
     - Web client (Next web callback URL)
     - iOS client (bundle ID)
     - Android client (package + SHA)
2. **Env vars (generic)**
   - `GOOGLE_CLIENT_ID_WEB`
   - `GOOGLE_CLIENT_SECRET_WEB`
   - `GOOGLE_REDIRECT_URI_WEB`
   - optional mobile client IDs
3. **Backend changes**
   - Add OAuth provider module/service in API.
   - Validate Google ID token / auth code exchange.
   - Normalize provider profile (`sub`, `email`, `email_verified`, name, avatar).
   - Introduce account linking table (see section 11).
   - Issue existing app JWT (same current strategy).
4. **Frontend web changes**
   - Add "Continue with Google" on login/register.
   - Implement redirect/callback screen in web app.
5. **Mobile changes**
   - Add Google native flow, then backend exchange endpoint.
6. **Conflict/account linking logic**
   - if verified email matches existing password account, link by policy after takeover-safe checks.
7. **Security**
   - enforce state + nonce
   - validate redirect URI strictly
   - require verified Google email for auto-link
8. **Production requirements**
   - HTTPS domains
   - exact callback URL registration
   - proper CORS/origin config for production hostnames.

## 9. Professional Apple Login Implementation Plan

1. **Apple Developer prerequisites**
   - Paid Apple Developer account.
   - Configure Services ID (web), App ID/Bundle ID (iOS), Sign in with Apple capability.
   - Generate private key (`.p8`), note Team ID and Key ID.
2. **Env vars (generic)**
   - `APPLE_CLIENT_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_KEY_ID`
   - `APPLE_PRIVATE_KEY`
   - `APPLE_REDIRECT_URI`
3. **Backend changes**
   - Implement Apple auth code exchange + ID token validation.
   - Persist stable Apple subject identifier for linking.
4. **Frontend/mobile changes**
   - Web button + callback route.
   - iOS native Apple button flow.
5. **Data model/linking**
   - same OAuth account table.
6. **Apple-specific limitations**
   - name/email may only be provided first consent.
   - private relay emails possible; must be treated as real unique email values.
7. **Security**
   - validate `aud`, `iss`, `nonce`, token signature.
8. **Production requirements**
   - HTTPS callback URLs
   - domains configured in Apple services.

## 10. Account Linking Strategy

### Case 1

User exists with email/password, then Google same verified email:
- Link provider account to existing user automatically **only if provider email is verified**.
- Do not create duplicate user.

### Case 2

User exists with email/password, then Apple same verified email:
- Same strategy as Case 1.
- Store provider `sub` and link.

### Case 3

User first registers with Google, later tries password login:
- If `passwordHash` is null, require "set password" flow (authenticated session + password set).
- Then allow normal password login.

### Case 4

User first registers with Apple Private Relay email:
- Keep relay email as canonical unless user later explicitly adds/verifies another email.
- Never assume relay == real mailbox identity beyond provider guarantee.

### Case 5

Provider returns no email or unverified email:
- Do not auto-link.
- Require explicit verified-email completion flow (or reject sign-in depending policy).

## 11. Required Database Changes

Recommended new table: **`OAuthAccount`** (name can vary)

Fields:
- `id`
- `userId` (FK -> `User`)
- `provider` (`google` | `apple`)
- `providerAccountId` (Google sub / Apple sub)
- `providerEmail` (nullable)
- `providerEmailVerified` (boolean)
- optional tokens: `accessToken`, `refreshToken`, `idToken` (encrypted if stored)
- `scope`, `tokenType`, `expiresAt` (optional)
- `createdAt`, `updatedAt`

Constraints:
- unique (`provider`, `providerAccountId`)
- index on `userId`
- optional unique (`provider`, `providerEmail`) if policy requires.

Possible `User` additions:
- `authProvider` (optional convenience enum/string)
- `avatarUrl` already exists (reuse for social profile image)
- keep `passwordHash` nullable for social-only accounts.

**Do you need provider access tokens stored?**
- Usually **not required** if only using provider for login.
- Store only if you need downstream Google/Apple API access; otherwise avoid storing/rotate minimally.

## 12. Required Environment Variables

### Google

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

### Apple

- `APPLE_CLIENT_ID` (Services ID / app client id)
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`
- `APPLE_CALLBACK_URL`

### App Auth

- `JWT_SECRET` (existing)
- `JWT_EXPIRES_SEC` (existing)
- `WEB_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`
- `EXPO_PUBLIC_API_URL`

## 13. Security Requirements

- Use OAuth `state` (CSRF protection) and `nonce` for ID token validation.
- Prefer Authorization Code flow (+ PKCE for public clients/mobile).
- Keep web session in `HttpOnly`, `Secure` cookies in production.
- Maintain proper `SameSite` policy (`lax` currently used).
- Require HTTPS in production for callbacks/cookies.
- Strict callback URL allowlist per provider.
- Accept only verified provider email for automatic linking.
- Prevent account takeover: never link by unverified or missing email.
- Define JWT expiration + renewal strategy (today: access token only, 7 days).
- Consider refresh-token/session rotation for stronger revocation/control.

## 14. Risks in Current Project

1. **No OAuth account table yet**
   - File: `packages/database/prisma/schema.prisma`
   - Risk: duplicate users / weak linking if social login is added quickly.

2. **Logout does not invalidate bearer JWT**
   - File: `apps/api/src/auth/auth.controller.ts`
   - Risk: token remains valid until expiry if leaked.

3. **Email verification not enforced during login**
   - File: `apps/api/src/auth/auth.service.ts` (`login`)
   - Risk: unverified accounts can authenticate.

4. **Web receives access token in response body despite cookie session**
   - Files: `auth.controller.ts`, web auth pages
   - Risk: larger client-side exposure surface than cookie-only design.

5. **Email change path does not reset verification state**
   - File: `apps/api/src/users/users.service.ts` (`updateProfile`)
   - Risk: stale `emailVerified` semantics after email replacement.

6. **No refresh-token/session persistence model**
   - Overall auth design
   - Risk: limited revocation/control and coarse session management.

7. **Password reset/email verify API exists, but web reset UI is missing**
   - Backend DTO/routes exist; no matching web pages found for reset request/reset flow.
   - Risk: incomplete user recovery journey.

## 15. Recommended Final Architecture

**Recommendation: Extend the current custom auth system (hybrid JWT cookie/Bearer), do not replace with NextAuth/Auth.js.**

Why for this repo:
- Auth is shared by **Nest API + Next web + Expo mobile** already.
- Role-based authorization is deeply integrated in API and client route shells.
- NextAuth is web-first; mobile integration would still require custom backend logic.
- Current system already supports both cookie and bearer in one strategy (`jwt.strategy.ts`), which is ideal for web+mobile parity.
- Adding provider account linking to existing Prisma schema is cleaner than large auth framework migration.

## 16. Implementation Order

1. Add DB migration (`OAuthAccount` + indexes/constraints).
2. Add provider env vars and validation on boot.
3. Implement Google provider backend exchange/verify endpoint.
4. Implement Apple provider backend exchange/verify endpoint.
5. Implement unified backend callback/linking + JWT issuance.
6. Add web Google/Apple buttons + callback handlers.
7. Add mobile Google/Apple flows + backend exchange integration.
8. Add account linking conflict resolution and "set password" flow.
9. Run security + regression tests, then production rollout (HTTPS + provider configs).

## 17. Testing Checklist

- [ ] New user signs up with Google.
- [ ] Existing password user logs in with Google (same verified email).
- [ ] New user signs up with Apple.
- [ ] Existing password user logs in with Apple (same verified email).
- [ ] Apple Private Relay first-time signup/linking.
- [ ] Logout from web clears cookie and protected pages redirect.
- [ ] Logout from mobile clears local token and protected screens redirect.
- [ ] Protected API routes reject unauthenticated access.
- [ ] Admin/manager/coach/content-admin role routing still correct.
- [ ] Wrong callback URL rejected safely.
- [ ] Missing env vars fail fast with clear error.
- [ ] Production HTTPS + secure cookies validated.
- [ ] Mobile iOS Apple sign-in and Android Google sign-in validated end-to-end.

## 18. Files That Need To Be Changed Later

### Backend / DB

- `packages/database/prisma/schema.prisma`
  Add OAuth account model/relations and optional user auth metadata.
- `apps/api/src/auth/auth.module.ts`
  Register OAuth services/providers.
- `apps/api/src/auth/auth.controller.ts`
  Add Google/Apple auth endpoints and callbacks.
- `apps/api/src/auth/auth.service.ts`
  Add account linking + social sign-in orchestration.
- `apps/api/src/auth/jwt.strategy.ts`
  Usually minimal/no change, but may extend payload policy.
- `apps/api/src/users/users.service.ts`
  Handle password setup for social-first users and email verification transitions.
- `apps/api/package.json`
  Add OAuth/JWK dependencies if needed.
- `.env.example`
  Add generic Google/Apple env keys.

### Frontend Auth UI

- `apps/web/src/app/[locale]/(auth)/login/page.tsx`
  Add Google/Apple buttons and start flow.
- `apps/web/src/app/[locale]/(auth)/register/page.tsx`
  Add social registration entry points.
- `apps/web/src/lib/api.ts`
  Add OAuth helper calls if needed.
- `apps/web/src/lib/role-home.ts` / auth redirect utilities
  Keep post-login redirects consistent for social flow.
- `apps/web/package.json`
  Add web OAuth helper libs if chosen.

### Mobile

- `apps/mobile/app/(auth)/welcome.tsx`
  Add social login entry buttons.
- `apps/mobile/app/(auth)/login.tsx` and/or `register.tsx`
  Add social login buttons where desired.
- `apps/mobile/src/auth/SessionProvider.tsx`
  Add `signInWithGoogle` / `signInWithApple`.
- `apps/mobile/src/lib/api/authClient.ts`
  Add provider exchange API calls.
- `apps/mobile/app.config.ts`
  Add iOS/Android auth config (schemes, bundle/app IDs where needed).
- `apps/mobile/package.json`
  Add Expo/native auth packages for Google/Apple.

## 19. Final Summary For Developer

The cleanest path is to **keep the existing Nest-based auth core** and add a professional OAuth account-linking layer in Prisma, then let both web and mobile use the same backend exchange/linking endpoints. This avoids breaking current role-based authorization, preserves web cookie + mobile bearer compatibility, and gives safe handling for Google/Apple identity edge cases (verified email linking, relay emails, missing email, social-first accounts without passwords).
