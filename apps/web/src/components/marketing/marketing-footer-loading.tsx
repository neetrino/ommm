import type { CSSProperties } from "react";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";

const FOOTER_LOADING_STYLE = {
  "--home-footer-wrap-bg": "transparent",
  "--home-footer-wrap-padding-top": "0",
} as CSSProperties;

/** Reserves footer space while the layout footer streams in. */
export function MarketingFooterLoading() {
  return (
    <div className={styles.sectionWrap} style={FOOTER_LOADING_STYLE} aria-hidden>
      <div className="min-h-[clamp(24rem,55vw,36rem)] animate-pulse rounded-t-[50px] bg-white/10" />
    </div>
  );
}
