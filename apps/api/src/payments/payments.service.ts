import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  ManualPaymentMethod,
  MembershipStatus,
  Prisma,
  PaymentStatus,
} from '@prisma/client';
import Stripe from 'stripe';
import { randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminListPaymentsQueryDto,
  PaymentSourceFilter,
} from './dto/admin-list-payments-query.dto';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';

type StripeClient = InstanceType<typeof Stripe>;

type PaymentSource = 'package' | 'dropin' | 'gift' | 'other';

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

  async createPackageCheckout(
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
      success_url: `${web}/hy/user/packages?success=1`,
      cancel_url: `${web}/hy/packages?canceled=1`,
      metadata: { type: 'package', userId, planId },
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
      cancel_url: `${web}/hy/packages?gift_canceled=1`,
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
    if (classSession.status === ClassSessionStatus.CANCELLED) {
      throw new BadRequestException('Session is not available');
    }
    if (classSession.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    const existingBooking = await this.prisma.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existingBooking?.status === BookingStatus.BOOKED) {
      throw new BadRequestException('Already booked');
    }
    const booked = await this.prisma.booking.count({
      where: { sessionId, status: BookingStatus.BOOKED },
    });
    if (booked >= classSession.capacity) {
      throw new BadRequestException('Session is full — join waitlist');
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
      if (type === 'package' || type === 'membership') {
        await this.fulfillPackage(session);
      } else if (type === 'gift') {
        await this.fulfillGift(session);
      } else if (type === 'dropin') {
        await this.fulfillDropIn(session);
      }
    }
  }

  private async fulfillPackage(
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
    const existing = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { stripePaymentId: payId },
          { stripePaymentId: `sub_${session.id}` },
        ],
      },
      select: { id: true },
    });
    if (existing) {
      return;
    }
    await this.prisma.payment.create({
      data: {
        userId,
        amountCents: paidCents,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentId: payId,
        description: 'Package subscription',
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
    const stripePaymentId = pi ?? `dropin_${session.id}`;
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        OR: [{ stripePaymentId }, { stripePaymentId: `dropin_${session.id}` }],
      },
      select: { id: true },
    });
    if (existingPayment) {
      return;
    }
    await this.prisma.payment.create({
      data: {
        userId,
        amountCents: classSession.priceCents,
        status: PaymentStatus.SUCCEEDED,
        stripePaymentId,
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

  /**
   * Offline / manual package subscription request.
   * Replace with a real payment gateway checkout when Stripe (or similar) is enabled.
   */
  async createManualPackagePayment(
    userId: string,
    planId: string,
    paymentMethod: ManualPaymentMethod,
  ) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });
    if (!plan?.isActive) {
      throw new BadRequestException('Plan not available');
    }

    const activeSamePlan = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        planId,
        status: MembershipStatus.ACTIVE,
      },
    });
    if (activeSamePlan) {
      throw new ConflictException('You already have an active package for this plan');
    }

    const pendingRequest = await this.prisma.payment.findFirst({
      where: {
        userId,
        planId,
        status: PaymentStatus.PENDING,
        paymentMethod: { not: null },
      },
    });
    if (pendingRequest) {
      throw new ConflictException(
        'A pending subscription request already exists for this plan',
      );
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.periodDays);
    const sessionsRemaining = plan.isUnlimited
      ? null
      : (plan.sessionsPerMonth ?? 0);

    const membership = await this.prisma.userMembership.create({
      data: {
        userId,
        planId,
        status: MembershipStatus.PENDING,
        sessionsRemaining,
        currentPeriodStart: start,
        currentPeriodEnd: end,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        membershipId: membership.id,
        paymentMethod,
        amountCents: plan.priceCents,
        currency: plan.currency.toLowerCase(),
        status: PaymentStatus.PENDING,
        description: `Package subscription (manual): ${plan.name}`,
      },
      include: {
        plan: { select: { id: true, name: true } },
      },
    });

    return payment;
  }

  async adminUpdatePaymentStatus(
    paymentId: string,
    status: AdminUpdatablePaymentStatus,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        membership: { include: { plan: true } },
        plan: true,
      },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (!payment.paymentMethod || !payment.planId) {
      throw new BadRequestException('Not a manual package payment');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment is no longer pending');
    }

    if (status === PaymentStatus.SUCCEEDED) {
      const plan = payment.plan ?? payment.membership?.plan;
      if (!plan) {
        throw new BadRequestException('Plan not found for payment');
      }
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + plan.periodDays);
      const sessionsRemaining = plan.isUnlimited
        ? null
        : (plan.sessionsPerMonth ?? 0);

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.SUCCEEDED },
        }),
        ...(payment.membershipId
          ? [
              this.prisma.userMembership.update({
                where: { id: payment.membershipId },
                data: {
                  status: MembershipStatus.ACTIVE,
                  currentPeriodStart: start,
                  currentPeriodEnd: end,
                  sessionsRemaining,
                },
              }),
            ]
          : []),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        }),
        ...(payment.membershipId
          ? [
              this.prisma.userMembership.update({
                where: { id: payment.membershipId },
                data: { status: MembershipStatus.CANCELLED },
              }),
            ]
          : []),
      ]);
    }

    return this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
        plan: { select: { id: true, name: true, priceCents: true } },
      },
    });
  }

  listPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        plan: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async adminListPayments(query: AdminListPaymentsQueryDto) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    if (query.from && query.to && new Date(query.to) < new Date(query.from)) {
      throw new BadRequestException('Invalid date range');
    }
    const sourceFilter = this.buildSourceFilter(query.source);
    const where: Prisma.PaymentWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(sourceFilter ?? {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              lastName: true,
              phone: true,
              role: true,
            },
          },
          plan: { select: { id: true, name: true, priceCents: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((payment) => ({
        ...payment,
        source: this.detectPaymentSource(payment.description, payment.planId),
      })),
      total,
      take,
      offset,
    };
  }

  private buildSourceFilter(
    source: PaymentSourceFilter | undefined,
  ): Prisma.PaymentWhereInput | undefined {
    if (!source) {
      return undefined;
    }
    if (source === PaymentSourceFilter.PACKAGE) {
      return {
        OR: [
          { planId: { not: null } },
          { description: { startsWith: 'Membership' } },
          { description: { startsWith: 'Package' } },
        ],
      };
    }
    if (source === PaymentSourceFilter.DROPIN) {
      return { description: { startsWith: 'Drop-in' } };
    }
    if (source === PaymentSourceFilter.GIFT) {
      return { description: { startsWith: 'Gift' } };
    }
    return {
      OR: [
        { description: null },
        {
          AND: [
            { description: { not: { startsWith: 'Membership' } } },
            { description: { not: { startsWith: 'Package' } } },
            { description: { not: { startsWith: 'Drop-in' } } },
            { description: { not: { startsWith: 'Gift' } } },
          ],
        },
      ],
    };
  }

  private detectPaymentSource(
    description: string | null,
    planId?: string | null,
  ): PaymentSource {
    if (planId) {
      return 'package';
    }
    const normalized = (description ?? '').toLowerCase();
    if (
      normalized.startsWith('membership') ||
      normalized.startsWith('package')
    ) {
      return 'package';
    }
    if (normalized.startsWith('drop-in')) {
      return 'dropin';
    }
    if (normalized.startsWith('gift')) {
      return 'gift';
    }
    return 'other';
  }
}
