import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';

const WEB_APP_DEFAULT_ORIGIN = 'http://localhost:3000';

/** Allows http(s) to localhost, loopback, or IPv4 (with optional port) for LAN dev. */
const LAN_HTTP_ORIGIN_REGEX =
  /^https?:\/\/(localhost|127\.0\.0\.1|[0-9]{1,3}(\.[0-9]{1,3}){3})(:\d+)?$/;

function parseOrigins(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === '') {
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Nest/Express CORS `origin` callback: allows the web app, optional extra origins,
 * non-browser clients with no `Origin` (typical for React Native), and LAN HTTP(s)
 * in development only.
 */
export function createNestCorsOriginDelegate(): CustomOrigin {
  const isProduction = process.env.NODE_ENV === 'production';
  const webUrl = process.env.WEB_APP_URL ?? WEB_APP_DEFAULT_ORIGIN;
  const extraOrigins = parseOrigins(process.env.CORS_ORIGINS);

  return (origin, callback) => {
    if (origin === undefined || origin === '') {
      callback(null, true);
      return;
    }

    const baseline = isProduction
      ? [webUrl, ...extraOrigins]
      : [
          webUrl,
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          ...extraOrigins,
        ];

    if (new Set(baseline).has(origin)) {
      callback(null, true);
      return;
    }

    if (!isProduction && LAN_HTTP_ORIGIN_REGEX.test(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  };
}
