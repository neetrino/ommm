import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
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

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-sage-700 hover:bg-white/45 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper lg:w-auto lg:text-left";

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
      brandHref="/admin/home"
      brandLabel={tDash("brand.backoffice.title")}
      brandSubline={tDash("brand.backoffice.subline")}
      variant="wellness"
      contentMaxClass="w-full"
      navRole="ADMIN"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
      trailing={
        <>
          <LogoutButton className={`${trailingClass} text-left`} />
          <Link href="/user/home" className={trailingClass}>
            {tDash("links.memberZone")}
          </Link>
        </>
      }
    >
      {children}
    </DashboardAppShell>
  );
}
