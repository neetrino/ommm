const DEFAULT_LINK_LOCALE = 'en';

export type AuthTokenUrlParams = {
  webAppUrl: string;
  locale: string;
  token: string;
};

/**
 * Builds `/{locale}/{route}/<token>` on the public web app.
 * The token is a path segment (not `?token=`) because some email clients and
 * in-app browsers strip query strings from links.
 */
export function buildAuthTokenUrl(
  route: string,
  params: AuthTokenUrlParams,
): string {
  const base = params.webAppUrl.trim().replace(/\/+$/, '');
  const locale = params.locale.trim() || DEFAULT_LINK_LOCALE;
  const cleanRoute = route.replace(/^\/+|\/+$/g, '');
  const token = params.token.trim();
  return `${base}/${locale}/${cleanRoute}/${encodeURIComponent(token)}`;
}
