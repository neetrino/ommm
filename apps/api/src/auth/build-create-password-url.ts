/**
 * Builds the public invite URL for first-time password setup.
 * Uses a path segment (not `?token=`) so middleware/email clients cannot drop it.
 */
export function buildCreatePasswordUrl(params: {
  webAppUrl: string;
  locale: string;
  token: string;
}): string {
  const base = params.webAppUrl.trim().replace(/\/+$/, "");
  const locale = params.locale.trim() || "en";
  const token = params.token.trim();
  return `${base}/${locale}/create-password/${encodeURIComponent(token)}`;
}
