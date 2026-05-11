import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";

const MANAGER_NAV = [
  { href: "/manager/home", label: "Home" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/clients", label: "Clients" },
] as const;

export default function ManagerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              href="/account"
              className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto lg:text-left"
            >
              Account hub
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">{children}</div>
    </div>
  );
}
