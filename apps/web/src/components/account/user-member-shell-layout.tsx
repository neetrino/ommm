import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import { Link } from "@/i18n/navigation";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import { USER_DASHBOARD_PATH } from "@/lib/role-home";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { userDisplayInitials } from "@/lib/user-display-initials";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const USER_ROLES = new Set<string>(["USER"]);

const trailingClass =
  "block w-full rounded-r-full py-2.5 pl-6 pr-5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ommm-admin-cream)]/85 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ommm-admin-olive)]";

/** Authenticated member (USER) dashboard chrome — shared by `/dashboard` and `/user/*`. */
export async function UserMemberShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { role, userLocale, authUser } = await requireAuthForLayout(locale);
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, USER_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
      brandHref={USER_DASHBOARD_PATH}
      brandLabel={tDash("brand.member.title")}
      brandSubline={tDash("brand.member.subline")}
      variant="member"
      contentMaxClass="w-full"
      navRole="USER"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
      memberProfile={{
        initials: userDisplayInitials(
          authUser.name,
          authUser.lastName,
          authUser.email,
        ),
        imageSrc: resolveApiAssetUrl(authUser.homeImageUrl),
      }}
      trailing={
        <Link href="/" className={trailingClass}>
          {tDash("links.marketingSite")}
        </Link>
      }
    >
      {children}
    </DashboardAppShell>
  );
}
