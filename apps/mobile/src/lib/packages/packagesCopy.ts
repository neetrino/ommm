/** English copy aligned with web marketing + userPages.packages strings. */
export const packagesCopy = {
  pageTitle: "Packages",
  myPackagesTitle: "My packages",
  myPackagesLead:
    "Your purchased plans appear here. Browse available packages when you are ready to buy.",
  catalogLead: "Choose a plan that fits how often you want to practice.",
  detailsCta: "Details",
  subscribeCta: "Subscribe",
  browsePackagesCta: "Browse packages",
  backToMyPackagesCta: "Back to my packages",
  noPackagesYet: "You don't have any packages at the moment.",
  membershipDetailsPrice: "Price",
  membershipDetailsValidity: "Validity",
  detailsClose: "Close",
  subscribeTitle: "Confirm purchase",
  subscribeConfirm: "Pay with card",
  subscribeSuccessTitle: "Purchase started",
  subscribeSuccessBody:
    "Your package will appear here once payment is confirmed. If you were redirected to pay, return here after completing checkout.",
  subscribeFailed: "Could not complete purchase. Try again.",
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
  loadMembershipsError: "Could not load your packages",
  loading: "Loading…",
} as const;

export function formatPackageValidityDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}
