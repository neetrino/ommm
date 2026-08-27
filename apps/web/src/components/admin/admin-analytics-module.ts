export type AnalyticsSectionId = "overview" | "revenue" | "bookings" | "members" | "coaches";

export type AnalyticsWorkspace = "admin" | "manager";

export const ANALYTICS_SECTION_IDS: readonly AnalyticsSectionId[] = [
  "overview",
  "revenue",
  "bookings",
  "members",
  "coaches",
] as const;

export const MANAGER_ANALYTICS_SECTION_IDS = [
  "overview",
  "bookings",
  "members",
  "coaches",
] as const satisfies readonly AnalyticsSectionId[];

export const ANALYTICS_SECTION_HREF: Record<AnalyticsSectionId, string> = {
  overview: "/admin/analytics/overview",
  revenue: "/admin/analytics/revenue",
  bookings: "/admin/analytics/bookings",
  members: "/admin/analytics/members",
  coaches: "/admin/analytics/coaches",
};

export const MANAGER_ANALYTICS_SECTION_HREF: Record<
  Exclude<AnalyticsSectionId, "revenue">,
  string
> = {
  overview: "/manager/analytics/overview",
  bookings: "/manager/analytics/bookings",
  members: "/manager/analytics/members",
  coaches: "/manager/analytics/coaches",
};

export function analyticsSectionIdsFor(
  workspace: AnalyticsWorkspace,
): readonly AnalyticsSectionId[] {
  return workspace === "admin" ? ANALYTICS_SECTION_IDS : MANAGER_ANALYTICS_SECTION_IDS;
}

export function analyticsSectionHref(
  section: AnalyticsSectionId,
  workspace: AnalyticsWorkspace = "admin",
): string {
  if (workspace === "manager") {
    if (section === "revenue") {
      return MANAGER_ANALYTICS_SECTION_HREF.overview;
    }
    return MANAGER_ANALYTICS_SECTION_HREF[section];
  }
  return ANALYTICS_SECTION_HREF[section];
}

export function resolveAnalyticsSectionFromPathname(
  pathname: string,
  workspace?: AnalyticsWorkspace,
): AnalyticsSectionId | null {
  const sections = workspace ? analyticsSectionIdsFor(workspace) : ANALYTICS_SECTION_IDS;
  for (const section of sections) {
    const href = analyticsSectionHref(section, workspace ?? "admin");
    if (pathname === href || pathname.endsWith(href)) {
      return section;
    }
  }
  if (workspace === undefined) {
    for (const section of MANAGER_ANALYTICS_SECTION_IDS) {
      const href = MANAGER_ANALYTICS_SECTION_HREF[section];
      if (pathname === href || pathname.endsWith(href)) {
        return section;
      }
    }
  }
  return null;
}

export function resolveAnalyticsWorkspaceFromPathname(
  pathname: string,
): AnalyticsWorkspace | null {
  if (pathname.includes("/manager/analytics")) {
    return "manager";
  }
  if (pathname.includes("/admin/analytics")) {
    return "admin";
  }
  return null;
}
