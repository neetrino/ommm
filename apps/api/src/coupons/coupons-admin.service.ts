import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponRedemptionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  couponScalarData,
  type CouponScalarData,
} from './coupons-admin.helpers';
import {
  deriveCouponDisplayStatus,
  remainingCouponUses,
} from './coupon-status.util';
import type { UpsertCouponDto } from './dto/upsert-coupon.dto';

const OPEN_USE = [
  CouponRedemptionStatus.RESERVED,
  CouponRedemptionStatus.APPLIED,
] as const;

const LIST_TAKE = 100;

@Injectable()
export class CouponsAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      take: LIST_TAKE,
      include: couponInclude(),
    });
    const used = await this.usedCounts(coupons.map((row) => row.id));
    return coupons.map((row) => this.toAdminRow(row, used.get(row.id) ?? 0));
  }

  async create(actorId: string, dto: UpsertCouponDto) {
    const data = await this.resolveWrite(dto);
    try {
      const created = await this.prisma.coupon.create({
        data: {
          ...scalar(data),
          createdBy: { connect: { id: actorId } },
          eligibleUsers: { create: data.userIds.map((userId) => ({ userId })) },
          eligibleProducts: { create: data.products },
        },
        include: couponInclude(),
      });
      return this.toAdminRow(created, 0);
    } catch (error) {
      throw uniqueCodeOrRethrow(error);
    }
  }

  async update(id: string, dto: UpsertCouponDto) {
    await this.requireCoupon(id);
    const data = await this.resolveWrite(dto);
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.couponEligibleUser.deleteMany({ where: { couponId: id } });
        await tx.couponEligibleProduct.deleteMany({ where: { couponId: id } });
        return tx.coupon.update({
          where: { id },
          data: {
            ...scalar(data),
            eligibleUsers: {
              create: data.userIds.map((userId) => ({ userId })),
            },
            eligibleProducts: { create: data.products },
          },
          include: couponInclude(),
        });
      });
      const used = await this.usedCounts([id]);
      return this.toAdminRow(updated, used.get(id) ?? 0);
    } catch (error) {
      throw uniqueCodeOrRethrow(error);
    }
  }

  async setStatus(id: string, status: 'ACTIVE' | 'DISABLED') {
    await this.requireCoupon(id);
    const updated = await this.prisma.coupon.update({
      where: { id },
      data: { status },
      include: couponInclude(),
    });
    const used = await this.usedCounts([id]);
    return this.toAdminRow(updated, used.get(id) ?? 0);
  }

  async removeDraft(id: string) {
    const coupon = await this.requireCoupon(id);
    if (coupon.status !== 'DRAFT') {
      throw new BadRequestException('Only an unused draft can be deleted');
    }
    const used = await this.prisma.couponRedemption.count({
      where: { couponId: id, status: { in: [...OPEN_USE] } },
    });
    if (used > 0) {
      throw new BadRequestException('Only an unused draft can be deleted');
    }
    await this.prisma.coupon.delete({ where: { id } });
    return { id };
  }

  private async requireCoupon(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (coupon === null) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  private async resolveWrite(dto: UpsertCouponDto) {
    const emails = uniqueEmails(dto.eligibleEmails);
    const users = emails.length
      ? await this.prisma.user.findMany({
          where: { email: { in: emails } },
          select: { id: true, email: true },
        })
      : [];
    if (users.length !== emails.length) {
      throw new BadRequestException('One or more users were not found');
    }
    const data = couponScalarData(
      dto,
      users.map((user) => user.id),
    );
    await this.assertPlansExist(data.products);
    return data;
  }

  private async assertPlansExist(
    products: { packagePlanId: string | null }[],
  ): Promise<void> {
    const ids = products
      .map((row) => row.packagePlanId)
      .filter((id): id is string => id !== null);
    if (ids.length === 0) {
      return;
    }
    const found = await this.prisma.packagePlan.count({
      where: { id: { in: ids } },
    });
    if (found !== new Set(ids).size) {
      throw new BadRequestException('One or more packages were not found');
    }
  }

  private async usedCounts(ids: string[]): Promise<Map<string, number>> {
    if (ids.length === 0) {
      return new Map();
    }
    const groups = await this.prisma.couponRedemption.groupBy({
      by: ['couponId'],
      where: { couponId: { in: ids }, status: { in: [...OPEN_USE] } },
      _count: { _all: true },
    });
    return new Map(groups.map((row) => [row.couponId, row._count._all]));
  }

  private toAdminRow(
    coupon: Prisma.CouponGetPayload<{
      include: ReturnType<typeof couponInclude>;
    }>,
    usedCount: number,
  ) {
    const now = new Date();
    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      validFrom: coupon.validFrom?.toISOString() ?? null,
      validUntil: coupon.validUntil?.toISOString() ?? null,
      totalUsageLimit: coupon.totalUsageLimit,
      usageLimitPerUser: coupon.usageLimitPerUser,
      eligibleAllUsers: coupon.eligibleAllUsers,
      eligibleAllProducts: coupon.eligibleAllProducts,
      status: coupon.status,
      displayStatus: deriveCouponDisplayStatus({
        status: coupon.status,
        validUntil: coupon.validUntil,
        totalUsageLimit: coupon.totalUsageLimit,
        usedCount,
        now,
      }),
      usedCount,
      remainingUses: remainingCouponUses(coupon.totalUsageLimit, usedCount),
      createdBy: {
        id: coupon.createdBy.id,
        email: coupon.createdBy.email,
        name: coupon.createdBy.name,
        lastName: coupon.createdBy.lastName,
      },
      eligibleUsers: coupon.eligibleUsers.map((row) => ({
        id: row.user.id,
        email: row.user.email,
        name: row.user.name,
        lastName: row.user.lastName,
      })),
      eligibleProducts: coupon.eligibleProducts.map((row) => ({
        kind: row.productKind,
        packagePlanId: row.packagePlanId,
        packageName: row.packagePlan?.name ?? null,
      })),
      createdAt: coupon.createdAt.toISOString(),
    };
  }
}

function couponInclude() {
  return {
    createdBy: {
      select: { id: true, email: true, name: true, lastName: true },
    },
    eligibleUsers: {
      include: {
        user: { select: { id: true, email: true, name: true, lastName: true } },
      },
    },
    eligibleProducts: { include: { packagePlan: { select: { name: true } } } },
  } satisfies Prisma.CouponInclude;
}

function scalar(data: CouponScalarData) {
  return {
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
    totalUsageLimit: data.totalUsageLimit,
    usageLimitPerUser: data.usageLimitPerUser,
    eligibleAllUsers: data.eligibleAllUsers,
    eligibleAllProducts: data.eligibleAllProducts,
  };
}

function uniqueEmails(values: string[] | undefined): string[] {
  return [
    ...new Set(
      (values ?? []).map((email) => email.trim().toLowerCase()).filter(Boolean),
    ),
  ];
}

function uniqueCodeOrRethrow(error: unknown): Error {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    return new BadRequestException('Coupon code already exists');
  }
  return error instanceof Error
    ? error
    : new BadRequestException('Could not save coupon');
}
