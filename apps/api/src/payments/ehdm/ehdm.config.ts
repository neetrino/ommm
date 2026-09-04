import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadEhdmCertAndKey } from './ehdm-cert.loader';
import {
  EHDM_DEFAULT_ADG_CODE,
  EHDM_DEFAULT_API_URL,
  EHDM_DEFAULT_CASHIER_ID,
  EHDM_DEFAULT_DEP,
  EHDM_DEFAULT_INITIAL_SEQ,
  EHDM_DEFAULT_UNIT,
} from './ehdm.constants';

@Injectable()
export class EhdmConfig {
  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return this.config.get<string>('EHDM_ENABLED') !== 'false';
  }

  isFullyConfigured(): boolean {
    if (!this.isEnabled()) {
      return false;
    }
    try {
      this.getCertPem();
      this.getKeyPem();
      this.getKeyPassphrase();
      this.getCrn();
      this.getTin();
      return this.getApiUrl().length > 0;
    } catch {
      return false;
    }
  }

  getApiUrl(): string {
    const raw = this.readOptional('EHDM_API_URL');
    return (raw ?? EHDM_DEFAULT_API_URL).replace(/\/+$/, '');
  }

  getCrn(): string {
    return this.readRequired('EHDM_CRN');
  }

  getTin(): string {
    return this.readRequired('EHDM_TIN');
  }

  getCertPem(): Buffer {
    return this.loadPem().cert;
  }

  getKeyPem(): Buffer {
    return this.loadPem().key;
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

  private loadPem(): { cert: Buffer; key: Buffer } {
    return loadEhdmCertAndKey({
      certBase64: this.readOptional('EHDM_CERT_BASE64'),
      keyBase64: this.readOptional('EHDM_KEY_BASE64'),
      certPath: this.readOptional('EHDM_CERT_PATH'),
      keyPath: this.readOptional('EHDM_KEY_PATH'),
    });
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
