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

  it('rejects an invalid test-message phone', async () => {
    const { service, gateway } = createService();
    await expect(service.sendTestMessage('123')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(gateway.sendText).not.toHaveBeenCalled();
  });
});
