import path from "node:path";
import os from "node:os";
import { config as loadEnv } from "dotenv";
import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const monorepoRoot = path.join(__dirname, "..", "..");
loadEnv({ path: path.join(monorepoRoot, ".env"), quiet: true });
loadEnv({
  path: path.join(monorepoRoot, ".env.local"),
  override: true,
  quiet: true,
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const apiInternal =
  process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";

function collectLanIpv4Hosts(): string[] {
  const nets = os.networkInterfaces();
  const hosts = new Set<string>();

  for (const values of Object.values(nets)) {
    if (!values) continue;
    for (const value of values) {
      if (
        value.family === "IPv4" &&
        !value.internal &&
        value.address.trim().length > 0
      ) {
        hosts.add(value.address.trim());
      }
    }
  }

  return [...hosts];
}

function parseAllowedDevOrigins(raw: string | undefined): string[] {
  if (!raw || raw.trim().length === 0) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const allowedDevOrigins = [
  ...new Set([
    ...collectLanIpv4Hosts(),
    ...parseAllowedDevOrigins(process.env.NEXT_ALLOWED_DEV_ORIGINS),
  ]),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  allowedDevOrigins,
  async redirects() {
    return [
      {
        source: "/:locale/account/classes",
        destination: "/:locale/user/classes",
        permanent: false,
      },
      {
        source: "/:locale/account/bookings",
        destination: "/:locale/user/bookings",
        permanent: false,
      },
      {
        source: "/:locale/account/memberships",
        destination: "/:locale/user/memberships",
        permanent: false,
      },
      {
        source: "/:locale/account/gift-cards",
        destination: "/:locale/user/gift-cards",
        permanent: false,
      },
      {
        source: "/:locale/account/settings",
        destination: "/:locale/user/profile",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiInternal}/v1/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
