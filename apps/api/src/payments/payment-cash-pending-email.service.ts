import { Injectable, Logger } from '@nestjs/common';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import { formatPhoneForDisplay } from '../common/phone';
import {
  buildMemberAccountUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  CASH_PENDING_EMAIL_SUBJECT,
  renderPaymentCashPendingCustomerEmail,
} from '../mail/templates/payment-cash-pending-customer.template';
import { PrismaService } from '../prisma/prisma.service';
import { renderCashPendingWhatsapp } from '../whatsapp/whatsapp-commerce-templates';
import {
  formatWhatsappAmount,
  resolveWhatsappLocale,
} from '../whatsapp/whatsapp-locale';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import {
  formatCustomerDisplayName,
  formatPaymentAmount,
  formatPaymentSourceLabel,
} from './payment-email-format.util';

@Injectable()
export class PaymentCashPendingEmailService {
  private readonly logger = new Logger(PaymentCashPendingEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly whatsapp: WhatsappNotifyService,
  ) {}

  /** Sends a cash-payment reminder when the customer chooses to pay in person. */
  async trySendCashPendingEmail(paymentId: string): Promise<void> {
    try {
      await this.sendCashPendingEmail(paymentId);
    } catch (error) {
      this.logger.error(
        `Cash pending email failed for ${paymentId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async sendCashPendingEmail(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            lastName: true,
            locale: true,
          },
        },
      },
    });

    if (!payment) {
      return;
    }
    if (payment.paymentMethod !== ManualPaymentMethod.CASH) {
      return;
    }
    if (payment.status !== PaymentStatus.PENDING) {
      return;
    }
    if (payment.cashPendingEmailSentAt !== null) {
      return;
    }

    const studio = await this.prisma.studioSettings.findFirst({
      select: {
        studioName: true,
        address: true,
        contactPhone: true,
        workingHours: true,
      },
    });

    const customerEmail = payment.user.email.trim();
    if (customerEmail.length === 0) {
      this.logger.warn(
        `Cash pending email skipped for ${paymentId}: customer email missing`,
      );
      return;
    }

    try {
      await this.mail.sendEmail({
        to: customerEmail,
        subject: CASH_PENDING_EMAIL_SUBJECT,
        html: renderPaymentCashPendingCustomerEmail({
          customerName: formatCustomerDisplayName(payment.user),
          amountLabel: formatPaymentAmount(
            payment.amountCents,
            payment.currency,
          ),
          paymentTypeLabel: formatPaymentSourceLabel(payment.source),
          paymentReference: payment.paymentReference?.trim() ?? '',
          bookingAccessNote: resolveCashBookingAccessNote(payment.source),
          studioName: studio?.studioName?.trim() || 'Ommm',
          studioAddress: studio?.address?.trim() ?? '',
          studioPhone: formatPhoneForDisplay(studio?.contactPhone),
          studioHours: studio?.workingHours?.trim() ?? '',
          accountUrl: buildMemberAccountUrl(
            resolveWebAppUrl(process.env.WEB_APP_URL),
            resolveEmailLocale(payment.user.locale),
          ),
        }),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send cash pending email for ${paymentId}`,
        error instanceof Error ? error.message : undefined,
      );
      return;
    }

    const whatsappLocale = resolveWhatsappLocale(payment.user.locale);
    await this.whatsapp.trySendToUser({
      userId: payment.userId,
      topic: 'operational',
      text: renderCashPendingWhatsapp(whatsappLocale, {
        amountLabel: formatWhatsappAmount(
          whatsappLocale,
          payment.amountCents,
          payment.currency,
        ),
      }),
    });

    await this.prisma.payment.updateMany({
      where: { id: paymentId, cashPendingEmailSentAt: null },
      data: { cashPendingEmailSentAt: new Date() },
    });
  }
}

function resolveCashBookingAccessNote(source: PaymentSource): string {
  if (source === PaymentSource.PACKAGE) {
    return 'Your package is already active — you can book classes now. Please complete your cash payment at the studio at your earliest convenience.';
  }
  if (source === PaymentSource.DROPIN) {
    return 'Your session booking is reserved. Please visit the studio to pay in cash before your class.';
  }
  if (source === PaymentSource.GIFT) {
    return 'Your gift card order is registered. Please visit the studio to pay in cash — your gift card will be issued after payment is received.';
  }
  return 'Your order is registered. Please visit the studio to complete your cash payment.';
}
