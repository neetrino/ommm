import { MarketingSiteHeader } from "@/components/marketing/marketing-site-header";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

/** Server-rendered marketing header with optional authenticated account menu. */
export async function MarketingSiteHeaderFromAuth() {
  const authUser = await getOptionalLayoutAuthUser();
  const account = resolveMarketingHeaderAccount(authUser);

  return (
    <MarketingSiteHeader navLinks={MARKETING_NAV_LINKS} account={account} />
  );
}
