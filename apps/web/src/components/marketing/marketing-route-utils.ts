/** Locale-aware pathname from `@/i18n/navigation` (no locale prefix). */
export function isMarketingHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

/** Figma **Coaches** `62:2182` — dedicated page surface and hero-style header. */
export function isMarketingCoachesPath(pathname: string): boolean {
  return pathname === "/coaches" || pathname.startsWith("/coaches/");
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
  return (
    isMarketingHomePath(pathname) ||
    isMarketingCoachesPath(pathname) ||
    isMarketingInnerPath(pathname)
  );
}
