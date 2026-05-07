import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";

const ACCOUNT_NAV = [
  { href: "/account", label: "Home" },
  { href: "/account/classes", label: "Classes" },
  { href: "/account/bookings", label: "Bookings" },
  { href: "/account/memberships", label: "Memberships" },
  { href: "/account/gift-cards", label: "Gift cards" },
  { href: "/account/settings", label: "Settings" },
  { href: "/coach", label: "Coach" },
  { href: "/admin", label: "Admin" },
] as const;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen ommm-bg-wellness">
      <ShellHeader
        brandHref="/account"
        brandLabel="Account"
        navItems={[...ACCOUNT_NAV]}
        trailing={
          <>
            <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto" />
            <Link
              href="/"
              className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 lg:w-auto lg:text-left"
            >
              Marketing site
            </Link>
          </>
        }
      />
      <div className="w-full px-4 pb-8 pt-0 sm:px-6 sm:pb-10 lg:px-8">
        {children}
      </div>
    </div>
  );
}
