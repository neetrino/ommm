/** Data-heavy workspace routes — disable Next.js link prefetch (sidebar, header). */
export const WORKSPACE_ROUTE_PREFETCH = false;

/** Locale-prefixed path for full document navigation (bypasses Next.js intercept routes). */
export function localizedWorkspaceHref(locale: string, href: string): string {
  if (href === "/") {
    return `/${locale}`;
  }
  return `/${locale}${href}`;
}
