import { routing } from "@/i18n/routing";

const ROUTING_LOCALE_SEGMENTS = new Set<string>(routing.locales);

/**
 * Removes leading routing locale segments.
 * After a client locale switch, `usePathname()` can still be `/en/user` while
 * `useLocale()` is already `ru`, so next-intl does not unprefix it. A second
 * switch then navigates to `/ru/en/user`.
 */
export function stripRoutingLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  while (segments.length > 0 && ROUTING_LOCALE_SEGMENTS.has(segments[0] ?? "")) {
    segments.shift();
  }
  if (segments.length === 0) {
    return "/";
  }
  return `/${segments.join("/")}`;
}
