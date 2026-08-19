import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus, WaitlistStatus } from '@prisma/client';
import {
  buildPublicScheduleUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  buildClassCancelledSubject,
  renderClassCancelledEmail,
} from '../mail/templates/class-cancelled.template';
import { formatPaymentDateTime } from '../payments/payment-email-format.util';
import { PrismaService } from '../prisma/prisma.service';

type CancelledClassRecipient = {
  userId: string;
  email: string;
  locale: string;
};

type CancelledSessionRow = {
  startsAt: Date;
  classType: { name: string };
};

@Injectable()
export class ClassCancelledEmailService {
  private readonly logger = new Logger(ClassCancelledEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * Emails booked members and open waitlist before cascade releases them.
   * Failures are logged and never block session cancel.
   */
  async notifySessionCancelled(sessionId: string): Promise<void> {
    try {
      await this.sendCancelledEmails(sessionId);
    } catch (error) {
      this.logger.error(
        `Class cancelled email failed for ${sessionId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async sendCancelledEmails(sessionId: string): Promise<void> {
    const session = await this.loadSession(sessionId);
    if (!session) {
      return;
    }
    const recipients = await this.loadRecipients(sessionId);
    if (recipients.length === 0) {
      return;
    }

    const className = session.classType.name;
    const startsAtLabel = formatPaymentDateTime(session.startsAt);
    const subject = buildClassCancelledSubject(className);
    const webAppUrl = resolveWebAppUrl(process.env.WEB_APP_URL);

    for (const recipient of recipients) {
      await this.sendOne(recipient, {
        className,
        startsAtLabel,
        subject,
        webAppUrl,
      });
    }
  }

  private async loadSession(
    sessionId: string,
  ): Promise<CancelledSessionRow | null> {
    return this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: {
        startsAt: true,
        classType: { select: { name: true } },
      },
    });
  }

  private async loadRecipients(
    sessionId: string,
  ): Promise<CancelledClassRecipient[]> {
    const [bookings, waitlist] = await Promise.all([
      this.prisma.booking.findMany({
        where: { sessionId, status: BookingStatus.BOOKED },
        select: {
          user: { select: { id: true, email: true, locale: true } },
        },
      }),
      this.prisma.waitlistEntry.findMany({
        where: {
          sessionId,
          status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
        },
        select: {
          user: { select: { id: true, email: true, locale: true } },
        },
      }),
    ]);

    return uniqueRecipients([
      ...bookings.map((row) => toRecipient(row.user)),
      ...waitlist.map((row) => toRecipient(row.user)),
    ]);
  }

  private async sendOne(
    recipient: CancelledClassRecipient,
    context: {
      className: string;
      startsAtLabel: string;
      subject: string;
      webAppUrl: string;
    },
  ): Promise<void> {
    try {
      await this.mail.sendEmail({
        to: recipient.email,
        subject: context.subject,
        html: renderClassCancelledEmail({
          className: context.className,
          startsAtLabel: context.startsAtLabel,
          scheduleUrl: buildPublicScheduleUrl(
            context.webAppUrl,
            resolveEmailLocale(recipient.locale),
          ),
        }),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send class cancelled email to ${recipient.email}`,
        error instanceof Error ? error.message : undefined,
      );
    }
  }
}

function toRecipient(user: {
  id: string;
  email: string;
  locale: string;
}): CancelledClassRecipient {
  return { userId: user.id, email: user.email, locale: user.locale };
}

function uniqueRecipients(
  rows: readonly CancelledClassRecipient[],
): CancelledClassRecipient[] {
  const seen = new Set<string>();
  const unique: CancelledClassRecipient[] = [];
  for (const row of rows) {
    if (row.email.trim().length === 0 || seen.has(row.userId)) {
      continue;
    }
    seen.add(row.userId);
    unique.push(row);
  }
  return unique;
}
