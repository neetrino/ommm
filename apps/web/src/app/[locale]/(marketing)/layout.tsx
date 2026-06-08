import { notFound } from "next/navigation";
import { connection } from "next/server";
import { headers } from "next/headers";
import { Suspense } from "react";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingFooterLoading } from "@/components/marketing/marketing-footer-loading";
import { MarketingFooterGate } from "@/components/marketing/marketing-footer-gate";
import { MarketingLayoutShell } from "@/components/marketing/marketing-layout-shell";
import { MarketingLayoutMain } from "@/components/marketing/marketing-layout-main";
import { MARKETING_NAV_LINKS } from "@/components/marketing/marketing-nav-links";
import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import { routing } from "@/i18n/routing";
import { localeFreePathFromRequestPathname } from "@/lib/marketing-path-from-request";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

export const dynamic = "force-dynamic";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps) {
  await connection();
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const requestPathname = (await headers()).get(OMMM_PATHNAME_HEADER);
  const serverMarketingPath = localeFreePathFromRequestPathname(requestPathname);
  const headerAccount = resolveMarketingHeaderAccount(
    await getOptionalLayoutAuthUser(),
  );

  return (
    <MarketingLayoutShell>
      <MarketingSiteHeaderWithClientAccount
        navLinks={MARKETING_NAV_LINKS}
        serverAccount={headerAccount}
      />
      <MarketingLayoutMain>{children}</MarketingLayoutMain>
      <MarketingFooterGate serverMarketingPath={serverMarketingPath}>
        <Suspense fallback={<MarketingFooterLoading />}>
          <MarketingPublicHomeFooter locale={locale} surfaceVariant="inner" />
        </Suspense>
      </MarketingFooterGate>
    </MarketingLayoutShell>
  );
}
