import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminAnalyticsShell } from "@/components/admin/admin-analytics-shell";
import type { AnalyticsSectionId, AnalyticsWorkspace } from "@/components/admin/admin-analytics-module";
import {
  loadAdminAnalyticsPayload,
  redirectIfUnscopedAnalyticsSearchParams,
} from "@/components/admin/admin-analytics-server-helpers";

export async function AdminAnalyticsTabPage({
  locale,
  section,
  search,
  workspace = "admin",
}: {
  locale: string;
  section: AnalyticsSectionId;
  search: Record<string, string | string[] | undefined>;
  workspace?: AnalyticsWorkspace;
}) {
  redirectIfUnscopedAnalyticsSearchParams(locale, section, search, workspace);
  const t = await getTranslations({ locale, namespace: "adminPages.analytics" });
  const cookie = (await headers()).get("cookie") ?? "";
  const result = await loadAdminAnalyticsPayload(locale, search, cookie);

  if (!result.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {result.status === 401 || result.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: result.status })}
      </div>
    );
  }

  return (
    <AdminAnalyticsShell
      data={result.data}
      section={section}
      includeFinance={workspace === "admin"}
    />
  );
}
