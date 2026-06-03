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

type GiftCardBatchDelegateLike = {
  findUnique: (args: {
    where: { id: string };
    select?: Record<string, boolean>;
  }) => Promise<Record<string, unknown> | null>;
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
};

type GiftCardBatchSnapshot = {
  id: string;
  amountAmd: number;
  imageUrl: string | null;
  expiresAt: Date | null;
  message: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  availableQuantity: number;
  status: GiftCardStatus;
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

  private giftCardBatchDelegate(client: unknown): GiftCardBatchDelegateLike {
    return (client as { giftCardBatch: GiftCardBatchDelegateLike }).giftCardBatch;
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

  async createGiftCheckout(params: {
    purchaserId: string;
    batchId?: string;
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

    const metadata: Record<string, string> = {
      type: 'gift',
      purchaserId: params.purchaserId,
      amountCents: String(params.amountCents),
      recipientName: params.recipientName ?? '',
      recipientEmail: params.recipientEmail ?? '',
      message: params.message ?? '',
    };

    if (params.batchId !== undefined) {
      const batchDelegate = this.giftCardBatchDelegate(this.prisma);
      const batch = (await batchDelegate.findUnique({
        where: { id: params.batchId },
        select: { id: true, amountAmd: true, availableQuantity: true, status: true },
      })) as Pick<GiftCardBatchSnapshot, 'id' | 'amountAmd' | 'availableQuantity' | 'status'> | null;
      if (!batch) {
        throw new BadRequestException('Gift-card batch not found');
      }
      if (batch.status !== GiftCardStatus.ACTIVE || batch.availableQuantity < 1) {
        throw new BadRequestException('Gift card is out of stock');
      }
      metadata.batchId = String(batch.id);
      metadata.amountCents = String(batch.amountAmd);
      if (params.amountCents !== Number(batch.amountAmd)) {
        throw new BadRequestException('Invalid gift-card amount for selected batch');
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      success_url: `${web}/hy/account/gift-cards?success=1`,
      cancel_url: `${web}/hy/account/gift-cards?gift_canceled=1`,
      metadata,
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
      if (type === 'gift') {
        await this.fulfillGift(session);
      } else if (type === 'dropin') {
        await this.fulfillDropIn(session);
      }
    }
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
    const existing = pi
      ? await this.prisma.giftCard.findUnique({
          where: { stripePaymentId: pi },
          select: { id: true },
        })
      : null;
    if (existing) {
      return;
    }
    const batchId = session.metadata?.batchId;
    let recipientEmailToSend: string | undefined;
    await this.prisma.$transaction(async (tx) => {
      const batchDelegate = this.giftCardBatchDelegate(tx);
      let selectedBatch:
        | {
            id: string;
            amountAmd: number;
            imageUrl: string | null;
            expiresAt: Date | null;
            message: string | null;
            recipientName: string | null;
            recipientEmail: string | null;
            availableQuantity: number;
            status: GiftCardStatus;
          }
        | null = null;

      if (batchId) {
        const decremented = await batchDelegate.updateMany({
          where: {
            id: batchId,
            status: GiftCardStatus.ACTIVE,
            availableQuantity: { gt: 0 },
          },
          data: { availableQuantity: { decrement: 1 } },
        });
        if (decremented.count !== 1) {
          throw new BadRequestException('Gift card is out of stock');
        }
        selectedBatch = (await batchDelegate.findUnique({
          where: { id: batchId },
          select: {
            id: true,
            amountAmd: true,
            imageUrl: true,
            expiresAt: true,
            message: true,
            recipientName: true,
            recipientEmail: true,
            availableQuantity: true,
            status: true,
          },
        })) as GiftCardBatchSnapshot | null;
        if (!selectedBatch) {
          throw new BadRequestException('Gift-card batch not found');
        }
      }

      await tx.giftCard.create(({
        data: {
          batchId: selectedBatch?.id,
          code,
          amountAmd: selectedBatch?.amountAmd ?? amount,
          balanceAmd: selectedBatch?.amountAmd ?? amount,
          imageUrl: selectedBatch?.imageUrl ?? undefined,
          status: GiftCardStatus.ACTIVE,
          purchaserId,
          recipientName:
            session.metadata?.recipientName || selectedBatch?.recipientName || undefined,
          recipientEmail:
            session.metadata?.recipientEmail || selectedBatch?.recipientEmail || undefined,
          message: session.metadata?.message || selectedBatch?.message || undefined,
          stripePaymentId: pi ?? undefined,
          expiresAt: selectedBatch?.expiresAt ?? undefined,
        },
      } as unknown) as Parameters<typeof tx.giftCard.create>[0]);
      recipientEmailToSend =
        session.metadata?.recipientEmail || selectedBatch?.recipientEmail || undefined;
    });
    const email = recipientEmailToSend;
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

  listPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
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
        source: this.detectPaymentSource(payment.description),
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

  private detectPaymentSource(description: string | null): PaymentSource {
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
