"use client";

import { useSyncExternalStore } from "react";
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

function subscribeAudience(onStoreChange: () => void): () => void {
  const handler = () => {
    onStoreChange();
  };
  window.addEventListener(MARKETING_HEADER_ACCOUNT_UPDATED, handler);
  return () => {
    window.removeEventListener(MARKETING_HEADER_ACCOUNT_UPDATED, handler);
  };
}

/** Client marketing audience — avoids blocking page data on `/users/me`. */
export function useMarketingAudience(): PublicPackageCategoryCardsAudience {
  return useSyncExternalStore(
    subscribeAudience,
    audienceFromHeaderCache,
    () => "guest",
  );
}
