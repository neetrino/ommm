/** Staff-only route segments — excluded from Vercel Web Analytics pageviews. */
export const VERCEL_ANALYTICS_STAFF_ROUTE_SEGMENTS = [
  "admin",
  "coach",
  "manager",
  "content-admin",
] as const;

export const VERCEL_ANALYTICS_ENABLED =
  process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED !== "false";

const STAFF_ROUTE_PATTERN = new RegExp(
  `(^|/)(${VERCEL_ANALYTICS_STAFF_ROUTE_SEGMENTS.join("|")})(/|$)`,
);

/** Returns false for backoffice URLs (e.g. `/ru/admin/...`), true for public pages. */
export function shouldSendVercelAnalyticsEvent(url: string): boolean {
  try {
    return !STAFF_ROUTE_PATTERN.test(new URL(url).pathname);
  } catch {
    return true;
  }
}
