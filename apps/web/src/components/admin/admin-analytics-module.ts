export type AnalyticsSectionId = "overview" | "revenue" | "bookings" | "members" | "coaches";

export const ANALYTICS_SECTION_IDS: readonly AnalyticsSectionId[] = [
  "overview",
  "revenue",
  "bookings",
  "members",
  "coaches",
] as const;

export const ANALYTICS_SECTION_HREF: Record<AnalyticsSectionId, string> = {
  overview: "/admin/analytics/overview",
  revenue: "/admin/analytics/revenue",
  bookings: "/admin/analytics/bookings",
  members: "/admin/analytics/members",
  coaches: "/admin/analytics/coaches",
};

export function resolveAnalyticsSectionFromPathname(
  pathname: string,
): AnalyticsSectionId | null {
  for (const section of ANALYTICS_SECTION_IDS) {
    const href = ANALYTICS_SECTION_HREF[section];
    if (pathname === href || pathname.endsWith(href)) {
      return section;
    }
  }
  return null;
}
