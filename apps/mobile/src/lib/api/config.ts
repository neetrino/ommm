/**
 * Public API base URL (no path suffix). Must be reachable from the device or emulator.
 * Set in the monorepo root `.env` as `EXPO_PUBLIC_API_URL` (loaded via `app.config.ts`).
 */
export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url === undefined || url.trim() === "") {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set in the root .env — see MOBILE_SETUP.md",
    );
  }
  return url.replace(/\/$/, "");
}
