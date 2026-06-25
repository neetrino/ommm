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
import {
  isHomeSectionEnabled,
  resolveMarketingSectionKeyFromPath,
  type HomePageSectionVisibility,
} from "@/lib/home-page-sections";
import { marketingPathNeedsGuestRealtime } from "@/lib/marketing-guest-realtime-paths";
import { localeFreePathFromRequestPathname } from "@/lib/marketing-path-from-request";
import type { MarketingNavLinkDefinition } from "@/lib/home-page-sections";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

type MarketingLayoutPathBoundaryProps = {
  locale: string;
  navLinks: readonly MarketingNavLinkDefinition[];
  visibility: HomePageSectionVisibility;
  children: React.ReactNode;
};

/**
 * Path-dependent marketing shell — isolates `headers()` and section guards
 * so visibility/nav fetches can stream in parallel with page content.
 */
export async function MarketingLayoutPathBoundary({
  locale,
  navLinks,
  visibility,
  children,
}: MarketingLayoutPathBoundaryProps) {
  const requestPathname = (await headers()).get(OMMM_PATHNAME_HEADER);
  const serverMarketingPath = localeFreePathFromRequestPathname(requestPathname);
  const sectionKey = resolveMarketingSectionKeyFromPath(serverMarketingPath);

  if (
    sectionKey !== null &&
    sectionKey !== "home" &&
    !isHomeSectionEnabled(visibility, sectionKey)
  ) {
    notFound();
  }

  const headerAccount = resolveMarketingHeaderAccount(await getOptionalLayoutAuthUser());
  const showFooterContact = isHomeSectionEnabled(visibility, "contact");
  const enableGuestRealtime = marketingPathNeedsGuestRealtime(serverMarketingPath);

  return (
    <MarketingRealtimeRoot
      serverAuthenticated={headerAccount !== null}
      enableGuestRealtime={enableGuestRealtime}
    >
      <MarketingLayoutShell>
        <Suspense
          fallback={
            <MarketingSiteHeaderWithClientAccount navLinks={navLinks} serverAccount={null} />
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
