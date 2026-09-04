import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  Prisma,
  UserPackageStatus,
} from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { resolveDateListPrismaOrder } from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import type { ListMyPaymentsQueryDto } from './dto/list-my-payments-query.dto';
import type { AdminUpdatablePaymentStatus } from './dto/admin-update-payment-status.dto';
import { PaymentSuccessEmailService } from './payment-success-email.service';
import { EhdmReceiptService } from './ehdm/ehdm-receipt.service';
import { buildAdminListPaymentsWhere } from './payments-admin-list.util';
import {
  detectPaymentSource,
  readPaymentSource,
  withInternalPaymentUpdateFields,
} from './payments.helpers';
import {
  resolveAdminPaymentRelatedItemGroupName,
  resolveAdminPaymentRelatedItemName,
  type AdminPaymentPackageLabels,
} from './payments-related-item.util';
import { PaymentsCheckoutService } from './payments-checkout.service';
import {
  PAYMENT_STATUS_REASON,
  readPaymentStatusReason,
} from './payment-status-reason';
import { mergeArcaMetadata } from './arca/arca-metadata.util';

@Injectable()
export class PaymentsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkout: PaymentsCheckoutService,
    private readonly paymentSuccessEmail: PaymentSuccessEmailService,
    private readonly ehdmReceipt: EhdmReceiptService,
  ) {}

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
    if (payment.paymentMethod === ManualPaymentMethod.CARD) {
      if (payment.status === PaymentStatus.PENDING) {
        return this.checkout.confirmPayment(paymentId, adminId, {
          paymentMethod: ManualPaymentMethod.CARD,
        });
      }
      throw new BadRequestException(
        'Card payment status is confirmed automatically',
      );
    }
    if (payment.status === status) {
      return payment;
    }

    const previousStatus = payment.status;

    if (
      status === PaymentStatus.SUCCEEDED &&
      payment.status === PaymentStatus.PENDING
    ) {
      return this.checkout.confirmPayment(paymentId, adminId, {
        paymentMethod: payment.paymentMethod ?? ManualPaymentMethod.CASH,
      });
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: withInternalPaymentUpdateFields({
        status,
        confirmedAt: this.resolveAdminStatusConfirmedAt(
          status,
          payment.confirmedAt,
        ),
        confirmedByAdminId: adminId,
        ...(this.shouldSetDefaultManualPaymentMethod(
          status,
          payment.paymentMethod,
        )
          ? { paymentMethod: ManualPaymentMethod.CASH }
          : {}),
        ...(status === PaymentStatus.FAILED
          ? {
              metadata: mergeArcaMetadata(payment.metadata, {
                statusReason: PAYMENT_STATUS_REASON.ADMIN_REJECTED,
              }),
            }
          : {}),
        ...(status === PaymentStatus.PENDING
          ? {
              metadata: mergeArcaMetadata(payment.metadata, {
                statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH,
              }),
            }
          : {}),
      }),
    });

    if (status === PaymentStatus.REFUNDED) {
      await this.cancelPackageLinkedToRefundedPayment(payment);
      this.ehdmReceipt.tryPrintReturnReceipt(updated.id);
    }

    if (
      status === PaymentStatus.SUCCEEDED &&
      previousStatus !== PaymentStatus.SUCCEEDED
    ) {
      await this.paymentSuccessEmail.trySendSuccessEmails(
        updated.id,
        previousStatus,
      );
      this.ehdmReceipt.tryPrintReceipt(updated.id, previousStatus);
    }

    return updated;
  }

  async listPayments(userId: string, query: ListMyPaymentsQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    if (!hasPagination) {
      const items = await this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { ehdmReceipt: true },
      });
      return items.map((payment) => ({
        ...payment,
        statusReason: readPaymentStatusReason(payment.metadata),
        ehdmReceipt: payment.ehdmReceipt
          ? this.ehdmReceipt.toReceiptSummary(payment.ehdmReceipt)
          : null,
      }));
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
        include: { ehdmReceipt: true },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return {
      items: items.map((payment) => ({
        ...payment,
        statusReason: readPaymentStatusReason(payment.metadata),
        ehdmReceipt: payment.ehdmReceipt
          ? this.ehdmReceipt.toReceiptSummary(payment.ehdmReceipt)
          : null,
      })),
      total,
      take,
      offset,
    };
  }

  /** Payment outcome for the success/fail screen — scoped to the owning user. */
  async getPaymentOutcomeByReference(userId: string, reference: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { userId, paymentReference: reference },
      include: { ehdmReceipt: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return {
      paymentReference: payment.paymentReference,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      description: payment.description,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.confirmedAt ?? payment.createdAt,
      ehdmReceipt: payment.ehdmReceipt
        ? this.ehdmReceipt.toReceiptSummary(payment.ehdmReceipt)
        : null,
    };
  }

  async adminListPayments(query: AdminListPaymentsQueryDto) {
    const take = query.take ?? 25;
    const offset = query.offset ?? 0;
    if (query.from && query.to && new Date(query.to) < new Date(query.from)) {
      throw new BadRequestException('Invalid date range');
    }
    const order = resolveDateListPrismaOrder(query.order);
    const where = buildAdminListPaymentsWhere(query);

    const [items, total, amountAgg] = await Promise.all([
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
          ehdmReceipt: true,
        },
        orderBy: [{ createdAt: order }, { id: order }],
        take,
        skip: offset,
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amountCents: true },
      }),
    ]);

    const packageLabelsByUserPackageId =
      await this.loadPackageLabelsForPayments(items);

    return {
      items: items.map((payment) => {
        const source = detectPaymentSource(
          payment.description,
          readPaymentSource(payment),
        );
        const relatedArgs = {
          source,
          description: payment.description,
          sourceId: payment.sourceId,
          packageLabelsByUserPackageId,
        };
        return {
          ...payment,
          source,
          relatedItemName: resolveAdminPaymentRelatedItemName(relatedArgs),
          relatedItemGroupName:
            resolveAdminPaymentRelatedItemGroupName(relatedArgs),
          statusReason: readPaymentStatusReason(payment.metadata),
          ehdmReceipt: payment.ehdmReceipt
            ? this.ehdmReceipt.toReceiptSummary(payment.ehdmReceipt)
            : null,
        };
      }),
      total,
      totalAmountCents: amountAgg._sum.amountCents ?? 0,
      take,
      offset,
    };
  }

  private async loadPackageLabelsForPayments(
    items: readonly {
      sourceId: string | null;
      source: unknown;
      description: string | null;
    }[],
  ): Promise<Map<string, AdminPaymentPackageLabels>> {
    const packageUserPackageIds = items
      .filter((payment) => {
        const source = detectPaymentSource(
          payment.description,
          readPaymentSource(payment),
        );
        return source === 'package' && payment.sourceId !== null;
      })
      .map((payment) => payment.sourceId as string);

    if (packageUserPackageIds.length === 0) {
      return new Map();
    }

    const userPackages = await this.prisma.userPackage.findMany({
      where: { id: { in: packageUserPackageIds } },
      select: {
        id: true,
        planNameSnapshot: true,
        planCategoryNameSnapshot: true,
        plan: { select: { name: true, categoryName: true } },
      },
    });

    return new Map(
      userPackages.map((userPackage) => {
        const groupName = (
          userPackage.plan?.categoryName ?? userPackage.planCategoryNameSnapshot
        ).trim();
        return [
          userPackage.id,
          {
            name: userPackage.plan?.name ?? userPackage.planNameSnapshot,
            groupName: groupName.length > 0 ? groupName : null,
          },
        ];
      }),
    );
  }

  private async cancelPackageLinkedToRefundedPayment(payment: {
    source: PaymentSource;
    sourceId: string | null;
  }): Promise<void> {
    if (payment.source !== PaymentSource.PACKAGE || payment.sourceId === null) {
      return;
    }

    await this.prisma.userPackage.updateMany({
      where: {
        id: payment.sourceId,
        status: {
          in: [
            UserPackageStatus.ACTIVE,
            UserPackageStatus.PAUSED,
            UserPackageStatus.PENDING,
          ],
        },
      },
      data: { status: UserPackageStatus.CANCELLED },
    });
  }

  private resolveAdminStatusConfirmedAt(
    status: PaymentStatus,
    existingConfirmedAt: Date | null,
  ): Date | null {
    if (status === PaymentStatus.PENDING) {
      return null;
    }
    if (
      status === PaymentStatus.SUCCEEDED ||
      status === PaymentStatus.FAILED ||
      status === PaymentStatus.REFUNDED
    ) {
      return existingConfirmedAt ?? new Date();
    }
    return existingConfirmedAt;
  }

  private shouldSetDefaultManualPaymentMethod(
    status: PaymentStatus,
    paymentMethod: ManualPaymentMethod | null,
  ): boolean {
    return (
      paymentMethod === null &&
      (status === PaymentStatus.SUCCEEDED || status === PaymentStatus.FAILED)
    );
  }
}
