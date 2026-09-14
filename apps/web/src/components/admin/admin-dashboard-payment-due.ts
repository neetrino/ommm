export type DashboardStudioPaymentDueItem = {
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
};

export const DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT = 3;

export function uniquePaymentDueClients(
  items: readonly DashboardStudioPaymentDueItem[],
): DashboardStudioPaymentDueItem[] {
  const seen = new Set<string>();
  const unique: DashboardStudioPaymentDueItem[] = [];
  for (const item of items) {
    if (seen.has(item.clientId)) {
      continue;
    }
    seen.add(item.clientId);
    unique.push(item);
  }
  return unique;
}

export function visiblePaymentDueClients(
  items: readonly DashboardStudioPaymentDueItem[],
  expanded: boolean,
): DashboardStudioPaymentDueItem[] {
  const unique = uniquePaymentDueClients(items);
  if (expanded) {
    return unique;
  }
  return unique.slice(0, DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT);
}
