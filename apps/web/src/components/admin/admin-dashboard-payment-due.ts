export type DashboardStudioPaymentDueItem = {
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
};

export type PaymentDueClientGroup = {
  clientId: string;
  clientName: string;
  packages: Array<{ packageId: string; packageName: string }>;
};

export const DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT = 5;
export const STUDIO_PAYMENT_DUE_ENDPOINT = "/reports/dashboard/payment-due";

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

export function previewPaymentDueClients(
  items: readonly DashboardStudioPaymentDueItem[],
): DashboardStudioPaymentDueItem[] {
  return uniquePaymentDueClients(items).slice(
    0,
    DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT,
  );
}

export function groupPaymentDueByClient(
  items: readonly DashboardStudioPaymentDueItem[],
): PaymentDueClientGroup[] {
  const groups: PaymentDueClientGroup[] = [];
  const indexByClient = new Map<string, number>();
  for (const item of items) {
    const existing = indexByClient.get(item.clientId);
    if (existing === undefined) {
      indexByClient.set(item.clientId, groups.length);
      groups.push({
        clientId: item.clientId,
        clientName: item.clientName,
        packages: [{ packageId: item.packageId, packageName: item.packageName }],
      });
      continue;
    }
    const group = groups[existing];
    if (!group) {
      continue;
    }
    group.packages.push({
      packageId: item.packageId,
      packageName: item.packageName,
    });
  }
  return groups;
}
