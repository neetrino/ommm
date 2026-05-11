import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const MANAGER_NAV = [
  { href: "/manager/home", label: "Home" },
  { href: "/manager/bookings", label: "Bookings" },
  { href: "/manager/clients", label: "Clients" },
  { href: "/manager/profile", label: "Profile" },
  { href: "/manager/settings", label: "Settings" },
] as const;

const MANAGER_ROLES = new Set<string>(["MANAGER"]);

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

  return (
    <div className="min-h-screen bg-zinc-100">
      <ShellHeader
        brandHref="/manager/home"
        brandLabel="Manager"
        contentMaxClass="max-w-6xl"
        navItems={[...MANAGER_NAV]}
        trailing={
          <>
            <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto" />
            <Link
              href="/user/home"
              className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto lg:text-left"
            >
              Member zone
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">{children}</div>
    </div>
  );
}
