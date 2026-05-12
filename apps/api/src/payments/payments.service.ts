import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  MembershipStatus,
  PaymentStatus,
} from '@prisma/client';
import Stripe from 'stripe';
import { randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

type StripeClient = InstanceType<typeof Stripe>;

/** Narrow shape used after `checkout.session.completed` (avoids brittle SDK namespace types). */
type StripeCheckoutSessionLike = {
  id: string;
  metadata?: Record<string, string> | null;
  subscription?: string | { id: string } | null;
  payment_intent?: string | { id: string } | null;
  amount_total?: number | null;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly stripe: StripeClient | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY');
    this.stripe = key ? new Stripe(key) : null;
  }

  private ensureStripe(): StripeClient {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Stripe is not configured');
    }
    return this.stripe;
  }

  async getOrCreateStripeCustomer(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }
    const stripe = this.ensureStripe();
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }

  async createMembershipCheckout(
    userId: string,
    planId: string,
  ): Promise<{ url: string | null }> {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });
    if (!plan?.isActive) {
      throw new BadRequestException('Plan not available');
    }
    const stripe = this.ensureStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);
    const web =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const currency = (
      this.config.get<string>('STRIPE_CURRENCY') ?? 'usd'
    ).toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      success_url: `${web}/hy/account/memberships?success=1`,
      cancel_url: `${web}/hy/memberships?canceled=1`,
      metadata: { type: 'membership', userId, planId },
      line_items: plan.stripePriceId
        ? [{ price: plan.stripePriceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency,
                unit_amount: plan.priceCents,
                recurring: { interval: 'month' },
                product_data: { name: plan.name },
              },
              quantity: 1,
            },
          ],
    });
    return { url: session.url };
  }

  async createGiftCheckout(params: {
    purchaserId: string;
    amountCents: number;
    recipientName?: string;
    recipientEmail?: string;
    message?: string;
  }): Promise<{ url: string | null }> {
    const stripe = this.ensureStripe();
    const customerId = await this.getOrCreateStripeCustomer(params.purchaserId);
    const web =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const currency = (
      this.config.get<string>('STRIPE_CURRENCY') ?? 'usd'
    ).toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      success_url: `${web}/hy/account/gift-cards?success=1`,
      cancel_url: `${web}/hy/memberships?gift_canceled=1`,
      metadata: {
        type: 'gift',
        purchaserId: params.purchaserId,
        amountCents: String(params.amountCents),
        recipientName: params.recipientName ?? '',
        recipientEmail: params.recipientEmail ?? '',
        message: params.message ?? '',
      },
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: params.amountCents,
            product_data: { name: 'Gift card' },
          },
          quantity: 1,
        },
      ],
    });
    return { url: session.url };
  }

  async createDropInCheckout(
    userId: string,
    sessionId: string,
  ): Promise<{ url: string | null }> {
    const classSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!classSession) {
      throw new BadRequestException('Session not found');
    }
    const stripe = this.ensureStripe();
    const customerId = await this.getOrCreateStripeCustomer(userId);
    const web =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const currency = (
      this.config.get<string>('STRIPE_CURRENCY') ?? 'usd'
    ).toLowerCase();

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      success_url: `${web}/hy/account/classes/${sessionId}?paid=1`,
      cancel_url: `${web}/hy/account/classes/${sessionId}?canceled=1`,
      metadata: { type: 'dropin', userId, sessionId },
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: classSession.priceCents,
            product_data: { name: 'Class drop-in' },
          },
          quantity: 1,
        },
      ],
    });
    return { url: checkout.url };
  }

  async handleStripeWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<void> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!this.stripe || !secret) {
      this.logger.warn('Stripe webhook skipped — not configured');
      return;
    }
    let event: { type: string; data: { object: unknown } };
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature ?? '',
        secret,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'invalid signature';
      throw new BadRequestException(`Webhook: ${msg}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as StripeCheckoutSessionLike;
      const type = session.metadata?.type;
      if (type === 'membership') {
        await this.fulfillMembership(session);
      } else if (type === 'gift') {
        await this.fulfillGift(session);
      } else if (type === 'dropin') {
        await this.fulfillDropIn(session);
      }
    }
  }

  private async fulfillMembership(
    session: StripeCheckoutSessionLike,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (!userId || !planId) {
      return;
    }
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      return;
    }
    const subId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.periodDays);
    const sessionsRemaining = plan.isUnlimited
      ? null
      : (plan.sessionsPerMonth ?? 0);
    await this.prisma.userMembership.create({
      data: {
        userId,
        planId,
        status: MembershipStatus.ACTIVE,
        sessionsRemaining,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        stripeSubscriptionId: subId ?? undefined,
      },
    });
    const paidCents = session.amount_total ?? plan.priceCents;
    const payId =
      (typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id) ?? `sub_${session.id}`;
    await this.prisma.payment.create({
      data: {
        userId,
        amountCents: paidCents,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentId: payId,
        description: 'Membership subscription',
      },
    });
  }

  private async fulfillGift(session: StripeCheckoutSessionLike): Promise<void> {
    const purchaserId = session.metadata?.purchaserId;
    const amount = Number(session.metadata?.amountCents ?? 0);
    if (!purchaserId || !amount) {
      return;
    }
    const code = randomBytes(8).toString('hex').toUpperCase();
    const pi =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    await this.prisma.giftCard.create({
      data: {
        code,
        amountCents: amount,
        balanceCents: amount,
        status: GiftCardStatus.ACTIVE,
        purchaserId,
        recipientName: session.metadata?.recipientName || undefined,
        recipientEmail: session.metadata?.recipientEmail || undefined,
        message: session.metadata?.message || undefined,
        stripePaymentId: pi ?? undefined,
      },
    });
    const email = session.metadata?.recipientEmail;
    if (email) {
      const web =
        this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
      await this.mail.sendEmail({
        to: email,
        subject: 'Your Ommm gift card',
        html: `<p>Your code: <strong>${code}</strong></p><p>Redeem at ${web}</p>`,
      });
    }
  }

  private async fulfillDropIn(
    session: StripeCheckoutSessionLike,
  ): Promise<void> {
    const userId = session.metadata?.userId;
    const sessionId = session.metadata?.sessionId;
    if (!userId || !sessionId) {
      return;
    }
    const classSession = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!classSession) {
      return;
    }
    const pi =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    await this.prisma.payment.create({
      data: {
        userId,
        amountCents: classSession.priceCents,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentId: pi ?? `dropin_${session.id}`,
        description: `Drop-in session ${sessionId}`,
      },
    });
    const existing = await this.prisma.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (!existing) {
      const booked = await this.prisma.booking.count({
        where: { sessionId, status: BookingStatus.BOOKED },
      });
      await this.prisma.booking.create({
        data: { userId, sessionId, status: BookingStatus.BOOKED },
      });
      if (booked + 1 >= classSession.capacity) {
        await this.prisma.classSession.update({
          where: { id: sessionId },
          data: { status: ClassSessionStatus.FULL },
        });
      }
    }
  }

  listPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
