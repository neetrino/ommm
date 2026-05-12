import type { ReactNode } from "react";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Link } from "@/i18n/navigation";
import { dashboardNavForRole } from "@/lib/dashboard-nav";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const USER_ROLES = new Set<string>(["USER"]);

const trailingClass =
  "block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-sage-700 hover:bg-white/45 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper lg:w-auto lg:text-left";

export default async function UserMemberLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role } = await requireAuthForLayout(locale);
  redirectIfRoleNotIn(locale, role, USER_ROLES);
  const nav = dashboardNavForRole(role);

  return (
    <DashboardAppShell
      brandHref="/user/home"
      brandLabel="Member"
      brandSubline="Your wellness space"
      variant="wellness"
      contentMaxClass="w-full"
      navItems={nav}
      trailing={
        <>
          <LogoutButton className={`${trailingClass} text-left`} />
          <Link href="/" className={trailingClass}>
            Marketing site
          </Link>
        </>
      }
    >
      {children}
    </DashboardAppShell>
  );
}
