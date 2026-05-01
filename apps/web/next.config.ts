import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";

const monorepoRoot = path.join(__dirname, "..", "..");
loadEnv({ path: path.join(monorepoRoot, ".env"), quiet: true });
loadEnv({
  path: path.join(monorepoRoot, ".env.local"),
  override: true,
  quiet: true,
});

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
