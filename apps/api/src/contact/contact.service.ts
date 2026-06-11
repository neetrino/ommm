import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { getEmailLogoAttachment } from '../mail/email-logo';
import { renderContactAdminNotificationEmail } from '../mail/templates/contact-admin-notification.template';
import { renderContactCustomerConfirmationEmail } from '../mail/templates/contact-customer-confirmation.template';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateContactMessageDto } from './dto/create-contact-message.dto';

const CONTACT_SEND_ERROR =
  'We could not send your message right now. Please try again in a few minutes.';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async submit(dto: CreateContactMessageDto) {
    const receiverEmail = await this.resolveReceiverEmail();

    if (!receiverEmail) {
      this.logger.error(
        'Contact receiver email is not configured (CONTACT_RECEIVER_EMAIL or studio contactEmail).',
      );
      throw new ServiceUnavailableException(CONTACT_SEND_ERROR);
    }

    const subject = dto.subject?.trim() ?? '';
    const message = dto.message.trim();

    const msg = await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone.trim(),
        subject: subject.length > 0 ? subject : null,
        message,
      },
    });

    const submittedAt = msg.createdAt;

    const logoAttachment = getEmailLogoAttachment();

    try {
      await this.mail.sendEmail({
        to: receiverEmail,
        replyTo: dto.email.trim(),
        subject:
          subject.length > 0
            ? `Contact: ${subject}`
            : `Contact from ${dto.name.trim()}`,
        html: renderContactAdminNotificationEmail({
          submittedAt,
          name: dto.name.trim(),
          email: dto.email.trim(),
          phone: dto.phone.trim(),
          subject,
          message,
        }),
        attachments: [logoAttachment],
      });
    } catch (error) {
      this.logger.error(
        `Failed to send admin contact notification for message ${msg.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(CONTACT_SEND_ERROR);
    }

    try {
      await this.mail.sendEmail({
        to: dto.email.trim(),
        subject: 'We received your message — Ommm',
        html: renderContactCustomerConfirmationEmail({
          customerName: dto.name.trim(),
          subject,
          message,
        }),
        attachments: [logoAttachment],
      });
    } catch (error) {
      this.logger.warn(
        `Admin notification sent for message ${msg.id}, but customer confirmation failed`,
        error instanceof Error ? error.message : undefined,
      );
    }

    return { id: msg.id, ok: true };
  }

  /** Env override first; otherwise studio settings email shown on the contact page. */
  private async resolveReceiverEmail(): Promise<string | null> {
    const fromEnv = this.config.get<string>('CONTACT_RECEIVER_EMAIL')?.trim();
    if (fromEnv) {
      return fromEnv;
    }

    const studio = await this.prisma.studioSettings.findFirst({
      select: { contactEmail: true },
    });
    const fromStudio = studio?.contactEmail?.trim();
    return fromStudio && fromStudio.length > 0 ? fromStudio : null;
  }
}
