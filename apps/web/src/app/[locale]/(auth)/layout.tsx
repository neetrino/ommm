import type { CSSProperties, ReactNode } from "react";
import { MarketingSiteHeaderFromAuth } from "@/components/marketing/marketing-site-header-from-auth";
import { MARKETING_MOBILE_HEADER } from "@/components/marketing/marketing-site-header-layout";
import offsetStyles from "@/components/marketing/marketing-site-header-offset.module.css";
import { SignupBannerParticles } from "@/components/auth/signup-banner-particles";
import styles from "./auth-layout.module.css";

const AUTH_SHELL_STYLE = {
  "--marketing-mobile-header-height": MARKETING_MOBILE_HEADER.shellHeight,
} as CSSProperties;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${styles.shell} ${offsetStyles.shellWithMarketingHeader} ommm-bg-auth`}
      data-auth-shell
      style={AUTH_SHELL_STYLE}
    >
      <SignupBannerParticles />
      <MarketingSiteHeaderFromAuth />
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
  );
}
