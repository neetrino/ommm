import { routing } from "@/i18n/routing";

/** Strip `[locale]` prefix from middleware pathname — matches `@/i18n/navigation` `usePathname()`. */
export function localeFreePathFromRequestPathname(pathname: string | null): string {
  if (pathname === null || pathname === "") {
    return "/";
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return "/";
  }

  const [first, ...rest] = segments;
  if (routing.locales.includes(first as (typeof routing.locales)[number])) {
    if (rest.length === 0) {
      return "/";
    }
    return `/${rest.join("/")}`;
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
