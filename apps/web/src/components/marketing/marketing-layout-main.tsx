import type { ReactNode } from "react";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";

type MarketingLayoutMainProps = {
  children: ReactNode;
};

/**
 * Inner routes offset the fixed header via {@link MarketingPublicPageSection} hero padding (coaches parity).
 */
export function MarketingLayoutMain({ children }: MarketingLayoutMainProps) {
  return <main className={shellStyles.main}>{children}</main>;
}
