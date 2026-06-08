import { Injectable, Logger } from '@nestjs/common';
import { ArcaConfig } from './arca.config';
import type {
  ArcaOrderStatusResponse,
  ArcaRegisterResponse,
} from './arca.types';

@Injectable()
export class ArcaClient {
  private readonly logger = new Logger(ArcaClient.name);

  constructor(private readonly arcaConfig: ArcaConfig) {}

  async registerOrder(params: {
    orderNumber: string;
    amount: number;
    returnUrl: string;
    description?: string;
    language?: string;
  }): Promise<ArcaRegisterResponse> {
    const { userName, password } = this.arcaConfig.getCredentials();
    const jsonParams: Record<string, string> = {};
    if (this.arcaConfig.isForce3ds2()) {
      jsonParams.FORCE_3DS2 = 'true';
    }

    return this.post<ArcaRegisterResponse>('register.do', {
      userName,
      password,
      orderNumber: params.orderNumber,
      amount: String(params.amount),
      currency: this.arcaConfig.getCurrencyCode(),
      returnUrl: params.returnUrl,
      ...(params.description ? { description: params.description } : {}),
      language: params.language ?? this.arcaConfig.getDefaultLanguage(),
      ...(Object.keys(jsonParams).length > 0
        ? { jsonParams: JSON.stringify(jsonParams) }
        : {}),
    });
  }

  async getOrderStatusExtended(
    orderId: string,
  ): Promise<ArcaOrderStatusResponse> {
    const { userName, password } = this.arcaConfig.getCredentials();
    return this.post<ArcaOrderStatusResponse>('getOrderStatusExtended.do', {
      userName,
      password,
      orderId,
    });
  }

  private async post<T>(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<T> {
    const baseUrl = this.arcaConfig.getBaseUrl();
    const url = `${baseUrl}/${endpoint}`;
    const body = new URLSearchParams(params);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });
    } catch (error) {
      this.logger.error(
        `Arca request failed: ${endpoint}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

    const text = await response.text();
    if (!response.ok) {
      this.logger.error(
        `Arca HTTP ${response.status} for ${endpoint}: ${text}`,
      );
      throw new Error(`Arca HTTP error ${response.status}`);
    }

    let parsed: T;
    try {
      parsed = JSON.parse(text) as T;
    } catch {
      this.logger.error(`Arca invalid JSON for ${endpoint}: ${text}`);
      throw new Error('Arca returned invalid JSON');
    }

    return parsed;
  }
}
