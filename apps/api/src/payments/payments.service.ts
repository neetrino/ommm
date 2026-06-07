import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  ManualPaymentMethod,
  PackageStatus,
  Prisma,
  PaymentStatus,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminListPaymentsQueryDto,
  PaymentSourceFilter,
} from './dto/admin-list-payments-query.dto';
import type { ListMyPaymentsQueryDto } from './dto/list-my-payments-query.dto';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { resolveDateListPrismaOrder } from '../common/list-order.helpers';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import type { GiftPaymentMethod } from './dto/confirm-gift-payment.dto';
import { requiresManualAdminConfirmation } from './payment-confirmation.util';

type PaymentListSource = 'package' | 'dropin' | 'gift' | 'other';

const INTERNAL_PAYMENT_SOURCE = {
  PACKAGE: 'PACKAGE',
  DROPIN: 'DROPIN',
  GIFT: 'GIFT',
  OTHER: 'OTHER',
} as const;

type InternalPaymentSource =
  (typeof INTERNAL_PAYMENT_SOURCE)[keyof typeof INTERNAL_PAYMENT_SOURCE];

type PaymentMetadata = {
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
};

type GiftEmailPayload = {
  to: string;
  code: string;
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

type InternalPaymentRecord = {
  id: string;
  userId: string;
  amountCents: number;
  status: PaymentStatus;
  source?: InternalPaymentSource;
  sourceId?: string | null;
  metadata?: Prisma.JsonValue | null;
  userPackageId?: string | null;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  async createGiftCheckout(params: {
    purchaserId: string;
    batchId?: string;
    amountCents: number;
    recipientName?: string;
    recipientEmail?: string;
    message?: string;
  }) {
    const metadata: PaymentMetadata = {
      ...(params.recipientName ? { recipientName: params.recipientName } : {}),
      ...(params.recipientEmail
        ? { recipientEmail: params.recipientEmail }
        : {}),
      ...(params.message ? { message: params.message } : {}),
    };
    if (params.batchId !== undefined) {
      const batch = await this.prisma.giftCardBatch.findUnique({
        where: { id: params.batchId },
        select: {
          id: true,
          amountAmd: true,
          availableQuantity: true,
          status: true,
        },
      });
      if (!batch) {
        throw new BadRequestException('Gift-card batch not found');
      }
      if (
        batch.status !== GiftCardStatus.ACTIVE ||
        batch.availableQuantity < 1
      ) {
        throw new BadRequestException('Gift card is out of stock');
      }
      if (params.amountCents !== Number(batch.amountAmd)) {
        throw new BadRequestException(
          'Invalid gift-card amount for selected batch',
        );
      }
    }

    return this.prisma.payment.create({
      data: this.withInternalPaymentCreateFields({
        userId: params.purchaserId,
        amountCents: params.amountCents,
        currency: 'amd',
        status: PaymentStatus.PENDING,
        paymentReference: this.createPaymentReference('GIFT'),
        source: INTERNAL_PAYMENT_SOURCE.GIFT,
        sourceId: params.batchId,
        description: 'Gift card purchase',
        metadata: metadata,
      }),
    });
  }

  async createDropInCheckout(userId: string, sessionId: string) {
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
    if (classSession.priceCents <= 0) {
      throw new BadRequestException('This session does not require payment');
    }

    const existingPending = await this.prisma.payment.findFirst({
      where: {
        userId,
        ...this.withInternalPaymentWhereFields({
          source: INTERNAL_PAYMENT_SOURCE.DROPIN,
          sourceId: sessionId,
        }),
        status: PaymentStatus.PENDING,
      },
    });
    if (existingPending) {
      return existingPending;
    }

    return this.prisma.payment.create({
      data: this.withInternalPaymentCreateFields({
        userId,
        amountCents: classSession.priceCents,
        status: PaymentStatus.PENDING,
        paymentReference: this.createPaymentReference('DROPIN'),
        source: INTERNAL_PAYMENT_SOURCE.DROPIN,
        sourceId: sessionId,
        description: `Drop-in session ${sessionId}`,
      }),
    });
  }

  async adminUpdatePaymentStatus(
    paymentId: string,
    status: AdminUpdatablePaymentStatus,
    adminId: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.status !== PaymentStatus.PENDING) {
      throw new ConflictException('Only pending payments can be updated');
    }
    if (!requiresManualAdminConfirmation(payment)) {
      throw new BadRequestException(
        'Only pending cash payments can be manually updated',
      );
    }

    if (status === PaymentStatus.SUCCEEDED) {
      return this.confirmPayment(paymentId, adminId, {
        paymentMethod: ManualPaymentMethod.CASH,
      });
    }

    return this.prisma.$transaction(async (tx) =>
      tx.payment.update({
        where: { id: paymentId },
        data: this.withInternalPaymentUpdateFields({
          status,
          confirmedAt: new Date(),
          confirmedByAdminId: adminId,
          paymentMethod: ManualPaymentMethod.CASH,
        }),
      }),
    );
  }

  /** Confirms a pending card payment after the user checkout flow completes. */
  async confirmPendingCardPayment(paymentId: string): Promise<void> {
    await this.confirmPayment(paymentId, null, {
      paymentMethod: ManualPaymentMethod.CARD,
    });
  }

  async confirmGiftPayment(
    userId: string,
    paymentReference: string,
    paymentMethod: GiftPaymentMethod,
  ) {
    if (paymentMethod === ManualPaymentMethod.CASH) {
      return this.prisma.$transaction(async (tx) => {
        const existing = (await tx.payment.findFirst({
          where: this.withInternalPaymentWhereFields({ paymentReference }),
        })) as InternalPaymentRecord | null;
        if (!existing || existing.userId !== userId) {
          throw new NotFoundException('Payment not found');
        }
        if (existing.status !== PaymentStatus.PENDING) {
          throw new ConflictException('Only pending payments can be confirmed');
        }
        if (existing.source !== INTERNAL_PAYMENT_SOURCE.GIFT) {
          throw new BadRequestException('Payment is not a gift purchase');
        }
        return tx.payment.update({
          where: { id: existing.id },
          data: this.withInternalPaymentUpdateFields({
            paymentMethod: ManualPaymentMethod.CASH,
          }),
        });
      });
    }

    const giftEmails: GiftEmailPayload[] = [];
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = (await tx.payment.findFirst({
        where: this.withInternalPaymentWhereFields({ paymentReference }),
      })) as InternalPaymentRecord | null;
      if (!existing || existing.userId !== userId) {
        throw new NotFoundException('Payment not found');
      }
      if (existing.status !== PaymentStatus.PENDING) {
        throw new ConflictException('Only pending payments can be confirmed');
      }
      if (existing.source !== INTERNAL_PAYMENT_SOURCE.GIFT) {
        throw new BadRequestException('Payment is not a gift purchase');
      }
      const email = await this.fulfillGiftPayment(tx, {
        userId: existing.userId,
        amountCents: existing.amountCents,
        sourceId: existing.sourceId ?? null,
        metadata: existing.metadata ?? null,
      });
      if (email) {
        giftEmails.push(email);
      }
      return tx.payment.update({
        where: { id: existing.id },
        data: this.withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          paymentMethod,
        }),
      });
    });
    for (const email of giftEmails) {
      await this.sendGiftCardEmail(email.to, email.code);
    }
    return payment;
  }

  private async confirmPayment(
    paymentId: string,
    adminId: string | null,
    options?: { paymentMethod?: ManualPaymentMethod },
  ) {
    const giftEmails: GiftEmailPayload[] = [];
    const payment = await this.prisma.$transaction(async (tx) => {
      const existing = (await tx.payment.findUnique({
        where: { id: paymentId },
      })) as InternalPaymentRecord | null;
      if (!existing) {
        throw new NotFoundException('Payment not found');
      }
      if (existing.status !== PaymentStatus.PENDING) {
        throw new ConflictException('Only pending payments can be confirmed');
      }

      if (existing.source === INTERNAL_PAYMENT_SOURCE.PACKAGE) {
        await this.fulfillPackagePayment(tx, existing.userPackageId ?? null);
      } else if (existing.source === INTERNAL_PAYMENT_SOURCE.DROPIN) {
        await this.fulfillDropInPayment(
          tx,
          existing.userId,
          existing.sourceId ?? null,
        );
      } else if (existing.source === INTERNAL_PAYMENT_SOURCE.GIFT) {
        const email = await this.fulfillGiftPayment(tx, {
          userId: existing.userId,
          amountCents: existing.amountCents,
          sourceId: existing.sourceId ?? null,
          metadata: existing.metadata ?? null,
        });
        if (email) {
          giftEmails.push(email);
        }
      }

      return tx.payment.update({
        where: { id: paymentId },
        data: this.withInternalPaymentUpdateFields({
          status: PaymentStatus.SUCCEEDED,
          confirmedAt: new Date(),
          ...(adminId ? { confirmedByAdminId: adminId } : {}),
          ...(options?.paymentMethod ? { paymentMethod: options.paymentMethod } : {}),
        }),
      });
    });

    for (const email of giftEmails) {
      await this.sendGiftCardEmail(email.to, email.code);
    }
    return payment;
  }

  async listPayments(userId: string, query: ListMyPaymentsQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    if (!hasPagination) {
      return this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const order = query.order === 'oldest' ? 'asc' : 'desc';
    const where: Prisma.PaymentWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: order },
        take,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, total, take, offset };
  }

  async adminListPayments(query: AdminListPaymentsQueryDto) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    if (query.from && query.to && new Date(query.to) < new Date(query.from)) {
      throw new BadRequestException('Invalid date range');
    }
    const sourceFilter = this.buildSourceFilter(query.source);
    const packageFilter = await this.buildPackagePaymentFilter(query);
    const search = query.q?.trim();
    const order = resolveDateListPrismaOrder(query.order);
    const where: Prisma.PaymentWhereInput = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(sourceFilter ?? {}),
      ...(packageFilter ?? {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { paymentReference: { contains: search, mode: 'insensitive' } },
              {
                user: {
                  email: { contains: search, mode: 'insensitive' },
                },
              },
              {
                user: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
              {
                user: {
                  lastName: { contains: search, mode: 'insensitive' },
                },
              },
              {
                user: {
                  phone: { contains: search, mode: 'insensitive' },
                },
              },
            ],
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
        orderBy: [{ createdAt: order }, { id: order }],
        take,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map((payment) => ({
        ...payment,
        source: this.detectPaymentSource(
          payment.description,
          this.readPaymentSource(payment),
        ),
      })),
      total,
      take,
      offset,
    };
  }

  private async fulfillPackagePayment(
    tx: Prisma.TransactionClient,
    userPackageId: string | null,
  ) {
    if (!userPackageId) {
      throw new BadRequestException(
        'Package payment is not linked to a package',
      );
    }
    await tx.userPackage.update({
      where: { id: userPackageId },
      data: { status: PackageStatus.ACTIVE },
    });
  }

  private async fulfillDropInPayment(
    tx: Prisma.TransactionClient,
    userId: string,
    sessionId: string | null,
  ) {
    if (!sessionId) {
      throw new BadRequestException('Drop-in payment is missing session');
    }
    const classSession = await tx.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!classSession || classSession.status === ClassSessionStatus.CANCELLED) {
      throw new BadRequestException('Session is not available');
    }
    if (classSession.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    const existing = await tx.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existing?.status === BookingStatus.BOOKED) {
      return;
    }
    const booked = await tx.booking.count({
      where: { sessionId, status: BookingStatus.BOOKED },
    });
    if (booked >= classSession.capacity) {
      throw new BadRequestException('Session is full — join waitlist');
    }
    if (existing) {
      await tx.booking.update({
        where: { id: existing.id },
        data: {
          status: BookingStatus.BOOKED,
          cancelledAt: null,
          attendedAt: null,
        },
      });
    } else {
      await tx.booking.create({
        data: { userId, sessionId, status: BookingStatus.BOOKED },
      });
    }
    if (booked + 1 >= classSession.capacity) {
      await tx.classSession.update({
        where: { id: sessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
  }

  private async fulfillGiftPayment(
    tx: Prisma.TransactionClient,
    payment: {
      userId: string;
      amountCents: number;
      sourceId: string | null;
      metadata: Prisma.JsonValue | null;
    },
  ): Promise<{ to: string; code: string } | null> {
    const metadata = this.parsePaymentMetadata(payment.metadata);
    let selectedBatch: GiftCardBatchSnapshot | null = null;
    if (payment.sourceId) {
      const decremented = await tx.giftCardBatch.updateMany({
        where: {
          id: payment.sourceId,
          status: GiftCardStatus.ACTIVE,
          availableQuantity: { gt: 0 },
        },
        data: { availableQuantity: { decrement: 1 } },
      });
      if (decremented.count !== 1) {
        throw new BadRequestException('Gift card is out of stock');
      }
      selectedBatch = await tx.giftCardBatch.findUnique({
        where: { id: payment.sourceId },
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
      });
      if (!selectedBatch) {
        throw new BadRequestException('Gift-card batch not found');
      }
    }
    const code = randomBytes(8).toString('hex').toUpperCase();
    const recipientEmail =
      metadata.recipientEmail || selectedBatch?.recipientEmail || undefined;
    await tx.giftCard.create({
      data: {
        batchId: selectedBatch?.id,
        code,
        amountAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        balanceAmd: selectedBatch?.amountAmd ?? payment.amountCents,
        imageUrl: selectedBatch?.imageUrl ?? undefined,
        status: GiftCardStatus.ACTIVE,
        purchaserId: payment.userId,
        recipientName:
          metadata.recipientName || selectedBatch?.recipientName || undefined,
        recipientEmail,
        message: metadata.message || selectedBatch?.message || undefined,
        expiresAt: selectedBatch?.expiresAt ?? undefined,
      },
    });
    return recipientEmail ? { to: recipientEmail, code } : null;
  }

  private async buildPackagePaymentFilter(
    query: AdminListPaymentsQueryDto,
  ): Promise<Prisma.PaymentWhereInput | undefined> {
    const filters: Prisma.PaymentWhereInput[] = [];
    const planWhere: Prisma.PackagePlanWhereInput = {};

    if (query.planId?.trim()) {
      filters.push({ planId: query.planId.trim() });
    }

    if (query.packageClass?.trim()) {
      const matchingPlans = await this.prisma.packagePlan.findMany({
        where: {
          categoryName: {
            equals: query.packageClass.trim(),
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });
      if (matchingPlans.length === 0) {
        return { planId: { in: [] } };
      }
      planWhere.id = { in: matchingPlans.map((plan) => plan.id) };
    }

    const sessionsFilter = this.buildPackageSessionsPlanFilter(query.sessions);
    if (sessionsFilter) {
      Object.assign(planWhere, sessionsFilter);
    }

    if (Object.keys(planWhere).length > 0) {
      filters.push({ plan: planWhere });
    }

    if (filters.length === 0) {
      return undefined;
    }
    if (filters.length === 1) {
      return filters[0];
    }
    return { AND: filters };
  }

  private buildPackageSessionsPlanFilter(
    sessions: string | undefined,
  ): Pick<Prisma.PackagePlanWhereInput, 'isUnlimited' | 'sessionsPerMonth'> | undefined {
    const raw = sessions?.trim();
    if (!raw) {
      return undefined;
    }
    if (raw === 'unlimited') {
      return { isUnlimited: true };
    }
    const count = Number.parseInt(raw, 10);
    if (!Number.isInteger(count) || count <= 0) {
      return undefined;
    }
    return {
      sessionsPerMonth: count,
      isUnlimited: false,
    };
  }

  private buildSourceFilter(
    source: PaymentSourceFilter | undefined,
  ): Prisma.PaymentWhereInput | undefined {
    if (!source) {
      return undefined;
    }
    if (source === PaymentSourceFilter.PACKAGE) {
      return this.withInternalPaymentWhereFields({
        source: INTERNAL_PAYMENT_SOURCE.PACKAGE,
      });
    }
    if (source === PaymentSourceFilter.DROPIN) {
      return this.withInternalPaymentWhereFields({
        source: INTERNAL_PAYMENT_SOURCE.DROPIN,
      });
    }
    if (source === PaymentSourceFilter.GIFT) {
      return this.withInternalPaymentWhereFields({
        source: INTERNAL_PAYMENT_SOURCE.GIFT,
      });
    }
    return this.withInternalPaymentWhereFields({
      source: INTERNAL_PAYMENT_SOURCE.OTHER,
    });
  }

  private detectPaymentSource(
    description: string | null,
    source?: InternalPaymentSource,
  ): PaymentListSource {
    if (source === INTERNAL_PAYMENT_SOURCE.PACKAGE) return 'package';
    if (source === INTERNAL_PAYMENT_SOURCE.DROPIN) return 'dropin';
    if (source === INTERNAL_PAYMENT_SOURCE.GIFT) return 'gift';
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

  private createPaymentReference(prefix: string): string {
    return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`;
  }

  private withInternalPaymentCreateFields<T extends Record<string, unknown>>(
    data: T,
  ): Prisma.PaymentUncheckedCreateInput {
    return data as unknown as Prisma.PaymentUncheckedCreateInput;
  }

  private withInternalPaymentUpdateFields<T extends Record<string, unknown>>(
    data: T,
  ): Prisma.PaymentUncheckedUpdateInput {
    return data;
  }

  private withInternalPaymentWhereFields<T extends Record<string, unknown>>(
    where: T,
  ): Prisma.PaymentWhereInput {
    return where;
  }

  private readPaymentSource(
    payment: object,
  ): InternalPaymentSource | undefined {
    const value = (payment as { source?: unknown }).source;
    return this.isInternalPaymentSource(value) ? value : undefined;
  }

  private isInternalPaymentSource(
    value: unknown,
  ): value is InternalPaymentSource {
    return (
      value === INTERNAL_PAYMENT_SOURCE.PACKAGE ||
      value === INTERNAL_PAYMENT_SOURCE.DROPIN ||
      value === INTERNAL_PAYMENT_SOURCE.GIFT ||
      value === INTERNAL_PAYMENT_SOURCE.OTHER
    );
  }

  private parsePaymentMetadata(
    value: Prisma.JsonValue | null,
  ): PaymentMetadata {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {};
    }
    return {
      recipientName: this.readString(value, 'recipientName'),
      recipientEmail: this.readString(value, 'recipientEmail'),
      message: this.readString(value, 'message'),
    };
  }

  private readString(
    value: object,
    key: keyof PaymentMetadata,
  ): string | undefined {
    const candidate = (value as Record<string, unknown>)[key];
    return typeof candidate === 'string' && candidate.trim().length > 0
      ? candidate
      : undefined;
  }

  private async sendGiftCardEmail(to: string, code: string): Promise<void> {
    const web =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    await this.mail.sendEmail({
      to,
      subject: 'Your Ommm gift card',
      html: `<p>Your code: <strong>${code}</strong></p><p>Redeem at ${web}</p>`,
    });
  }
}
