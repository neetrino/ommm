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

const COACH_ROLES = new Set<string>(["COACH"]);

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-indigo-950 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2";

export default async function CoachSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role, userLocale } = await requireAuthForLayout(locale);
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, COACH_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
      brandHref="/coach/home"
      brandLabel={tDash("brand.coach.title")}
      brandSubline={tDash("brand.coach.subline")}
      variant="indigo"
      contentMaxClass="max-w-5xl"
      navRole="COACH"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
      trailing={
        <>
          <LogoutButton className={`${trailingClass} lg:w-auto`} />
          <Link
            href="/user/home"
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
