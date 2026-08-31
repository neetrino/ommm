import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { WhatsappCredentialsService } from './whatsapp-credentials.service';
import { WhatsappGatewayClient } from './whatsapp-gateway.client';
import { WHATSAPP_INTEGRATION_SINGLETON_KEY } from './whatsapp.constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentials: WhatsappCredentialsService,
    private readonly gateway: WhatsappGatewayClient,
  ) {}

  getSettings() {
    return this.credentials.describe();
  }

  async updateSettings(dto: { gatewayUrl?: string; gatewayToken?: string }) {
    await this.credentials.save({
      gatewayUrl: dto.gatewayUrl,
      gatewayToken: dto.gatewayToken,
    });
    return this.credentials.describe();
  }

  async getConnectState() {
    await this.assertConfigured();
    const accountId = await this.resolveAccountId();
    const session = await this.gateway.getSession(accountId);
    return {
      accountId,
      status: session.status,
      qrDataUrl: session.qrDataUrl,
    };
  }

  async logout() {
    await this.assertConfigured();
    const accountId = await this.resolveAccountId();
    const ok = await this.gateway.logout(accountId);
    if (!ok) {
      throw new ServiceUnavailableException(
        'Failed to logout WhatsApp session',
      );
    }
    return this.getConnectState();
  }

  async restart() {
    await this.assertConfigured();
    const accountId = await this.resolveAccountId();
    const ok = await this.gateway.restart(accountId);
    if (!ok) {
      throw new ServiceUnavailableException(
        'Failed to restart WhatsApp session',
      );
    }
    return this.getConnectState();
  }

  private async assertConfigured(): Promise<void> {
    if (!(await this.gateway.isConfigured())) {
      throw new BadRequestException(
        'WhatsApp Gateway URL and token are not configured',
      );
    }
  }

  private async resolveAccountId(): Promise<string> {
    const row = await this.prisma.whatsappIntegration.findUnique({
      where: { key: WHATSAPP_INTEGRATION_SINGLETON_KEY },
      select: { accountId: true },
    });
    const stored = row?.accountId?.trim() ?? '';
    if (stored.length > 0) {
      return stored;
    }
    const accounts = await this.gateway.listAccounts();
    const first = accounts[0];
    if (!first) {
      throw new BadRequestException(
        'No WhatsApp account found in the Gateway project',
      );
    }
    await this.credentials.save({ accountId: first.id });
    return first.id;
  }
}
