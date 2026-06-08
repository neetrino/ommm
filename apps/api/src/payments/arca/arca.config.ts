import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ARCA_REST_PATH = '/payment/rest';

@Injectable()
export class ArcaConfig {
  constructor(private readonly config: ConfigService) {}

  getBaseUrl(): string {
    const raw = this.config.get<string>('ARCA_API_BASE_URL')?.trim();
    if (!raw) {
      throw new Error('ARCA_API_BASE_URL is not configured');
    }

    const normalized = raw.replace(/\/+$/, '');
    if (normalized.endsWith(ARCA_REST_PATH)) {
      return normalized;
    }
    return `${normalized}${ARCA_REST_PATH}`;
  }

  getCredentials(): { userName: string; password: string } {
    const userName = this.config.get<string>('ARCA_API_USERNAME');
    const password = this.config.get<string>('ARCA_API_PASSWORD');

    if (!userName?.trim() || !password?.trim()) {
      throw new Error('Arca API credentials are not configured');
    }

    return { userName: userName.trim(), password: password.trim() };
  }

  getCurrencyCode(): string {
    return this.config.get<string>('ARCA_CURRENCY_CODE')?.trim() || '051';
  }

  getDefaultLanguage(): string {
    return this.config.get<string>('ARCA_LANGUAGE')?.trim() || 'en';
  }

  isForce3ds2(): boolean {
    return this.config.get<string>('ARCA_FORCE_3DS2') !== 'false';
  }

  getBank(): string {
    return this.config.get<string>('ARCA_BANK')?.trim() || 'epg';
  }

  getAppUrl(): string {
    const appUrl =
      this.config.get<string>('APP_URL') ??
      this.config.get<string>('WEB_APP_URL') ??
      'http://localhost:3000';
    return appUrl.trim().replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    try {
      this.getCredentials();
      this.getBaseUrl();
      return true;
    } catch {
      return false;
    }
  }
}
