import type { DashboardNavDefinition } from "@/lib/dashboard-nav";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

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
