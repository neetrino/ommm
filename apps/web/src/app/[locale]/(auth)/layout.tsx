import type { CSSProperties, ReactNode } from "react";
import { connection } from "next/server";
import { MarketingSectionsVisibilityBoundary } from "@/components/marketing/marketing-sections-visibility-boundary";
import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import { MARKETING_MOBILE_HEADER } from "@/components/marketing/marketing-site-header-layout";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { AuthShellBackgroundDecor } from "@/components/auth/auth-shell-background-decor";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { getFilteredMarketingNavLinks } from "@/server/home-sections-visibility";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";
import styles from "./auth-layout.module.css";

export const dynamic = "force-dynamic";

const AUTH_SHELL_STYLE = {
  "--marketing-mobile-header-height": MARKETING_MOBILE_HEADER.shellHeight,
} as CSSProperties;

export default async function AuthLayout({ children }: { children: ReactNode }) {
  await connection();
  const headerAccount = resolveMarketingHeaderAccount(
    await getOptionalLayoutAuthUser(),
  );
  const navLinks = await getFilteredMarketingNavLinks();

  return (
    <MarketingSectionsVisibilityBoundary>
      <div
        className={`${styles.shell} ${offsetStyles.shellWithMarketingHeader} ommm-bg-auth`}
        data-auth-shell
        style={AUTH_SHELL_STYLE}
      >
        <AuthShellBackgroundDecor />
        <MarketingSiteHeaderWithClientAccount
          navLinks={navLinks}
          serverAccount={headerAccount}
        />
        <div
          className={`${styles.foreground} ${offsetStyles.dashboardWithMarketingHeader}`}
        >
          <div className={styles.main}>
            <div
              className={`${styles.card} ommm-card p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </MarketingSectionsVisibilityBoundary>
  );
}
