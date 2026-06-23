/** Page root markers — shell/footer styling follows mounted content via `:has()`, not URL. */
export const MARKETING_HOME_PAGE_MARKER = "data-marketing-home";
export const MARKETING_INNER_PAGE_MARKER = "data-marketing-inner";
/** Explore index — full-bleed coming soon surface without inner-page gradient. */
export const MARKETING_EXPLORE_COMING_SOON_MARKER = "data-marketing-explore-coming-soon";
/** Coaches hero keeps cream header ink over the teal gradient (`62:2182`). */
export const MARKETING_COACHES_HERO_MARKER = "data-marketing-coaches-hero";

/** Locale-aware pathname from `@/i18n/navigation` (no locale prefix). */
export function isMarketingHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

/** Authenticated member area — marketing hero header scroll treatment does not apply. */
export function isUserAccountPath(pathname: string): boolean {
  return pathname === "/user" || pathname.startsWith("/user/");
}

const AUTH_HEADER_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/** Auth sign-in / registration — light surfaces, elevated global header ink. */
export function isAuthPath(pathname: string): boolean {
  return AUTH_HEADER_PATHS.some(
    (segment) => pathname === segment || pathname.startsWith(`${segment}/`),
  );
}

/** Figma **Coaches** `62:2182` — dedicated page surface and hero-style header. */
export function isMarketingCoachesPath(pathname: string): boolean {
  return pathname === "/coaches" || pathname.startsWith("/coaches/");
}

/** Public schedule page — scroll-reveal card + footer. */
export function isMarketingSchedulePath(pathname: string): boolean {
  return pathname === "/schedule" || pathname.startsWith("/schedule/");
}

/** Public membership/packages pages — scroll-reveal cards + footer. */
export function isMarketingMembershipPath(pathname: string): boolean {
  return (
    pathname === "/package" ||
    pathname.startsWith("/package/") ||
    pathname === "/membership" ||
    pathname.startsWith("/membership/") ||
    pathname === "/memberships" ||
    pathname.startsWith("/memberships/") ||
    pathname === "/packages" ||
    pathname.startsWith("/packages/")
  );
}

/** @deprecated Prefer {@link isMarketingMembershipPath} — kept for call-site clarity. */
export function isMarketingPackagesPath(pathname: string): boolean {
  return isMarketingMembershipPath(pathname);
}

/** Explore index — coming soon placeholder (Figma `422:1810`). */
export function isMarketingExploreComingSoonPath(pathname: string): boolean {
  return pathname === "/explore";
}

/** Public explore post pages — scroll-reveal cards + footer. */
export function isMarketingExplorePath(pathname: string): boolean {
  return pathname.startsWith("/explore/");
}

/** Public contact page — scroll-reveal sections + footer. */
export function isMarketingContactPath(pathname: string): boolean {
  return pathname === "/contact" || pathname.startsWith("/contact/");
}

/** Public story page — scroll-reveal content + footer. */
export function isMarketingStoryPath(pathname: string): boolean {
  return pathname === "/story" || pathname.startsWith("/story/");
}

/** Legal policy routes — olive surface matching marketing navbar glass pill. */
export const MARKETING_POLICY_PAGE_MARKER = "data-marketing-policy";

/** Cancellation & refund policy — scroll-reveal content + footer. */
export function isMarketingRefundPath(pathname: string): boolean {
  return pathname === "/refund" || pathname.startsWith("/refund/");
}

/** Privacy policy — scroll-reveal content + footer. */
export function isMarketingPrivacyPath(pathname: string): boolean {
  return pathname === "/privacy" || pathname.startsWith("/privacy/");
}

/** Terms and conditions — scroll-reveal content + footer. */
export function isMarketingTermsPath(pathname: string): boolean {
  return pathname === "/terms" || pathname.startsWith("/terms/");
}

/** Privacy, terms, and refund — shared olive policy surface (not coaches gradient). */
export function isMarketingPolicyPath(pathname: string): boolean {
  return (
    isMarketingRefundPath(pathname) ||
    isMarketingPrivacyPath(pathname) ||
    isMarketingTermsPath(pathname)
  );
}

/** Marketing pages whose layout footer uses the shared scroll-reveal entrance. */
export function isMarketingScrollRevealFooterPath(pathname: string): boolean {
  return (
    isMarketingCoachesPath(pathname) ||
    isMarketingExplorePath(pathname) ||
    isMarketingSchedulePath(pathname) ||
    isMarketingPackagesPath(pathname) ||
    isMarketingContactPath(pathname) ||
    isMarketingStoryPath(pathname) ||
    isMarketingRefundPath(pathname) ||
    isMarketingPrivacyPath(pathname) ||
    isMarketingTermsPath(pathname)
  );
}

/** All marketing routes except home — coaches-style gradient shell + footer blend. */
export function isMarketingInnerPath(pathname: string): boolean {
  return !isMarketingHomePath(pathname);
}

/**
 * Routes where the fixed header starts flat over the page surface and elevates to the
 * liquid-glass pill after scroll (home, coaches, and all other public marketing pages).
 */
export function isMarketingHeroHeaderPath(pathname: string): boolean {
  if (isUserAccountPath(pathname)) {
    return false;
  }

  return (
    isMarketingHomePath(pathname) ||
    isMarketingCoachesPath(pathname) ||
    isMarketingInnerPath(pathname)
  );
}
