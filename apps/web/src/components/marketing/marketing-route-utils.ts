/** Locale-aware pathname from `@/i18n/navigation` (no locale prefix). */
export function isMarketingHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

/** Figma **Coaches** `62:2182` — dedicated page surface and hero-style header. */
export function isMarketingCoachesPath(pathname: string): boolean {
  return pathname === "/coaches" || pathname.startsWith("/coaches/");
}

/** Routes where the fixed header uses hero glass over a full-bleed marketing surface. */
export function isMarketingHeroHeaderPath(pathname: string): boolean {
  return isMarketingHomePath(pathname) || isMarketingCoachesPath(pathname);
}
