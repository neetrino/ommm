import type { ReactNode } from "react";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
import { dashboardNavForRole } from "@/lib/dashboard-nav";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const MANAGER_ROLES = new Set<string>(["MANAGER"]);

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

export default async function ManagerSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role } = await requireAuthForLayout(locale);
  redirectIfRoleNotIn(locale, role, MANAGER_ROLES);
  const nav = dashboardNavForRole(role);

  return (
    <DashboardAppShell
      brandHref="/manager/home"
      brandLabel="Manager"
      contentMaxClass="max-w-6xl"
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
