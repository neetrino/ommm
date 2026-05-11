import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";

const ACCOUNT_NAV = [
  { href: "/user/home", label: "Home" },
  { href: "/account/classes", label: "Classes" },
  { href: "/account/bookings", label: "Bookings" },
  { href: "/account/memberships", label: "Memberships" },
  { href: "/account/gift-cards", label: "Gift cards" },
  { href: "/account/settings", label: "Settings" },
  { href: "/coach/home", label: "Coach" },
  { href: "/admin/home", label: "Admin" },
] as const;

const navItemClass =
  "block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-sage-700 hover:bg-white/45 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper lg:w-auto lg:text-left";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen ommm-bg-wellness">
      <ShellHeader
        brandHref="/user/home"
        brandLabel="Account"
        navItems={[...ACCOUNT_NAV]}
        trailing={
          <>
            <LogoutButton className={`${navItemClass} text-left`} />
            <Link href="/" className={navItemClass}>
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
