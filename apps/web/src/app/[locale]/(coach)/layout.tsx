import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ShellHeader } from "@/components/shell/shell-header";
import { Link } from "@/i18n/navigation";
import {
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const COACH_NAV = [
  { href: "/coach/home", label: "Schedule" },
  { href: "/coach/analytics", label: "Analytics" },
  { href: "/coach/salary", label: "Salary" },
  { href: "/coach/profile", label: "Profile" },
  { href: "/coach/settings", label: "Settings" },
] as const;

const COACH_ROLES = new Set<string>(["COACH"]);

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

  return (
    <div className="min-h-screen bg-indigo-50/50">
      <ShellHeader
        brandHref="/coach/home"
        brandLabel="Coach"
        variant="indigo"
        navItems={[...COACH_NAV]}
        trailing={
          <>
            <LogoutButton className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-indigo-950 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:w-auto" />
            <Link
              href="/user/home"
              className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-indigo-950 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 lg:w-auto lg:text-left"
            >
              Member zone
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</div>
    </div>
  );
}
