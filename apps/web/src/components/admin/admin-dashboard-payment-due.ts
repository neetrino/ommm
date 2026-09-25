export type DashboardStudioPaymentDueItem = {
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
  categoryName?: string;
};

export type PaymentDuePackageLine = {
  packageId: string;
  packageName: string;
  categoryName?: string;
};

export type PaymentDueClientGroup = {
  clientId: string;
  clientName: string;
  packages: PaymentDuePackageLine[];
};

/** Category plus plan, without repeating a category already inside the plan name. */
export function formatPaymentDuePurchaseLabel(
  categoryName: string | undefined,
  packageName: string,
): string {
  const category = categoryName?.trim() ?? "";
  const plan = packageName.trim();
  if (category.length === 0) {
    return plan;
  }
  if (plan.toLocaleLowerCase().includes(category.toLocaleLowerCase())) {
    return plan;
  }
  return `${category} · ${plan}`;
}

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

/** First clients for the dashboard, with every unpaid package kept on the card. */
export function previewPaymentDueGroups(
  items: readonly DashboardStudioPaymentDueItem[],
): PaymentDueClientGroup[] {
  return groupPaymentDueByClient(items).slice(
    0,
    DASHBOARD_PAYMENT_DUE_PREVIEW_LIMIT,
  );
}

function toPackageLine(item: DashboardStudioPaymentDueItem): PaymentDuePackageLine {
  const line: PaymentDuePackageLine = {
    packageId: item.packageId,
    packageName: item.packageName,
  };
  if (item.categoryName) {
    line.categoryName = item.categoryName;
  }
  return line;
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
        packages: [toPackageLine(item)],
      });
      continue;
    }
    const group = groups[existing];
    if (!group) {
      continue;
    }
    group.packages.push(toPackageLine(item));
  }
  return groups;
}
