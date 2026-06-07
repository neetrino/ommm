import { routing } from "@/i18n/routing";
import { UI_LOCALE_COOKIE_NAME } from "@/lib/ui-locale-constants";

const ONE_YEAR_SEC = 365 * 24 * 60 * 60;

function isRoutingLocale(value: string): boolean {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

/** Persists UI language after an explicit switch (login/register alignment). */
export function setUiLocaleCookie(locale: string): void {
  if (typeof document === "undefined") return;
  if (!isRoutingLocale(locale)) return;
  const secure = document.location.protocol === "https:";
  document.cookie = `${UI_LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)};path=/;max-age=${ONE_YEAR_SEC};SameSite=Lax${secure ? ";Secure" : ""}`;
}

export function pickUiLocaleForUser(
  userLocale: string | undefined,
  fallback: string,
): string {
  if (isRoutingLocale(fallback)) return fallback;
  if (userLocale && isRoutingLocale(userLocale)) return userLocale;
  return routing.defaultLocale;
}
