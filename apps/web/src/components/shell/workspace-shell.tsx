"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, type CSSProperties } from "react";
import {
  MarketingSiteHeader,
  type MarketingHeaderAccount,
} from "@/components/marketing/marketing-site-header";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT } from "@/components/marketing/marketing-site-header-layout";
import { useMarketingHeaderOffsetSync } from "@/components/marketing/use-marketing-header-offset-sync";
import {
  DashboardAppShell,
  type DashboardAppShellProps,
} from "@/components/shell/dashboard-app-shell";
import { dashboardNavPathActive } from "@/lib/dashboard-nav";
import { usePathname } from "@/i18n/navigation";

export type WorkspaceShellProps = Omit<
  DashboardAppShellProps,
  "withSiteHeader" | "drawerOpen" | "onDrawerOpenChange"
> & {
  account: MarketingHeaderAccount;
};

/** Authenticated workspace chrome — global site header + dashboard shell. */
export function WorkspaceShell({
  account,
  notificationRoute,
  navRole,
  children,
  ...shellProps
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const tNav = useTranslations("dashboard.nav");
  const [drawerOpen, setDrawerOpen] = useState(false);
  useMarketingHeaderOffsetSync(true);

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

  const shellStyle = {
    "--marketing-mobile-header-height": MARKETING_MOBILE_ACCOUNT_SHELL_HEIGHT,
  } as CSSProperties;

  return (
    <div
      className={offsetStyles.shellWithMarketingHeader}
      data-workspace-shell
      data-marketing-account-shell
      style={shellStyle}
    >
      <MarketingSiteHeader
        navLinks={MARKETING_NAV_LINKS}
        account={account}
        workspaceDrawer={{
          open: drawerOpen,
          onToggle: () => setDrawerOpen((open) => !open),
        }}
        notificationHref={notificationRoute?.href ?? null}
        notificationsLabel={notificationsLabel}
        notificationsActive={notificationsActive}
      />
      <DashboardAppShell
        {...shellProps}
        navRole={navRole}
        notificationRoute={notificationRoute}
        withSiteHeader
        drawerOpen={drawerOpen}
        onDrawerOpenChange={setDrawerOpen}
      >
        {children}
      </DashboardAppShell>
    </div>
  );
}
