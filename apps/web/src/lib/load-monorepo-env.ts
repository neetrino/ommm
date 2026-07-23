import path from "node:path";
import { config as loadEnv } from "dotenv";

let loaded = false;

/** Loads root `.env` / `.env.local` when Next has not already (e.g. Turbopack RSC). */
export function ensureMonorepoEnvLoaded(): void {
  if (loaded) {
    return;
  }
  loaded = true;
  const monorepoRoot = path.resolve(process.cwd(), "..", "..");
  loadEnv({ path: path.join(monorepoRoot, ".env"), quiet: true });
  loadEnv({
    path: path.join(monorepoRoot, ".env.local"),
    override: true,
    quiet: true,
  });
}
