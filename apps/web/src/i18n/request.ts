import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { routing } from "./routing";

const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";

function isRoutingLocale(value: string | undefined): value is (typeof routing.locales)[number] {
  return (
    value !== undefined &&
    routing.locales.includes(value as (typeof routing.locales)[number])
  );
}

function localeFromPathnameHeader(pathname: string | null): (typeof routing.locales)[number] | undefined {
  if (pathname === null || pathname === "") return undefined;
  const first = pathname.split("/").filter(Boolean)[0];
  return isRoutingLocale(first) ? first : undefined;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  try {
    const h = await headers();
    const fromPath = localeFromPathnameHeader(h.get(OMMM_PATHNAME_HEADER));
    if (fromPath !== undefined) {
      /** URL segment wins so RSC `getTranslations("…")` matches `[locale]` in the address bar. */
      locale = fromPath;
    } else if (!isRoutingLocale(locale)) {
      const fromHeader = h.get(HEADER_LOCALE);
      if (isRoutingLocale(fromHeader ?? undefined)) {
        locale = fromHeader as (typeof routing.locales)[number];
      }
    }
  } catch {
    /* headers unavailable (e.g. static analysis); keep locale as-is */
  }

  if (!isRoutingLocale(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
