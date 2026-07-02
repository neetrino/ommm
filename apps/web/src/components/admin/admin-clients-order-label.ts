const CLIENT_ORDER_LABELS: Record<string, string> = {
  newest: "Newest clients first",
  oldest: "Oldest clients first",
  "most-active": "Most active",
  "highest-lifetime-value": "Highest lifetime value",
  "last-visit-newest": "Last visit newest",
  "last-visit-oldest": "Last visit oldest",
  "most-bookings": "Most bookings",
  "most-cancellations": "Most cancellations",
};

export function resolveAdminClientsOrderLabel(order: string): string {
  return CLIENT_ORDER_LABELS[order] ?? "Newest clients first";
}
