"use client";

import { useEffect, useState } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  MARKETING_HEADER_ACCOUNT_UPDATED,
  readCachedMarketingHeaderAccount,
} from "@/lib/marketing-header-account-cache";
import { marketingAudienceFromHeaderHref } from "@/lib/marketing-audience-from-header-href";

function audienceFromHeaderCache(): PublicPackageCategoryCardsAudience {
  const cached = readCachedMarketingHeaderAccount();
  if (cached === null) {
    return "guest";
  }
  return marketingAudienceFromHeaderHref(cached.href);
}

/** Client marketing audience — avoids blocking page data on `/users/me`. */
export function useMarketingAudience(): PublicPackageCategoryCardsAudience {
  const [audience, setAudience] = useState<PublicPackageCategoryCardsAudience>(
    audienceFromHeaderCache,
  );

  useEffect(() => {
    const syncAudience = () => {
      setAudience(audienceFromHeaderCache());
    };

    syncAudience();
    window.addEventListener(MARKETING_HEADER_ACCOUNT_UPDATED, syncAudience);
    return () => {
      window.removeEventListener(MARKETING_HEADER_ACCOUNT_UPDATED, syncAudience);
    };
  }, []);

  return audience;
}
