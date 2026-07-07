import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSource, PaymentStatus, Prisma } from '@prisma/client';
import { getEmailLogoAttachment } from '../mail/email-logo';
import { MailService } from '../mail/mail.service';
import { formatPhoneForDisplay } from '../common/phone';
import { renderPaymentAdminNotificationEmail } from '../mail/templates/payment-admin-notification.template';
import { renderPaymentCustomerConfirmationEmail } from '../mail/templates/payment-customer-confirmation.template';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatCustomerDisplayName,
  formatPaymentAmount,
  formatPaymentDateTime,
  formatPaymentSourceLabel,
  formatPaymentStatusLabel,
} from './payment-email-format.util';

type PaymentMetadata = {
  recipientName?: string;
  recipientEmail?: string;
};

@Injectable()
export class PaymentSuccessEmailService {
  private readonly logger = new Logger(PaymentSuccessEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  /** Sends branded success emails when a payment newly reaches SUCCEEDED. */
  async trySendSuccessEmails(
    paymentId: string,
    previousStatus: PaymentStatus,
  ): Promise<void> {
    if (previousStatus === PaymentStatus.SUCCEEDED) {
      return;
    }

    try {
      await this.sendSuccessEmails(paymentId);
    } catch (error) {
      this.logger.error(
        `Payment success email failed for ${paymentId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async sendSuccessEmails(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
      return;
    }
    if (payment.successEmailSentAt !== null) {
      return;
    }

    const context = await this.buildEmailContext(payment);
    const logoAttachment = getEmailLogoAttachment();
    const customerSent = await this.sendCustomerEmail(context, logoAttachment);
    const adminSent = await this.sendAdminEmail(context, logoAttachment);

    if (!customerSent) {
      return;
    }
    if (!adminSent) {
      this.logger.warn(
        `Customer payment confirmation sent for ${paymentId}, but admin notification was skipped or failed`,
      );
    }

    await this.prisma.payment.updateMany({
      where: { id: paymentId, successEmailSentAt: null },
      data: { successEmailSentAt: new Date() },
    });
  }

  private async sendCustomerEmail(
    context: PaymentEmailContext,
    logoAttachment: ReturnType<typeof getEmailLogoAttachment>,
  ): Promise<boolean> {
    try {
      await this.mail.sendEmail({
        to: context.customerEmail,
        subject: 'Your payment has been confirmed — Ommm',
        html: renderPaymentCustomerConfirmationEmail({
          customerName: context.customerName,
          amountLabel: context.amountLabel,
          currency: context.currency,
          paymentTypeLabel: context.paymentTypeLabel,
          confirmedAtLabel: context.confirmedAtLabel,
          paymentReference: context.paymentReference,
        }),
        attachments: [logoAttachment],
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send customer payment confirmation for ${context.paymentId}`,
        error instanceof Error ? error.message : undefined,
      );
      return false;
    }
  }

  private async sendAdminEmail(
    context: PaymentEmailContext,
    logoAttachment: ReturnType<typeof getEmailLogoAttachment>,
  ): Promise<boolean> {
    const adminEmail = this.config
      .get<string>('CONTACT_RECEIVER_EMAIL')
      ?.trim();
    if (!adminEmail) {
      this.logger.warn(
        'CONTACT_RECEIVER_EMAIL is not configured; admin payment notification skipped.',
      );
      return false;
    }

    try {
      await this.mail.sendEmail({
        to: adminEmail,
        replyTo: context.customerEmail,
        subject: 'Payment successfully confirmed — Ommm',
        html: renderPaymentAdminNotificationEmail({
          customerName: context.customerName,
          customerEmail: context.customerEmail,
          customerPhone: context.customerPhone,
          amountLabel: context.amountLabel,
          currency: context.currency,
          paymentTypeLabel: context.paymentTypeLabel,
          statusLabel: context.statusLabel,
          confirmedAtLabel: context.confirmedAtLabel,
        }),
        attachments: [logoAttachment],
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send admin payment notification for ${context.paymentId}`,
        error instanceof Error ? error.message : undefined,
      );
      return false;
    }
  }

  private async buildEmailContext(
    payment: PaymentWithRelations,
  ): Promise<PaymentEmailContext> {
    const confirmedAt = payment.confirmedAt ?? payment.updatedAt;
    const metadata = this.parsePaymentMetadata(payment.metadata);
    const relatedDetails = await this.resolveRelatedDetails(payment, metadata);

    return {
      paymentId: payment.id,
      customerName: formatCustomerDisplayName(payment.user),
      customerEmail: payment.user.email,
      customerPhone: formatPhoneForDisplay(payment.user.phone),
      amountLabel: formatPaymentAmount(payment.amountCents, payment.currency),
      currency: payment.currency,
      paymentTypeLabel: formatPaymentSourceLabel(payment.source),
      statusLabel: formatPaymentStatusLabel(payment.status),
      confirmedAtLabel: formatPaymentDateTime(confirmedAt),
      paymentReference: payment.paymentReference?.trim() ?? '',
      relatedDetails,
    };
  }

  private async resolveRelatedDetails(
    payment: PaymentWithRelations,
    metadata: PaymentMetadata,
  ): Promise<string> {
    if (payment.source === PaymentSource.PACKAGE) {
      return payment.description?.trim() ?? 'Package payment';
    }

    if (payment.source === PaymentSource.DROPIN && payment.sourceId) {
      const session = await this.prisma.classSession.findUnique({
        where: { id: payment.sourceId },
        select: {
          title: true,
          startsAt: true,
          classType: { select: { name: true } },
        },
      });
      if (!session) {
        return payment.description?.trim() ?? '';
      }
      const sessionTitle =
        session.title.trim().length > 0
          ? session.title
          : session.classType.name;
      return `${sessionTitle} — ${formatPaymentDateTime(session.startsAt)}`;
    }

    if (payment.source === PaymentSource.GIFT) {
      const recipient = metadata.recipientName ?? metadata.recipientEmail;
      if (recipient) {
        return `Gift card for ${recipient}`;
      }
      if (payment.sourceId) {
        const batch = await this.prisma.giftCardBatch.findUnique({
          where: { id: payment.sourceId },
          select: { amountAmd: true },
        });
        if (batch) {
          return `Gift card batch — ${formatPaymentAmount(batch.amountAmd, payment.currency)}`;
        }
      }
      return payment.description?.trim() ?? 'Gift card purchase';
    }

    return payment.description?.trim() ?? '';
  }

  private parsePaymentMetadata(
    value: Prisma.JsonValue | null,
  ): PaymentMetadata {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {};
    }
    return {
      recipientName: this.readMetadataString(value, 'recipientName'),
      recipientEmail: this.readMetadataString(value, 'recipientEmail'),
    };
  }

  private readMetadataString(
    value: object,
    key: keyof PaymentMetadata,
  ): string | undefined {
    const candidate = (value as Record<string, unknown>)[key];
    return typeof candidate === 'string' && candidate.trim().length > 0
      ? candidate.trim()
      : undefined;
  }
}

type PaymentEmailContext = {
  paymentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountLabel: string;
  currency: string;
  paymentTypeLabel: string;
  statusLabel: string;
  confirmedAtLabel: string;
  paymentReference: string;
  relatedDetails: string;
};

type PaymentWithRelations = {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  source: PaymentSource;
  sourceId: string | null;
  description: string | null;
  metadata: Prisma.JsonValue | null;
  paymentReference: string | null;
  confirmedAt: Date | null;
  updatedAt: Date;
  successEmailSentAt: Date | null;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
  };
};
