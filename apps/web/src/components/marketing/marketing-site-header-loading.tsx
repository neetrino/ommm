import { MarketingSiteHeader } from "@/components/marketing/marketing-site-header";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";

/** Guest header shell while `/users/me` streams in — keeps layout stable. */
export function MarketingSiteHeaderLoading() {
  return <MarketingSiteHeader navLinks={MARKETING_NAV_LINKS} account={null} />;
}
