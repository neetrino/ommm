import { normalizeAppUiLocale } from '../common/app-ui-locales';

const DEFAULT_UI_LOCALE = 'en';
const WEB_DEFAULT_URL = 'http://localhost:3000';
const WEB_AUTH_ENTRY_SEGMENT = 'account';
const WEB_LOGIN_SEGMENT = 'login';

/** Query value for a Google sign-in whose account was already closed. */
export const GOOGLE_NO_ACCOUNT_ERROR = 'no_account';

function webBase(configured: string | undefined): string {
  const trimmed = configured?.trim() ?? '';
  const base = trimmed.length > 0 ? trimmed : WEB_DEFAULT_URL;
  return base.replace(/\/$/, '');
}

export function resolveWebEntryUrl(
  locale: string | null | undefined,
  configured: string | undefined,
): string {
  const normalized = normalizeAppUiLocale(
    locale ?? undefined,
    DEFAULT_UI_LOCALE,
  );
  return `${webBase(configured)}/${normalized}/${WEB_AUTH_ENTRY_SEGMENT}`;
}

/** Login page that tells the member this email no longer has an account. */
export function resolveClosedAccountLoginUrl(
  locale: string | null | undefined,
  configured: string | undefined,
): string {
  const normalized = normalizeAppUiLocale(
    locale ?? undefined,
    DEFAULT_UI_LOCALE,
  );
  const error = encodeURIComponent(GOOGLE_NO_ACCOUNT_ERROR);
  return `${webBase(configured)}/${normalized}/${WEB_LOGIN_SEGMENT}?error=${error}`;
}
