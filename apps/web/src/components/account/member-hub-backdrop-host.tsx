"use client";

import { MemberAccountHub } from "@/components/account/member-account-hub";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";
import { readCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";

type MemberHubBackdropHostProps = {
  locale: string;
  profile: MemberAccountHubProfile | null;
};

function profileFromHeaderCache(): MemberAccountHubProfile | null {
  const cached = readCachedMarketingHeaderAccount();
  if (cached === null) {
    return null;
  }

  return {
    displayName: cached.displayName,
    email: "",
    initials: cached.initials,
    imageSrc: cached.imageSrc,
  };
}

/** Hub menu behind mobile sheets — server profile with client cache fallback. */
export function MemberHubBackdropHost({ locale, profile }: MemberHubBackdropHostProps) {
  const resolved = profile ?? profileFromHeaderCache();
  if (resolved === null) {
    return null;
  }

  return <MemberAccountHub locale={locale} {...resolved} />;
}
