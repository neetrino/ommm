import type { DashboardNavDefinition } from "@/lib/dashboard-nav";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

export function HubLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function MemberAccountHubNavIcon({
  item,
}: {
  item: Pick<DashboardNavDefinition, "icon" | "oliveIconSlug">;
}) {
  if (item.oliveIconSlug) {
    return <AdminNavIcon slug={item.oliveIconSlug} className="h-5 w-5" />;
  }
  return <DashboardNavIcon name={item.icon} className="h-5 w-5 shrink-0" />;
}
