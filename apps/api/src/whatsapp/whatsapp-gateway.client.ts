import { Injectable, Logger } from '@nestjs/common';
import { WhatsappCredentialsService } from './whatsapp-credentials.service';
import {
  parseGatewayAccounts,
  parseGatewaySession,
  readGatewayError,
  type GatewayEnvelope,
  type WhatsappAccountSummary,
} from './whatsapp-gateway.envelope';
import { WHATSAPP_GATEWAY_TIMEOUT_MS } from './whatsapp.constants';

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
    const result = await this.request('/api/messages/send', {
      method: 'POST',
      body: { chatId, text },
    });
    return result.ok;
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

  async getSession(accountId: string): Promise<{
    status: string | null;
    qrDataUrl: string | null;
  }> {
    const qr = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/qr`,
      { method: 'GET' },
    );
    const fromQr = parseGatewaySession(qr.data);
    if (fromQr.status !== null || fromQr.qrDataUrl !== null) {
      return fromQr;
    }
    const status = await this.request(
      `/api/v1/accounts/${encodeURIComponent(accountId)}/status`,
      { method: 'GET' },
    );
    return {
      ...parseGatewaySession(status.data),
      qrDataUrl: fromQr.qrDataUrl,
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

  private async request(
    path: string,
    options: { method: 'GET' | 'POST'; body?: Record<string, string> },
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
