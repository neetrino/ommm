import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
import { dashboardNavDefinitionsForRole } from "@/lib/dashboard-nav";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const CONTENT_ADMIN_ROLES = new Set<string>(["CONTENT_ADMIN"]);

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default async function ContentAdminSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role, userLocale } = await requireAuthForLayout(locale);
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, CONTENT_ADMIN_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
      brandHref="/content-admin/home"
      brandLabel={tDash("brand.contentAdmin.title")}
      brandSubline={tDash("brand.contentAdmin.subline")}
      contentMaxClass="max-w-6xl"
      navRole="CONTENT_ADMIN"
      navDefinitions={navDefinitions}
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
