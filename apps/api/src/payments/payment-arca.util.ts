import type { ConfigService } from '@nestjs/config';

/** True when Arca REST credentials are configured (card checkout uses bank redirect). */
export function isArcaCheckoutEnabled(config: ConfigService): boolean {
  const userName = config.get<string>('ARCA_API_USERNAME');
  const password = config.get<string>('ARCA_API_PASSWORD');
  const baseUrl = config.get<string>('ARCA_API_BASE_URL');
  return Boolean(userName?.trim() && password?.trim() && baseUrl?.trim());
}
