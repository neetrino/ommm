import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const ADMIN_NAV = [
  { href: "/admin/home", label: "Dashboard" },
  { href: "/admin/clients", label: "Users" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/settings", label: "Settings" },
] as const;

const ADMIN_ROLES = new Set<string>(["ADMIN", "CONTENT_ADMIN"]);

export default async function AdminSectionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role } = await requireAuthForLayout(locale);
  redirectIfRoleNotIn(locale, role, ADMIN_ROLES);

  return (
    <div className="min-h-screen bg-zinc-100">
      <ShellHeader
        brandHref="/admin/home"
        brandLabel="Backoffice"
        contentMaxClass="max-w-6xl"
        navItems={[...ADMIN_NAV]}
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
