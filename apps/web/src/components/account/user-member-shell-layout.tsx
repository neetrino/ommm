import type { CSSProperties, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { MarketingSiteHeaderFromAuth } from "@/components/marketing/marketing-site-header-from-auth";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT } from "@/components/marketing/marketing-site-header-layout";
import { DashboardAppShell } from "@/components/shell/dashboard-app-shell";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
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

  const marketingHeaderShellStyle = {
    "--marketing-mobile-header-height": MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT,
  } as CSSProperties;

  return (
    <div
      className={offsetStyles.shellWithMarketingHeader}
      data-marketing-account-shell
      style={marketingHeaderShellStyle}
    >
      <MarketingSiteHeaderFromAuth />
      <DashboardAppShell
        brandHref={USER_ACCOUNT_PATH}
        brandLabel={tDash("brand.member.title")}
        brandSubline={tDash("brand.member.subline")}
        variant="member"
        contentMaxClass="w-full"
        navRole="USER"
        navDefinitions={navDefinitions}
        notificationRoute={notificationRoute}
        withMarketingSiteHeader
      >
        {children}
      </DashboardAppShell>
    </div>
  );
}
