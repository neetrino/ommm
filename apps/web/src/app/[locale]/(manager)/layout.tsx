import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { WorkspaceShellFromAuth } from "@/components/shell/workspace-shell-from-auth";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const MANAGER_ROLES = new Set<string>(["MANAGER"]);

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
    <WorkspaceShellFromAuth
      authUser={authOutcome.auth.authUser}
      brandHref="/manager/home"
      brandLabel={tDash("brand.manager.title")}
      brandSubline={tDash("brand.manager.subline")}
      variant="admin"
      contentMaxClass="w-full"
      navRole="MANAGER"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
    >
      {children}
    </WorkspaceShellFromAuth>
  );
}
