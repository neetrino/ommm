import { headers } from "next/headers";
import { AdminAnalyticsUnifiedHeader } from "@/components/admin/admin-analytics-unified-header";
import { loadAnalyticsFilterOptions } from "@/components/admin/admin-analytics-server-helpers";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";

export default async function ManagerAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = (await headers()).get("cookie") ?? "";
  const filterOptions = await loadAnalyticsFilterOptions(cookie);

  return (
    <AdminContentFrame>
      <div className="flex flex-col gap-6">
        <AdminAnalyticsUnifiedHeader filterOptions={filterOptions} workspace="manager" />
        {children}
      </div>
    </AdminContentFrame>
  );
}
