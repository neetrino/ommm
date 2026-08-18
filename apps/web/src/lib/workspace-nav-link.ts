/** Workspace sidebar / header links — prefetch RSC so the next page is ready on click. */
export const WORKSPACE_ROUTE_PREFETCH = true;

/** Locale-prefixed path for full document navigation (bypasses Next.js intercept routes). */
export function localizedWorkspaceHref(locale: string, href: string): string {
  if (href === "/") {
    return `/${locale}`;
  }
  return `/${locale}${href}`;
}
