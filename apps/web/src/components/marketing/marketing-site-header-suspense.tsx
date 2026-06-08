import { Suspense } from "react";
import { MarketingSiteHeaderFromAuth } from "@/components/marketing/marketing-site-header-from-auth";
import { MarketingSiteHeaderLoading } from "@/components/marketing/marketing-site-header-loading";

/** Non-blocking marketing header — auth resolves in a nested Suspense boundary. */
export function MarketingSiteHeaderSuspense() {
  return (
    <Suspense fallback={<MarketingSiteHeaderLoading />}>
      <MarketingSiteHeaderFromAuth />
    </Suspense>
  );
}
