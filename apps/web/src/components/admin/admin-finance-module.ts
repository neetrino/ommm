export type FinanceSectionId = "overview" | "payments" | "coaches";

export const FINANCE_SECTION_IDS: readonly FinanceSectionId[] = [
  "overview",
  "payments",
  "coaches",
] as const;

export const FINANCE_SECTION_HREF: Record<FinanceSectionId, string> = {
  overview: "/admin/finance/overview",
  payments: "/admin/finance/payments",
  coaches: "/admin/finance/coaches",
};

export const FINANCE_COACH_PAYOUT_HISTORY_HREF = "/admin/finance/coaches/payout-history";

export const FINANCE_SECTION_COOKIE_NAME = "ommm_finance_section";

/** Validates a finance section id from cookies, legacy `?tab=`, etc. */
export function parseFinanceSectionId(value: string | undefined): FinanceSectionId | null {
  if (value && FINANCE_SECTION_IDS.includes(value as FinanceSectionId)) {
    return value as FinanceSectionId;
  }
  return null;
}

/** Legacy `?tab=` values from the monolith finance page. */
export function resolveFinanceLegacyTabRedirect(
  tab: string | undefined,
): FinanceSectionId | null {
  const section = parseFinanceSectionId(tab);
  if (section) {
    return section;
  }
  /** Removed Members tab — old bookmarks land on Overview. */
  if (tab === "user" || tab === "members") {
    return "overview";
  }
  if (tab === "coach") {
    return "coaches";
  }
  return null;
}

function pathnameMatchesFinanceHref(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    pathname.endsWith(href) ||
    pathname.includes(`${href}/`)
  );
}

export function resolveFinanceSectionFromPathname(pathname: string): FinanceSectionId | null {
  for (const section of FINANCE_SECTION_IDS) {
    if (pathnameMatchesFinanceHref(pathname, FINANCE_SECTION_HREF[section])) {
      return section;
    }
  }
  return null;
}

export function isFinanceCoachPayoutHistoryPath(pathname: string): boolean {
  return (
    pathname === FINANCE_COACH_PAYOUT_HISTORY_HREF ||
    pathname.endsWith(FINANCE_COACH_PAYOUT_HISTORY_HREF)
  );
}
