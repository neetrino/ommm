import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";
import { USER_MEMBER_NAV } from "@/lib/user-nav";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const USER_ROLES = new Set<string>(["USER"]);

const navItemClass =
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

  return (
    <div className="min-h-screen ommm-bg-wellness">
      <ShellHeader
        brandHref="/user/home"
        brandLabel="Member"
        navItems={USER_MEMBER_NAV}
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
