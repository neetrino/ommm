/** Ensures guestCount is present when the API omits it (pre-migration rows). */
export function normalizeAdminPackageRow(row: AdminPackageRow): AdminPackageRow {
  return {
    ...row,
    planType: row.planType ?? "SINGLE",
    allowedCategoryNames: Array.isArray(row.allowedCategoryNames)
      ? row.allowedCategoryNames
      : [],
    guestCount: typeof row.guestCount === "number" ? row.guestCount : 0,
    pricePerSessionCents:
      typeof row.pricePerSessionCents === "number" ? row.pricePerSessionCents : 0,
    features: Array.isArray(row.features) ? row.features : [],
  };
}

export type AdminPackageRow = {
  id: string;
  name: string;
  categoryName: string;
  classTypeId?: string | null;
  planType?: "SINGLE" | "COMBINED";
  allowedCategoryNames?: string[];
  description: string | null;
  priceCents: number;
  pricePerSessionCents?: number;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  features: string[];
  buttonLabel: string;
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  guestCount?: number;
  createdAt: string;
};

export type PackageSortOrder =
  | "displayOrder"
  | "newest"
  | "oldest"
  | "priceHigh"
  | "priceLow";

export type PackageStatusFilter = "all" | "active" | "inactive";

export type PackageFilterValues = {
  search: string;
  status: PackageStatusFilter;
  order: PackageSortOrder;
};

export function sortAdminPackageRows(
  rows: readonly AdminPackageRow[],
): AdminPackageRow[] {
  return [...rows].sort((left, right) => left.displayOrder - right.displayOrder);
}

export function upsertAdminPackageRow(
  rows: readonly AdminPackageRow[],
  saved: AdminPackageRow,
): AdminPackageRow[] {
  const index = rows.findIndex((row) => row.id === saved.id);
  if (index === -1) {
    return sortAdminPackageRows([...rows, saved]);
  }
  const next = [...rows];
  next[index] = saved;
  return sortAdminPackageRows(next);
}

/** Keep optimistic rows until the server list includes them. */
export function mergeAdminPackageRowsFromServer(
  local: readonly AdminPackageRow[],
  server: readonly AdminPackageRow[],
): AdminPackageRow[] {
  const serverIds = new Set(server.map((row) => row.id));
  const pendingLocal = local.filter((row) => !serverIds.has(row.id));
  if (pendingLocal.length === 0) {
    return sortAdminPackageRows(server);
  }
  return sortAdminPackageRows([...server, ...pendingLocal]);
}
