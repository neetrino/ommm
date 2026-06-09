import type { ConfigService } from '@nestjs/config';

/** True only when Arca is explicitly enabled and REST credentials are configured. */
export function isArcaCheckoutEnabled(config: ConfigService): boolean {
  if (config.get<string>('ARCA_CHECKOUT_ENABLED') !== 'true') {
    return false;
  }
  const userName = config.get<string>('ARCA_API_USERNAME');
  const password = config.get<string>('ARCA_API_PASSWORD');
  const baseUrl = config.get<string>('ARCA_API_BASE_URL');
  return Boolean(userName?.trim() && password?.trim() && baseUrl?.trim());
}
