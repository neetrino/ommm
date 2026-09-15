# Web (Next.js) — Coolify ommm.am. Multi-stage + standalone keeps the image small
# enough that `exporting layers` does not OOM / fill disk on the host.
# Coolify: Build Pack = Dockerfile, Dockerfile = Dockerfile (this file).
# API uses Dockerfile.api separately.

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
RUN pnpm run db:generate && pnpm run build:web

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
