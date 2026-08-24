import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EHDM_DEFAULT_ADG_CODE,
  EHDM_DEFAULT_API_URL,
  EHDM_DEFAULT_CASHIER_ID,
  EHDM_DEFAULT_DEP,
  EHDM_DEFAULT_INITIAL_SEQ,
  EHDM_DEFAULT_UNIT,
  EHDM_MOCK_CRN,
  EHDM_MOCK_TIN,
} from './ehdm.constants';

@Injectable()
export class EhdmConfig {
  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return this.config.get<string>('EHDM_ENABLED') !== 'false';
  }

  /** Mock when explicitly enabled or when live certificate env is missing. */
  isTestMode(): boolean {
    const explicit = this.config.get<string>('EHDM_TEST_MODE')?.trim();
    if (explicit === 'true') {
      return true;
    }
    if (explicit === 'false') {
      return false;
    }
    return !this.hasCertConfig();
  }

  getApiUrl(): string {
    const raw = this.config.get<string>('EHDM_API_URL')?.trim();
    return (raw && raw.length > 0 ? raw : EHDM_DEFAULT_API_URL).replace(
      /\/+$/,
      '',
    );
  }

  getCrn(): string {
    if (this.isTestMode()) {
      return this.readOptional('EHDM_CRN') ?? EHDM_MOCK_CRN;
    }
    return this.readRequired('EHDM_CRN');
  }

  getTin(): string {
    if (this.isTestMode()) {
      return this.readOptional('EHDM_TIN') ?? EHDM_MOCK_TIN;
    }
    return this.readRequired('EHDM_TIN');
  }

  getCertPath(): string {
    return this.readRequired('EHDM_CERT_PATH');
  }

  getKeyPath(): string {
    return this.readRequired('EHDM_KEY_PATH');
  }

  getKeyPassphrase(): string {
    return this.readRequired('EHDM_KEY_PASSPHRASE');
  }

  getInitialSeq(): number {
    return this.readPositiveInt('EHDM_INITIAL_SEQ', EHDM_DEFAULT_INITIAL_SEQ);
  }

  getDep(): number {
    return this.readPositiveInt('EHDM_DEP', EHDM_DEFAULT_DEP);
  }

  getDefaultAdgCode(): string {
    return this.readOptional('EHDM_DEFAULT_ADG_CODE') ?? EHDM_DEFAULT_ADG_CODE;
  }

  getDefaultUnit(): string {
    return this.readOptional('EHDM_DEFAULT_UNIT') ?? EHDM_DEFAULT_UNIT;
  }

  getCashierId(): number {
    return this.readPositiveInt('EHDM_CASHIER_ID', EHDM_DEFAULT_CASHIER_ID);
  }

  isLiveConfigured(): boolean {
    if (this.isTestMode()) {
      return true;
    }
    try {
      this.getCertPath();
      this.getKeyPath();
      this.getKeyPassphrase();
      this.getCrn();
      this.getTin();
      return true;
    } catch {
      return false;
    }
  }

  private hasCertConfig(): boolean {
    return (
      Boolean(this.readOptional('EHDM_CERT_PATH')) &&
      Boolean(this.readOptional('EHDM_KEY_PATH')) &&
      Boolean(this.readOptional('EHDM_KEY_PASSPHRASE'))
    );
  }

  private readOptional(key: string): string | undefined {
    const value = this.config.get<string>(key)?.trim();
    return value && value.length > 0 ? value : undefined;
  }

  private readRequired(key: string): string {
    const value = this.readOptional(key);
    if (!value) {
      throw new Error(`${key} is not configured`);
    }
    return value;
  }

  private readPositiveInt(key: string, fallback: number): number {
    const raw = this.readOptional(key);
    if (!raw) {
      return fallback;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
