import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
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
  const { role, userLocale } = await requireAuthForLayout(locale);
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, ADMIN_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
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
    </DashboardAppShell>
  );
}
