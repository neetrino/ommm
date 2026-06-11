import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

type MarketingLayoutHeaderSlotProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
};

/** Header auth fetch — isolated so page content can stream in parallel. */
export async function MarketingLayoutHeaderSlot({ navLinks }: MarketingLayoutHeaderSlotProps) {
  const headerAccount = resolveMarketingHeaderAccount(await getOptionalLayoutAuthUser());

  return (
    <MarketingSiteHeaderWithClientAccount navLinks={navLinks} serverAccount={headerAccount} />
  );
}
