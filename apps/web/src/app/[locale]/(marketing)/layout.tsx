import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { MarketingPublicHomeFooter } from "@/components/marketing/home/marketing-public-home-footer";
import { MarketingFooterLoading } from "@/components/marketing/marketing-footer-loading";
import { MarketingFooterGate } from "@/components/marketing/marketing-footer-gate";
import { MarketingLayoutHeaderSlot } from "@/components/marketing/marketing-layout-header-slot";
import { MarketingLayoutShell } from "@/components/marketing/marketing-layout-shell";
import { MarketingLayoutMain } from "@/components/marketing/marketing-layout-main";
import { MarketingSiteHeaderWithClientAccount } from "@/components/marketing/marketing-site-header-with-client-account";
import { MarketingRealtimeRoot } from "@/components/realtime/marketing-realtime-root";
import { routing } from "@/i18n/routing";
import {
  isHomeSectionEnabled,
  resolveMarketingSectionKeyFromPath,
} from "@/lib/home-page-sections";
import { localeFreePathFromRequestPathname } from "@/lib/marketing-path-from-request";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import {
  getFilteredMarketingNavLinks,
  getHomeSectionsVisibility,
} from "@/server/home-sections-visibility";
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
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const requestPathname = (await headers()).get(OMMM_PATHNAME_HEADER);
  const serverMarketingPath = localeFreePathFromRequestPathname(requestPathname);
  const sectionKey = resolveMarketingSectionKeyFromPath(serverMarketingPath);
  const visibility = await getHomeSectionsVisibility();

  if (
    sectionKey !== null &&
    sectionKey !== "home" &&
    !isHomeSectionEnabled(visibility, sectionKey)
  ) {
    notFound();
  }

  const navLinks = await getFilteredMarketingNavLinks();
  const headerAccount = resolveMarketingHeaderAccount(
    await getOptionalLayoutAuthUser(),
  );
  const showFooterContact = isHomeSectionEnabled(visibility, "contact");

  return (
    <MarketingRealtimeRoot serverAuthenticated={headerAccount !== null}>
      <MarketingLayoutShell>
        <Suspense
          fallback={
            <MarketingSiteHeaderWithClientAccount
              navLinks={navLinks}
              serverAccount={null}
            />
          }
        >
          <MarketingLayoutHeaderSlot navLinks={navLinks} />
        </Suspense>
        <MarketingLayoutMain>{children}</MarketingLayoutMain>
        <MarketingFooterGate serverMarketingPath={serverMarketingPath}>
          <Suspense fallback={<MarketingFooterLoading />}>
            <MarketingPublicHomeFooter
              locale={locale}
              surfaceVariant="inner"
              showContactSection={showFooterContact}
            />
          </Suspense>
        </MarketingFooterGate>
      </MarketingLayoutShell>
    </MarketingRealtimeRoot>
  );
}
