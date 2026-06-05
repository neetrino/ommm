import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
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

const ADMIN_ROLES = new Set<string>(["ADMIN"]);

export default async function AdminSectionLayout({
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
  redirectIfRoleNotIn(locale, role, ADMIN_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <WorkspaceShellFromAuth
      authUser={authOutcome.auth.authUser}
      brandHref="/admin/dashboard"
      brandLabel={tDash("brand.admin.title")}
      brandSubline={tDash("brand.admin.subline")}
      variant="admin"
      contentMaxClass="w-full"
      navRole="ADMIN"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
    >
      {children}
    </WorkspaceShellFromAuth>
  );
}
