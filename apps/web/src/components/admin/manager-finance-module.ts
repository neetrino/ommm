/** Manager finance sections — today-only Overview and Payments (no Coaches). */
export const MANAGER_FINANCE_SECTION_IDS = ["overview", "payments"] as const;

export type ManagerFinanceSectionId = (typeof MANAGER_FINANCE_SECTION_IDS)[number];

export const MANAGER_FINANCE_SECTION_HREF: Record<ManagerFinanceSectionId, string> = {
  overview: "/manager/finance/overview",
  payments: "/manager/finance/payments",
};

export function resolveManagerFinanceSection(pathname: string): ManagerFinanceSectionId {
  const match = MANAGER_FINANCE_SECTION_IDS.find((section) =>
    pathname.endsWith(MANAGER_FINANCE_SECTION_HREF[section]),
  );
  return match ?? "overview";
}
