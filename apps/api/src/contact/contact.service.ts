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
    const receiverEmail = this.config
      .get<string>('CONTACT_RECEIVER_EMAIL')
      ?.trim();

    if (!receiverEmail) {
      this.logger.error(
        'CONTACT_RECEIVER_EMAIL is not configured; contact form email cannot be delivered.',
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
}
