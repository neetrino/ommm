type CoachPackageSource = {
  id: string;
  status: string;
  packageName: string;
  categoryName: string;
  activationDate: string;
  expirationDate: string;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
  awaitingFirstVisit?: boolean;
  activationDeadline?: string | null;
};

export type CoachClientPackageItem = {
  id: string;
  status: string;
  packageName: string;
  categoryName: string;
  activationDate: string;
  expirationDate: string;
  awaitingFirstVisit: boolean;
  activationDeadline: string | null;
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

export type CoachClientPackagesPage = {
  items: CoachClientPackageItem[];
  total: number;
  take: number;
  offset: number;
};

/** Package card fields only. Payment, price, and staff actions stay off the coach API. */
export function toCoachClientPackageItem(
  item: CoachPackageSource,
): CoachClientPackageItem {
  return {
    id: item.id,
    status: item.status,
    packageName: item.packageName,
    categoryName: item.categoryName,
    activationDate: item.activationDate,
    expirationDate: item.expirationDate,
    awaitingFirstVisit: item.awaitingFirstVisit === true,
    activationDeadline: item.activationDeadline ?? null,
    totalSessions: item.totalSessions,
    usedSessions: item.usedSessions,
    remainingSessions: item.remainingSessions,
    isUnlimited: item.isUnlimited,
  };
}

export function toCoachClientPackagesPage(page: {
  items: CoachPackageSource[];
  total: number;
  take: number;
  offset: number;
}): CoachClientPackagesPage {
  return {
    items: page.items.map(toCoachClientPackageItem),
    total: page.total,
    take: page.take,
    offset: page.offset,
  };
}
