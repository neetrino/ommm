import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { userDisplayInitials } from "@/lib/user-display-initials";
import { userDisplayName } from "@/lib/user-display-name";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const USER_ROLES = new Set<string>(["USER"]);

/** Authenticated member (USER) dashboard chrome — `/user/*` namespace. */
export async function UserMemberShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const authOutcome = await requireAuthForLayout(locale);
  if (authOutcome.kind === "api_unavailable") {
    return <ApiUnavailablePanel />;
  }
  const { role, userLocale, authUser } = authOutcome.auth;
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, USER_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const tDash = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <DashboardAppShell
      brandHref={USER_ACCOUNT_PATH}
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
        imageSrc: resolveApiAssetUrl(authUser.homeImageUrl) ?? null,
        displayName: userDisplayName(
          authUser.name,
          authUser.lastName,
          authUser.email,
        ),
        roleKey: authUser.role,
      }}
    >
      {children}
    </DashboardAppShell>
  );
}
