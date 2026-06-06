export type FinanceSectionId = "overview" | "payments" | "members" | "coaches";

export const FINANCE_SECTION_IDS: readonly FinanceSectionId[] = [
  "overview",
  "payments",
  "members",
  "coaches",
] as const;

export const FINANCE_SECTION_HREF: Record<FinanceSectionId, string> = {
  overview: "/admin/finance/overview",
  payments: "/admin/finance/payments",
  members: "/admin/finance/members",
  coaches: "/admin/finance/coaches",
};

/** Legacy `?tab=` values from the monolith finance page. */
export function resolveFinanceLegacyTabRedirect(
  tab: string | undefined,
): FinanceSectionId | null {
  if (tab === "user") {
    return "members";
  }
  if (tab === "coach") {
    return "coaches";
  }
  return null;
}

export function resolveFinanceSectionFromPathname(pathname: string): FinanceSectionId | null {
  for (const section of FINANCE_SECTION_IDS) {
    const href = FINANCE_SECTION_HREF[section];
    if (pathname === href || pathname.endsWith(href)) {
      return section;
    }
  }
  return null;
}
