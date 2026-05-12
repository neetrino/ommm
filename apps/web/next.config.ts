import path from "node:path";
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

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
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
