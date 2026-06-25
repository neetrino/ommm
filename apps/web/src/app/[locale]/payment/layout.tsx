import type { CSSProperties, ReactNode } from "react";
import { connection } from "next/server";
import { MarketingSectionsVisibilityBoundary } from "@/components/marketing/marketing-sections-visibility-boundary";
import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import { MARKETING_MOBILE_HEADER } from "@/components/marketing/marketing-site-header-layout";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { getFilteredMarketingNavLinks } from "@/server/home-sections-visibility";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";
import styles from "./payment-result-layout.module.css";

export const dynamic = "force-dynamic";

const PAYMENT_RESULT_SHELL_STYLE = {
  "--marketing-mobile-header-height": MARKETING_MOBILE_HEADER.shellHeight,
} as CSSProperties;

export default async function PaymentResultLayout({ children }: { children: ReactNode }) {
  await connection();
  const headerAccount = resolveMarketingHeaderAccount(
    await getOptionalLayoutAuthUser(),
  );
  const navLinks = await getFilteredMarketingNavLinks();

  return (
    <MarketingSectionsVisibilityBoundary>
      <div
        className={`${styles.shell} ${offsetStyles.shellWithMarketingHeader} ommm-bg-auth`}
        data-payment-result-shell
      >
        <MarketingSiteHeaderWithClientAccount
          navLinks={navLinks}
          serverAccount={headerAccount}
        />
        <div
          className={`${styles.foreground} ${offsetStyles.dashboardWithMarketingHeader}`}
          style={PAYMENT_RESULT_SHELL_STYLE}
        >
          <div className={styles.main}>
            <div className={styles.card}>{children}</div>
          </div>
        </div>
      </div>
    </MarketingSectionsVisibilityBoundary>
  );
}
