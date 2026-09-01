import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { WhatsappCredentialsService } from './whatsapp-credentials.service';
import {
  isGatewayMessageSent,
  parseGatewayAccounts,
  parseGatewaySession,
  readGatewayError,
  type GatewayEnvelope,
  type WhatsappAccountSummary,
} from './whatsapp-gateway.envelope';
import {
  isWhatsappSessionConnected,
  WHATSAPP_GATEWAY_TIMEOUT_MS,
  WHATSAPP_TEXT_MESSAGE_TYPE,
} from './whatsapp.constants';

@Injectable()
export class WhatsappGatewayClient {
  private readonly logger = new Logger(WhatsappGatewayClient.name);

  constructor(private readonly credentials: WhatsappCredentialsService) {}

  async isConfigured(): Promise<boolean> {
    try {
      return (await this.credentials.resolve()) !== null;
    } catch (error) {
      this.logger.warn(
        `WhatsApp credentials lookup failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return false;
    }
  }

  async sendText(chatId: string, text: string): Promise<boolean> {
    const accountId = await this.resolveSendAccountId();
    if (accountId === null) {
      return false;
    }
    const result = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/messages`,
      {
        method: 'POST',
        body: { type: WHATSAPP_TEXT_MESSAGE_TYPE, chatId, text },
        extraHeaders: { 'Idempotency-Key': `omm-wa-${randomUUID()}` },
      },
    );
    return result.ok && (result.data === null || isGatewayMessageSent(result.data));
  }

  async listAccounts(): Promise<WhatsappAccountSummary[]> {
    const result = await this.request('/api/v1/accounts', { method: 'GET' });
    if (!result.ok) {
      return [];
    }
    return parseGatewayAccounts(result.data);
  }

  /** True when URL + token are accepted by Gateway (`GET /api/v1/accounts`). */
  async probe(): Promise<boolean> {
    const result = await this.request('/api/v1/accounts', { method: 'GET' });
    return result.ok;
  }

  /**
   * Reads the shared Gateway session. QR is fetched only when pairing is
   * requested and the account is not already connected.
   */
  async getSession(
    accountId: string,
    options?: { includeQr?: boolean },
  ): Promise<{
    status: string | null;
    qrDataUrl: string | null;
    phoneNumber: string | null;
  }> {
    const fromStatus = await this.readSessionView(accountId, 'status');
    if (isWhatsappSessionConnected(fromStatus.status)) {
      return {
        status: fromStatus.status,
        qrDataUrl: null,
        phoneNumber: fromStatus.phoneNumber,
      };
    }
    if (options?.includeQr === true) {
      const fromQr = await this.readSessionView(accountId, 'qr');
      return {
        status: fromQr.status ?? fromStatus.status,
        qrDataUrl: fromQr.qrDataUrl,
        phoneNumber: fromStatus.phoneNumber ?? fromQr.phoneNumber,
      };
    }
    if (fromStatus.status !== null) {
      return {
        status: fromStatus.status,
        qrDataUrl: null,
        phoneNumber: fromStatus.phoneNumber,
      };
    }
    const listed = (await this.listAccounts()).find(
      (row) => row.id === accountId,
    );
    return {
      status: listed?.status ?? null,
      qrDataUrl: null,
      phoneNumber: listed?.phoneNumber ?? null,
    };
  }

  async logout(accountId: string): Promise<boolean> {
    const result = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/session/logout`,
      { method: 'POST' },
    );
    return result.ok;
  }

  async restart(accountId: string): Promise<boolean> {
    const result = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/session/restart`,
      { method: 'POST' },
    );
    return result.ok;
  }

  private async resolveSendAccountId(): Promise<string | null> {
    const stored = await this.credentials.getStoredAccountId();
    if (stored !== null) {
      return stored;
    }
    const accounts = await this.listAccounts();
    const connected = accounts.find((row) =>
      isWhatsappSessionConnected(row.status),
    );
    return connected?.id ?? accounts[0]?.id ?? null;
  }

  private async readSessionView(
    accountId: string,
    view: 'status' | 'qr',
  ): Promise<{
    status: string | null;
    qrDataUrl: string | null;
    phoneNumber: string | null;
  }> {
    const suffix = view === 'qr' ? 'qr' : 'status';
    const result = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/${suffix}`,
      { method: 'GET' },
    );
    return parseGatewaySession(result.data);
  }

  private async request(
    path: string,
    options: {
      method: 'GET' | 'POST';
      body?: Record<string, string>;
      extraHeaders?: Record<string, string>;
    },
  ): Promise<{ ok: boolean; data: unknown }> {
    const creds = await this.credentials.resolve();
    if (creds === null) {
      return { ok: false, data: null };
    }
    try {
      const response = await fetch(`${creds.baseUrl}${path}`, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${creds.token}`,
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.extraHeaders,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(WHATSAPP_GATEWAY_TIMEOUT_MS),
      });
      const text = await response.text();
      const result = (
        text.length > 0 ? JSON.parse(text) : { success: response.ok }
      ) as GatewayEnvelope;
      if (!response.ok || result.success !== true) {
        this.logger.warn(
          `WhatsApp Gateway ${options.method} ${path} failed HTTP ${response.status} ${readGatewayError(result)}`,
        );
        return { ok: false, data: result.data ?? null };
      }
      return { ok: true, data: result.data ?? null };
    } catch (error) {
      this.logger.warn(
        `WhatsApp Gateway request failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
      return { ok: false, data: null };
    }
  }
}
