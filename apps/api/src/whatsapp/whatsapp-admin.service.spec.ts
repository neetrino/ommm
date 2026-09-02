import { BadRequestException } from '@nestjs/common';
import { WhatsappAdminService } from './whatsapp-admin.service';

describe('WhatsappAdminService', () => {
  function createService() {
    const gateway = {
      isConfigured: jest.fn().mockResolvedValue(true),
      probe: jest.fn().mockResolvedValue(true),
      sendText: jest.fn().mockResolvedValue(true),
    };
    return {
      service: new WhatsappAdminService(
        {} as never,
        {} as never,
        gateway as never,
      ),
      gateway,
    };
  }

  it('reports Gateway reachability', async () => {
    const { service, gateway } = createService();
    await expect(service.getGatewayStatus()).resolves.toEqual({
      reachable: true,
    });
    expect(gateway.probe).toHaveBeenCalled();
  });

  it('rejects a test message when WhatsApp is not paired', async () => {
    const gateway = {
      isConfigured: jest.fn().mockResolvedValue(true),
      getSession: jest.fn().mockResolvedValue({
        status: 'QR_REQUIRED',
        qrDataUrl: null,
        phoneNumber: null,
      }),
      sendText: jest.fn(),
    };
    const prisma = {
      whatsappIntegration: {
        findUnique: jest.fn().mockResolvedValue({ accountId: 'acc_1' }),
      },
    };
    const service = new WhatsappAdminService(
      prisma as never,
      {} as never,
      gateway as never,
    );
    await expect(
      service.sendTestMessage('+37441881822'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gateway.sendText).not.toHaveBeenCalled();
  });

  it('rejects sending a test to the paired studio number', async () => {
    const gateway = {
      isConfigured: jest.fn().mockResolvedValue(true),
      getSession: jest.fn().mockResolvedValue({
        status: 'CONNECTED',
        qrDataUrl: null,
        phoneNumber: '•••••••3000',
      }),
      sendText: jest.fn(),
    };
    const prisma = {
      whatsappIntegration: {
        findUnique: jest.fn().mockResolvedValue({ accountId: 'acc_1' }),
      },
    };
    const service = new WhatsappAdminService(
      prisma as never,
      {} as never,
      gateway as never,
    );
    await expect(
      service.sendTestMessage('+37444343000'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(gateway.sendText).not.toHaveBeenCalled();
  });

  it('rejects an invalid test-message phone', async () => {
    const { service, gateway } = createService();
    await expect(service.sendTestMessage('123')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(gateway.sendText).not.toHaveBeenCalled();
  });

  it('reads the shared session without requesting a QR by default', async () => {
    const gateway = {
      isConfigured: jest.fn().mockResolvedValue(true),
      getSession: jest
        .fn()
        .mockResolvedValue({ status: 'CONNECTED', qrDataUrl: null }),
    };
    const prisma = {
      whatsappIntegration: {
        findUnique: jest.fn().mockResolvedValue({ accountId: 'acc_1' }),
      },
    };
    const service = new WhatsappAdminService(
      prisma as never,
      {} as never,
      gateway as never,
    );

    await expect(service.getConnectState()).resolves.toEqual({
      accountId: 'acc_1',
      status: 'CONNECTED',
      qrDataUrl: null,
    });
    expect(gateway.getSession).toHaveBeenCalledWith('acc_1', undefined);

    await service.getConnectState({ includeQr: true });
    expect(gateway.getSession).toHaveBeenCalledWith('acc_1', {
      includeQr: true,
    });
  });
});
