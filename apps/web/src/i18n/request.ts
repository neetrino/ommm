import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { routing } from "./routing";

const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (
    locale === undefined ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    try {
      const fromHeader = (await headers()).get(HEADER_LOCALE);
      if (
        fromHeader &&
        routing.locales.includes(fromHeader as (typeof routing.locales)[number])
      ) {
        locale = fromHeader as (typeof routing.locales)[number];
      }
    } catch {
      /* headers unavailable (e.g. static analysis); keep locale as-is */
    }
  }
  if (
    locale === undefined ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
