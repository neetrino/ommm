# Web (Next.js) — Coolify / Hetzner.
# Build Pack MUST be "Dockerfile" (never Nixpacks).
# Dockerfile location: Dockerfile (repo root). Port: 3000.
#
# Runtime: set API_INTERNAL_URL to the Docker-network Nest URL
# (e.g. http://api:8080), NOT https://api.ommm.am.

FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY packages/database/package.json ./packages/database/
# Skip postinstall (prisma generate) until schema sources are copied in builder.
# Coolify may inject NODE_ENV=production as a build ARG; without --prod=false
# pnpm skips devDependencies (@tailwindcss/postcss, typescript, prisma).
RUN pnpm install --frozen-lockfile --filter web... --ignore-scripts --prod=false

FROM base AS builder
COPY --from=deps /app/ /app/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web ./apps/web
COPY packages/database ./packages/database

# Client bundle embeds NEXT_PUBLIC_* at build time — pass via Coolify build args.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_ORIGIN
ARG NEXT_PUBLIC_ARCA_CHECKOUT_ENABLED
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN \
    NEXT_PUBLIC_ARCA_CHECKOUT_ENABLED=$NEXT_PUBLIC_ARCA_CHECKOUT_ENABLED \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm run db:generate && pnpm run build:web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:3000/" >/dev/null || exit 1
CMD ["node", "apps/web/server.js"]
