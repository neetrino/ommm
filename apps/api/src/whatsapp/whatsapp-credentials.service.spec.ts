import { ConfigService } from '@nestjs/config';
import { WhatsappCredentialsService } from './whatsapp-credentials.service';

describe('WhatsappCredentialsService', () => {
  function createService(params: {
    row?: {
      gatewayUrl: string | null;
      gatewayToken: string | null;
      accountId: string | null;
    } | null;
    envUrl?: string;
    envToken?: string;
  }) {
    const prisma = {
      whatsappIntegration: {
        findUnique: jest.fn().mockResolvedValue(params.row ?? null),
        upsert: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'WHATSAPP_GATEWAY_URL') {
          return params.envUrl;
        }
        if (key === 'WHATSAPP_GATEWAY_TOKEN') {
          return params.envToken;
        }
        return undefined;
      }),
    };
    return {
      service: new WhatsappCredentialsService(
        prisma as never,
        config as unknown as ConfigService,
      ),
      prisma,
    };
  }

  it('prefers database credentials over env', async () => {
    const { service } = createService({
      row: {
        gatewayUrl: 'https://gw.example.com/',
        gatewayToken: 'db-token-1234',
        accountId: 'acc_1',
      },
      envUrl: 'https://env.example.com',
      envToken: 'env-token',
    });

    await expect(service.resolve()).resolves.toEqual({
      baseUrl: 'https://gw.example.com',
      token: 'db-token-1234',
    });
    await expect(service.describe()).resolves.toMatchObject({
      source: 'database',
      hasToken: true,
      tokenPreview: '••••1234',
      accountId: 'acc_1',
    });
  });

  it('falls back to env when the database row is empty', async () => {
    const { service } = createService({
      envUrl: 'https://env.example.com',
      envToken: 'env-token-99',
    });

    await expect(service.resolve()).resolves.toEqual({
      baseUrl: 'https://env.example.com',
      token: 'env-token-99',
    });
    await expect(service.describe()).resolves.toMatchObject({
      source: 'env',
      tokenPreview: '••••n-99',
    });
  });

  it('clears the stored account when credentials change', async () => {
    const { service, prisma } = createService({
      row: {
        id: 'row_1',
        gatewayUrl: 'https://old.example.com',
        gatewayToken: 'old-token',
        accountId: 'acc_old',
      } as never,
    });

    await service.save({ gatewayUrl: 'https://new.example.com' });

    expect(prisma.whatsappIntegration.upsert).toHaveBeenCalledWith({
      where: { key: 'default' },
      create: {
        key: 'default',
        gatewayUrl: 'https://new.example.com',
        accountId: null,
      },
      update: {
        gatewayUrl: 'https://new.example.com',
        accountId: null,
      },
    });
  });

  it('does not send a database URL with an env token', async () => {
    const { service } = createService({
      row: {
        gatewayUrl: 'https://db.example.com',
        gatewayToken: null,
        accountId: null,
      },
      envUrl: 'https://env.example.com',
      envToken: 'env-token-99',
    });

    await expect(service.resolve()).resolves.toEqual({
      baseUrl: 'https://env.example.com',
      token: 'env-token-99',
    });
    await expect(service.describe()).resolves.toMatchObject({
      source: 'env',
      gatewayUrl: 'https://db.example.com',
      hasToken: false,
    });
  });
});
