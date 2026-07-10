import { VERCEL_ANALYTICS_STAFF_ROUTE_SEGMENTS } from "@/components/analytics/vercel-analytics-config";

export const META_PIXEL_ID = "1562461848619799";

export const META_PIXEL_ENABLED = process.env.NODE_ENV === "production";

const STAFF_ROUTE_PATTERN = new RegExp(
  `(^|/)(${VERCEL_ANALYTICS_STAFF_ROUTE_SEGMENTS.join("|")})(/|$)`,
);

/** Returns false for backoffice URLs (e.g. `/admin/...`), true for public pages. */
export function shouldSendMetaPixelPageView(pathname: string): boolean {
  return !STAFF_ROUTE_PATTERN.test(pathname);
}
