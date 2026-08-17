"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState, type CSSProperties } from "react";
import {
  MarketingSiteHeader,
  type MarketingHeaderAccount,
} from "@/components/marketing/marketing-site-header";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import type { MarketingNavLinkDefinition } from "@/lib/home-page-sections";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT } from "@/components/marketing/marketing-site-header-layout";
import { useMarketingHeaderOffsetSync } from "@/components/marketing/use-marketing-header-offset-sync";
import {
  DashboardAppShell,
  type DashboardAppShellProps,
} from "@/components/shell/dashboard-app-shell";
import { dashboardNavPathActive } from "@/lib/dashboard-nav";
import { useMemberUserHomeScrollTop } from "@/hooks/use-member-user-home-scroll-top";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";
import { markClientSessionHint } from "@/lib/client-session-hint";
import { writeCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";
import { usePathname } from "@/i18n/navigation";

export type WorkspaceShellProps = Omit<
  DashboardAppShellProps,
  "withSiteHeader" | "drawerOpen" | "onDrawerOpenChange"
> & {
  account: MarketingHeaderAccount;
  marketingNavLinks?: readonly MarketingNavLinkDefinition[];
};

/** Authenticated workspace chrome — global site header + dashboard shell. */
export function WorkspaceShell({
  account,
  marketingNavLinks = MARKETING_NAV_LINKS,
  notificationRoute,
  navRole,
  children,
  ...shellProps
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const tNav = useTranslations("dashboard.nav");
  const [drawerOpen, setDrawerOpen] = useState(false);
  useMarketingHeaderOffsetSync(true);

  useLayoutEffect(() => {
    writeCachedMarketingHeaderAccount(account);
    markClientSessionHint();
  }, [account]);

  const notificationsLabel = useMemo(() => {
    if (!notificationRoute) {
      return null;
    }
    return (tNav as (key: string) => string)(
      `${navRole}.${notificationRoute.labelKey}`,
    );
  }, [notificationRoute, navRole, tNav]);

  const notificationsActive =
    notificationRoute !== null &&
    dashboardNavPathActive(pathname, notificationRoute.href);

  const isMemberShell = shellProps.variant === "member";
  useMemberUserHomeScrollTop(isMemberShell);

  const shellStyle = {
    "--marketing-mobile-header-height": MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT,
  } as CSSProperties;

  return (
    <RealtimeProvider authenticated enablePublic={false}>
      <div
        className={offsetStyles.shellWithMarketingHeader}
        data-workspace-shell
        data-marketing-account-shell
        style={shellStyle}
      >
      <MarketingSiteHeader
        navLinks={marketingNavLinks}
        account={account}
        workspaceHeaderChrome
        memberWorkspaceHeader={isMemberShell}
        showMemberNotifications={isMemberShell}
        workspaceDrawer={
          isMemberShell
            ? undefined
            : {
                open: drawerOpen,
                onToggle: () => setDrawerOpen((open) => !open),
              }
        }
        notificationHref={notificationRoute?.href ?? null}
        notificationsLabel={notificationsLabel}
        notificationsActive={notificationsActive}
        callTasksListHref={
          navRole === "ADMIN"
            ? "/admin/calls"
            : navRole === "MANAGER"
              ? "/manager/calls"
              : null
        }
        sessionReviewsAudience={
          navRole === "USER"
            ? "member"
            : navRole === "ADMIN" || navRole === "MANAGER"
              ? "staff"
              : navRole === "COACH"
                ? "coach"
                : null
        }
        sessionReviewsListHref={
          navRole === "USER"
            ? "/user/reviews"
            : navRole === "ADMIN"
              ? "/admin/reviews"
              : navRole === "MANAGER"
                ? "/manager/reviews"
                : navRole === "COACH"
                  ? "/coach/reviews"
                  : null
        }
      />
      <DashboardAppShell
        {...shellProps}
        navRole={navRole}
        notificationRoute={notificationRoute}
        withSiteHeader
        drawerOpen={isMemberShell ? false : drawerOpen}
        onDrawerOpenChange={isMemberShell ? undefined : setDrawerOpen}
      >
        {children}
      </DashboardAppShell>
      </div>
    </RealtimeProvider>
  );
}
