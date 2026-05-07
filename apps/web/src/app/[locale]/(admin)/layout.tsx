import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/content", label: "Content" },
] as const;

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-100">
      <ShellHeader
        brandHref="/admin"
        brandLabel="Backoffice"
        contentMaxClass="max-w-6xl"
        navItems={[...ADMIN_NAV]}
        trailing={
          <>
            <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto" />
            <Link
              href="/account"
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
