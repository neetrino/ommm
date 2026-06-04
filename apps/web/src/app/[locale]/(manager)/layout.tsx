import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import { USER_DASHBOARD_PATH } from "@/lib/role-home";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const MANAGER_ROLES = new Set<string>(["MANAGER"]);

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-sage-700 hover:bg-white/45 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export default async function ManagerSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const authOutcome = await requireAuthForLayout(locale);
  if (authOutcome.kind === "api_unavailable") {
    return <ApiUnavailablePanel />;
  }
  const { role, userLocale } = authOutcome.auth;
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, MANAGER_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
      brandHref="/manager/home"
      brandLabel={tDash("brand.manager.title")}
      brandSubline={tDash("brand.manager.subline")}
      contentMaxClass="max-w-6xl"
      navRole="MANAGER"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
      trailing={
        <>
          <LogoutButton className={`${trailingClass} lg:w-auto`} />
          <Link
            href={USER_DASHBOARD_PATH}
            className={`${trailingClass} text-center lg:text-left`}
          >
            {tDash("links.memberZone")}
          </Link>
        </>
      }
    >
      {children}
    </DashboardAppShell>
  );
}
