import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType } from '@prisma/client';
import { buildCreatePasswordUrl } from '../auth/build-create-password-url';
import { normalizeAppUiLocale } from '../common/app-ui-locales';
import { CLIENT_INVITE_PASSWORD_SETUP_TTL_MS } from '../common/constants';
import { hashOpaqueToken, newOpaqueToken } from '../common/opaque-token';
import { MailService } from '../mail/mail.service';
import {
  MANAGER_INVITE_EMAIL_SUBJECT,
  renderManagerInviteEmail,
} from '../mail/templates/manager-invite.template';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_UI_LOCALE = 'en';
const AUTH_TOKEN_PASSWORD_SETUP = 'PASSWORD_SETUP' as AuthTokenType;

export type ManagerInviteResult = {
  email: string;
  passwordSetupUrl: string;
  welcomeEmailSent: boolean;
};

type ManagerInviteRecipient = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  locale: string;
};

@Injectable()
export class ManagersInviteService {
  private readonly logger = new Logger(ManagersInviteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async issueAndSend(
    recipient: ManagerInviteRecipient,
  ): Promise<ManagerInviteResult> {
    const inviteRawToken = newOpaqueToken();
    const inviteTokenHash = hashOpaqueToken(inviteRawToken);
    const inviteExpiresAt = new Date(
      Date.now() + CLIENT_INVITE_PASSWORD_SETUP_TTL_MS,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.authToken.deleteMany({
        where: { userId: recipient.id, type: AUTH_TOKEN_PASSWORD_SETUP },
      });
      await tx.authToken.create({
        data: {
          userId: recipient.id,
          tokenHash: inviteTokenHash,
          type: AUTH_TOKEN_PASSWORD_SETUP,
          expiresAt: inviteExpiresAt,
        },
      });
    });

    const webUrl =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const locale = normalizeAppUiLocale(recipient.locale, DEFAULT_UI_LOCALE);
    const passwordSetupUrl = buildCreatePasswordUrl({
      webAppUrl: webUrl,
      locale,
      token: inviteRawToken,
    });
    const greet = [recipient.name, recipient.lastName]
      .filter(Boolean)
      .join(' ');

    let welcomeEmailSent = false;
    try {
      await this.mail.sendEmail({
        to: recipient.email,
        subject: MANAGER_INVITE_EMAIL_SUBJECT,
        html: renderManagerInviteEmail({
          recipientName: greet,
          passwordSetupUrl,
        }),
      });
      welcomeEmailSent = true;
    } catch (error) {
      this.logger.warn(
        `Manager invite email failed for ${recipient.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    return {
      email: recipient.email,
      passwordSetupUrl,
      welcomeEmailSent,
    };
  }
}
