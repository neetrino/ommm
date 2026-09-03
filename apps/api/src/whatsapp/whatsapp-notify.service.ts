import { Injectable, Logger } from '@nestjs/common';
import type { AppUiLocale } from '../common/app-ui-locales';
import { toWhatsappChatId } from './whatsapp-chat-id';
import { renderGiftCardWhatsapp } from './whatsapp-commerce-templates';
import {
  WHATSAPP_BILINGUAL_SEPARATOR,
  WHATSAPP_CUSTOMER_LOCALES,
} from './whatsapp.constants';
import { WhatsappGatewayClient } from './whatsapp-gateway.client';
import {
  allowsWhatsappTopic,
  resolveWhatsappPrefs,
  type WhatsappSendResult,
  type WhatsappTopic,
} from './whatsapp-topic';
import { PrismaService } from '../prisma/prisma.service';

export type WhatsappMessageRenderer = (locale: AppUiLocale) => string;

export function renderBilingualWhatsappMessage(
  render: WhatsappMessageRenderer,
): string {
  return WHATSAPP_CUSTOMER_LOCALES.map((locale) => render(locale)).join(
    WHATSAPP_BILINGUAL_SEPARATOR,
  );
}

@Injectable()
export class WhatsappNotifyService {
  private readonly logger = new Logger(WhatsappNotifyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: WhatsappGatewayClient,
  ) {}

  async isConfigured(): Promise<boolean> {
    return this.gateway.isConfigured();
  }

  async trySendToUser(params: {
    userId: string;
    topic: WhatsappTopic;
    render: WhatsappMessageRenderer;
  }): Promise<WhatsappSendResult> {
    try {
      if (!(await this.gateway.isConfigured())) {
        return 'skipped';
      }
      return await this.sendToLoadedUser(params);
    } catch (error) {
      this.logger.error(
        `WhatsApp notify failed for user ${params.userId}`,
        error instanceof Error ? error.stack : undefined,
      );
      return 'failed';
    }
  }

  async trySendGiftCard(
    email: string,
    code: string,
  ): Promise<WhatsappSendResult> {
    try {
      const normalized = email.trim().toLowerCase();
      if (normalized.length === 0) {
        return 'skipped';
      }
      const user = await this.prisma.user.findUnique({
        where: { email: normalized },
        select: { id: true },
      });
      if (!user) {
        return 'skipped';
      }
      return await this.trySendToUser({
        userId: user.id,
        topic: 'operational',
        render: (locale) => renderGiftCardWhatsapp(locale, { code }),
      });
    } catch (error) {
      this.logger.error(
        'WhatsApp gift card notify failed',
        error instanceof Error ? error.stack : undefined,
      );
      return 'failed';
    }
  }

  private async sendToLoadedUser(params: {
    userId: string;
    topic: WhatsappTopic;
    render: WhatsappMessageRenderer;
  }): Promise<WhatsappSendResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        phone: true,
        notificationPrefs: {
          select: {
            whatsappEnabled: true,
            bookingReminders: true,
            waitlistAlerts: true,
            promotions: true,
          },
        },
      },
    });
    if (!user) {
      return 'skipped';
    }
    const prefs = resolveWhatsappPrefs(user.notificationPrefs);
    if (!allowsWhatsappTopic(prefs, params.topic)) {
      return 'skipped';
    }
    const chatId = toWhatsappChatId(user.phone);
    if (chatId === null) {
      return 'skipped';
    }
    const text = renderBilingualWhatsappMessage(params.render);
    const sent = await this.gateway.sendText(chatId, text);
    return sent ? 'sent' : 'failed';
  }
}
