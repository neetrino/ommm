import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { WorkspaceShellFromAuth } from "@/components/shell/workspace-shell-from-auth";
import {
  dashboardNavDefinitionsForRole,
} from "@/lib/dashboard-nav";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const CONTENT_ADMIN_ROLES = new Set<string>(["CONTENT_ADMIN"]);

export default async function ContentAdminSectionLayout({
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
  redirectIfRoleNotIn(locale, role, CONTENT_ADMIN_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <WorkspaceShellFromAuth
      authUser={authOutcome.auth.authUser}
      brandHref="/content-admin/home"
      brandLabel={tDash("brand.contentAdmin.title")}
      brandSubline={tDash("brand.contentAdmin.subline")}
      variant="admin"
      contentMaxClass="w-full"
      navRole="CONTENT_ADMIN"
      navDefinitions={navDefinitions}
    >
      {children}
    </WorkspaceShellFromAuth>
  );
}
