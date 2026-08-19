import {
  normalizeAppUiLocale,
  type AppUiLocale,
} from '../common/app-ui-locales';

export const EMAIL_UI_LOCALE_FALLBACK: AppUiLocale = 'en';

const DEFAULT_WEB_APP_URL = 'http://localhost:3000';

/** Normalizes a stored locale for email deep links. */
export function resolveEmailLocale(value: string | undefined): AppUiLocale {
  return normalizeAppUiLocale(value, EMAIL_UI_LOCALE_FALLBACK);
}

/** Strips trailing slashes from `WEB_APP_URL`, with a local fallback. */
export function resolveWebAppUrl(raw: string | undefined): string {
  const trimmed = raw?.trim() ?? '';
  if (trimmed.length === 0) {
    return DEFAULT_WEB_APP_URL;
  }
  return trimmed.replace(/\/+$/, '');
}

/** Builds `/{locale}/{path}` on the public web app. */
export function buildEmailAppPath(
  webAppUrl: string,
  locale: string,
  path: string,
): string {
  const base = resolveWebAppUrl(webAppUrl);
  const cleanPath = path.replace(/^\/+/, '');
  return `${base}/${locale}/${cleanPath}`;
}

/** Member home used as a generic account CTA. */
export function buildMemberAccountUrl(
  webAppUrl: string,
  locale: string,
): string {
  return buildEmailAppPath(webAppUrl, locale, 'user/dashboard');
}

/** Gift cards page for redeem / view CTAs. */
export function buildMemberGiftCardsUrl(
  webAppUrl: string,
  locale: string,
): string {
  return buildEmailAppPath(webAppUrl, locale, 'user/gift-cards');
}

/** Bookings list for class reminder CTAs. */
export function buildMemberBookingsUrl(
  webAppUrl: string,
  locale: string,
): string {
  return buildEmailAppPath(webAppUrl, locale, 'user/bookings');
}

/** Public schedule — used when a class is cancelled and members need another time. */
export function buildPublicScheduleUrl(
  webAppUrl: string,
  locale: string,
): string {
  return buildEmailAppPath(webAppUrl, locale, 'schedule');
}

/** Waitlist list for offer / update CTAs. */
export function buildMemberWaitlistsUrl(
  webAppUrl: string,
  locale: string,
): string {
  return buildEmailAppPath(webAppUrl, locale, 'user/waitlists');
}
