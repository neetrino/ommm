import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  WHATSAPP_GATEWAY_TOKEN_ENV,
  WHATSAPP_GATEWAY_URL_ENV,
  WHATSAPP_INTEGRATION_SINGLETON_KEY,
  WHATSAPP_TOKEN_PREVIEW_LENGTH,
} from './whatsapp.constants';

export type WhatsappCredentials = {
  baseUrl: string;
  token: string;
};

export type WhatsappCredentialsSource = 'database' | 'env' | 'none';

@Injectable()
export class WhatsappCredentialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async resolve(): Promise<WhatsappCredentials | null> {
    const row = await this.loadRow();
    return (
      completeCredentials(row?.gatewayUrl, row?.gatewayToken) ??
      completeCredentials(this.readEnvUrl(), this.readEnvToken())
    );
  }

  async describe(): Promise<{
    gatewayUrl: string;
    hasToken: boolean;
    tokenPreview: string | null;
    accountId: string | null;
    source: WhatsappCredentialsSource;
  }> {
    const row = await this.loadRow();
    const storedUrl = normalizeGatewayUrl(row?.gatewayUrl);
    const dbPair = completeCredentials(row?.gatewayUrl, row?.gatewayToken);
    const envPair = completeCredentials(this.readEnvUrl(), this.readEnvToken());
    return {
      gatewayUrl: storedUrl ?? envPair?.baseUrl ?? '',
      hasToken: storedUrl !== null ? dbPair !== null : envPair !== null,
      tokenPreview: maskToken(
        dbPair?.token ?? (storedUrl === null ? (envPair?.token ?? null) : null),
      ),
      accountId: row?.accountId?.trim() || null,
      source: dbPair !== null ? 'database' : envPair !== null ? 'env' : 'none',
    };
  }

  async save(params: {
    gatewayUrl?: string;
    gatewayToken?: string;
    accountId?: string | null;
  }): Promise<void> {
    const current = await this.loadRow();
    const data = buildSaveData(current, params);
    if (Object.keys(data).length === 0) {
      return;
    }
    if (typeof data.gatewayUrl === 'string') {
      assertHttpsGatewayUrl(data.gatewayUrl);
    }
    await this.prisma.whatsappIntegration.upsert({
      where: { key: WHATSAPP_INTEGRATION_SINGLETON_KEY },
      create: { key: WHATSAPP_INTEGRATION_SINGLETON_KEY, ...data },
      update: data,
    });
  }

  private loadRow() {
    return this.prisma.whatsappIntegration.findUnique({
      where: { key: WHATSAPP_INTEGRATION_SINGLETON_KEY },
    });
  }

  private readEnvUrl(): string | null {
    return normalizeGatewayUrl(
      this.config.get<string>(WHATSAPP_GATEWAY_URL_ENV),
    );
  }

  private readEnvToken(): string | null {
    return normalizeSecret(this.config.get<string>(WHATSAPP_GATEWAY_TOKEN_ENV));
  }
}

function normalizeGatewayUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return null;
  }
  return stripTrailingSlashes(trimmed);
}

function stripTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }
  return value.slice(0, end);
}

function normalizeSecret(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function maskToken(token: string | null): string | null {
  if (token === null) {
    return null;
  }
  if (token.length <= WHATSAPP_TOKEN_PREVIEW_LENGTH) {
    return '••••';
  }
  return `••••${token.slice(-WHATSAPP_TOKEN_PREVIEW_LENGTH)}`;
}

function buildSaveData(
  current: { gatewayUrl: string | null; gatewayToken: string | null } | null,
  params: {
    gatewayUrl?: string;
    gatewayToken?: string;
    accountId?: string | null;
  },
): {
  gatewayUrl?: string | null;
  gatewayToken?: string;
  accountId?: string | null;
} {
  const nextUrl =
    params.gatewayUrl !== undefined
      ? normalizeGatewayUrl(params.gatewayUrl)
      : undefined;
  const nextToken =
    params.gatewayToken !== undefined && params.gatewayToken.trim().length > 0
      ? params.gatewayToken.trim()
      : undefined;
  const credentialsChanged =
    (nextUrl !== undefined &&
      nextUrl !== normalizeGatewayUrl(current?.gatewayUrl)) ||
    (nextToken !== undefined &&
      nextToken !== normalizeSecret(current?.gatewayToken));
  return {
    ...(nextUrl !== undefined && { gatewayUrl: nextUrl }),
    ...(nextToken !== undefined && { gatewayToken: nextToken }),
    ...(params.accountId !== undefined && {
      accountId: params.accountId?.trim() || null,
    }),
    ...(credentialsChanged &&
      params.accountId === undefined && { accountId: null }),
  };
}

function assertHttpsGatewayUrl(url: string): void {
  if (!url.toLowerCase().startsWith('https://')) {
    throw new BadRequestException('Gateway URL must use HTTPS');
  }
}

function completeCredentials(
  url: string | null | undefined,
  token: string | null | undefined,
): WhatsappCredentials | null {
  const baseUrl = normalizeGatewayUrl(url);
  const secret = normalizeSecret(token);
  if (baseUrl === null || secret === null) {
    return null;
  }
  return { baseUrl, token: secret };
}
