/** Staff-only route segments — excluded from Meta Pixel pageviews. */
export const META_PIXEL_STAFF_ROUTE_SEGMENTS = [
  "admin",
  "coach",
  "manager",
  "content-admin",
] as const;

export const META_PIXEL_ID = "1562461848619799";

export const META_PIXEL_ENABLED = process.env.NODE_ENV === "production";

const STAFF_ROUTE_PATTERN = new RegExp(
  `(^|/)(${META_PIXEL_STAFF_ROUTE_SEGMENTS.join("|")})(/|$)`,
);

/** Returns false for backoffice URLs (e.g. `/admin/...`), true for public pages. */
export function shouldSendMetaPixelPageView(pathname: string): boolean {
  return !STAFF_ROUTE_PATTERN.test(pathname);
}
