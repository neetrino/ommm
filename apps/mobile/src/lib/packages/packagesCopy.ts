/** English copy aligned with web `marketing` namespace packages strings. */
export const packagesCopy = {
  pageTitle: "Packages",
  pageLead: "Choose a plan that fits how often you want to practice.",
  detailsCta: "Details",
  subscribeCta: "Subscribe",
  discountBadge: "Special offer",
  sessionsUnlimitedShort: "Unlimited",
  tableTotalSessions: "Total sessions",
  tablePrice: "Price",
  originalPrice: "Original price",
  tableValidity: "Validity",
  tableGuests: "Guests",
  typeSessionsType: "Type",
  typeSessionsSession: "Sessions",
  empty: "No packages available right now.",
  loadError: "Could not load packages",
  loading: "Loading…",
} as const;

export function formatPackageValidityDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}
