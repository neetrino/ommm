import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentSource, PaymentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { formatPhoneForDisplay } from '../common/phone';
import {
  buildMemberAccountUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import {
  PAYMENT_ADMIN_EMAIL_SUBJECT,
  renderPaymentAdminNotificationEmail,
} from '../mail/templates/payment-admin-notification.template';
import {
  PAYMENT_CUSTOMER_EMAIL_SUBJECT,
  renderPaymentCustomerConfirmationEmail,
} from '../mail/templates/payment-customer-confirmation.template';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatCustomerDisplayName,
  formatPaymentAmount,
  formatPaymentDateTime,
  formatPaymentSourceLabel,
  formatPaymentStatusLabel,
} from './payment-email-format.util';

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
            locale: true,
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

    const context = this.buildEmailContext(payment);
    const customerSent = await this.sendCustomerEmail(context);
    const adminSent = await this.sendAdminEmail(context);

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
  ): Promise<boolean> {
    try {
      await this.mail.sendEmail({
        to: context.customerEmail,
        subject: PAYMENT_CUSTOMER_EMAIL_SUBJECT,
        html: renderPaymentCustomerConfirmationEmail({
          customerName: context.customerName,
          amountLabel: context.amountLabel,
          paymentTypeLabel: context.paymentTypeLabel,
          confirmedAtLabel: context.confirmedAtLabel,
          accountUrl: context.accountUrl,
        }),
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

  private async sendAdminEmail(context: PaymentEmailContext): Promise<boolean> {
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
        subject: PAYMENT_ADMIN_EMAIL_SUBJECT,
        html: renderPaymentAdminNotificationEmail({
          customerName: context.customerName,
          customerEmail: context.customerEmail,
          customerPhone: context.customerPhone,
          amountLabel: context.amountLabel,
          paymentTypeLabel: context.paymentTypeLabel,
          statusLabel: context.statusLabel,
          confirmedAtLabel: context.confirmedAtLabel,
        }),
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

  private buildEmailContext(
    payment: PaymentWithRelations,
  ): PaymentEmailContext {
    const confirmedAt = payment.confirmedAt ?? payment.updatedAt;

    const webUrl = resolveWebAppUrl(this.config.get<string>('WEB_APP_URL'));
    const locale = resolveEmailLocale(payment.user.locale);

    return {
      paymentId: payment.id,
      customerName: formatCustomerDisplayName(payment.user),
      customerEmail: payment.user.email,
      customerPhone: formatPhoneForDisplay(payment.user.phone),
      amountLabel: formatPaymentAmount(payment.amountCents, payment.currency),
      paymentTypeLabel: formatPaymentSourceLabel(payment.source),
      statusLabel: formatPaymentStatusLabel(payment.status),
      confirmedAtLabel: formatPaymentDateTime(confirmedAt),
      accountUrl: buildMemberAccountUrl(webUrl, locale),
    };
  }
}

type PaymentEmailContext = {
  paymentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountLabel: string;
  paymentTypeLabel: string;
  statusLabel: string;
  confirmedAtLabel: string;
  accountUrl: string;
};

type PaymentWithRelations = {
  id: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  source: PaymentSource;
  confirmedAt: Date | null;
  updatedAt: Date;
  successEmailSentAt: Date | null;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    locale: string;
  };
};
