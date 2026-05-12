import type { ReactNode } from "react";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
import { dashboardNavForRole } from "@/lib/dashboard-nav";
import {
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
  const { role } = await requireAuthForLayout(locale);
  redirectIfRoleNotIn(locale, role, COACH_ROLES);
  const nav = dashboardNavForRole(role);

  return (
    <DashboardAppShell
      brandHref="/coach/home"
      brandLabel="Coach"
      brandSubline="Schedule & roster"
      variant="indigo"
      contentMaxClass="max-w-5xl"
      navItems={nav}
      trailing={
        <>
          <LogoutButton className={`${trailingClass} lg:w-auto`} />
          <Link
            href="/user/home"
            className={`${trailingClass} text-center lg:text-left`}
          >
            Member zone
          </Link>
        </>
      }
    >
      {children}
    </DashboardAppShell>
  );
}
