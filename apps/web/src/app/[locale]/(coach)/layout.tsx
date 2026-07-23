import type { ReactNode } from "react";
import { connection } from "next/server";
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

const COACH_ROLES = new Set<string>(["COACH"]);

export default async function CoachSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await connection();
  const { locale } = await params;
  const authOutcome = await requireAuthForLayout(locale);
  if (authOutcome.kind === "api_unavailable") {
    return <ApiUnavailablePanel />;
  }
  const { role, userLocale } = authOutcome.auth;
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, COACH_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <WorkspaceShellFromAuth
      authUser={authOutcome.auth.authUser}
      brandHref="/coach/home"
      brandLabel={tDash("brand.coach.title")}
      brandSubline={tDash("brand.coach.subline")}
      variant="admin"
      contentMaxClass="w-full"
      navRole="COACH"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
    >
      {children}
    </WorkspaceShellFromAuth>
  );
}
