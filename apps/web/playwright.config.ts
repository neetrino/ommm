import { defineConfig, devices } from "@playwright/test";

/** Default dev port 3000 is often busy locally; E2E uses a separate port. */
const WEB_PORT = process.env.WEB_E2E_PORT ?? "3100";
const baseURL = `http://127.0.0.1:${WEB_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // `next dev` refuses a second instance per project dir; production server avoids that.
    command: `pnpm run build && pnpm exec next start -H 127.0.0.1 -p ${WEB_PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
    timeout: 300_000,
  },
});
