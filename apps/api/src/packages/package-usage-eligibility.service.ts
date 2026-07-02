import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  hasAnyBookableCredit,
  membershipCoversSessionType,
  toEligibleBookingPackage,
  type SessionShape,
  type UserPackageWithPlanAndBalances,
} from './package-usage.helpers';

@Injectable()
export class PackageUsageEligibilityService {
  constructor(private readonly prisma: PrismaService) {}

  async listEligibleUserPackages(params: {
    userId: string;
    session: SessionShape;
  }) {
    const memberships = await this.listCoveringUserPackages({
      userId: params.userId,
      session: params.session,
      includeDepleted: true,
    });
    return memberships.map((membership) =>
      toEligibleBookingPackage(membership, params.session.classType.name),
    );
  }

  async listCoveringUserPackages(params: {
    userId: string;
    session: SessionShape;
    includeDepleted?: boolean;
  }): Promise<UserPackageWithPlanAndBalances[]> {
    const now = new Date();
    const memberships = await (
      this.prisma as unknown as {
        userPackage: {
          findMany(args: unknown): Promise<UserPackageWithPlanAndBalances[]>;
        };
      }
    ).userPackage.findMany({
      where: {
        userId: params.userId,
        status: 'ACTIVE',
        currentPeriodStart: { lte: now },
        currentPeriodEnd: { gt: now },
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            categoryName: true,
            isUnlimited: true,
          },
        },
        balances: {
          select: {
            id: true,
            sourceCategoryNameSnapshot: true,
            sessionsTotal: true,
            sessionsUsed: true,
            sessionsRemaining: true,
            isUnlimited: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    const matching = memberships.filter((membership) =>
      membershipCoversSessionType(
        membership,
        params.session.classType.name,
      ),
    );
    if (params.includeDepleted === true) {
      return matching;
    }
    return matching.filter((membership) =>
      hasAnyBookableCredit(membership, params.session.classType.name),
    );
  }

  async assertCanBookWithoutPackageCredit(params: {
    userId: string;
    session: SessionShape;
  }): Promise<void> {
    const covering = await this.listCoveringUserPackages({
      userId: params.userId,
      session: params.session,
      includeDepleted: true,
    });
    if (covering.length === 0) {
      return;
    }
    const hasBookable = covering.some((membership) =>
      hasAnyBookableCredit(membership, params.session.classType.name),
    );
    if (!hasBookable) {
      throw new BadRequestException(
        'No remaining sessions in eligible packages',
      );
    }
  }

  async getValidatedUserPackageForBooking(params: {
    tx: Prisma.TransactionClient;
    userId: string;
    session: SessionShape;
    userPackageId?: string;
  }): Promise<UserPackageWithPlanAndBalances> {
    const memberships = await (
      params.tx as unknown as {
        userPackage: {
          findMany(args: unknown): Promise<UserPackageWithPlanAndBalances[]>;
        };
      }
    ).userPackage.findMany({
      where: {
        userId: params.userId,
        status: 'ACTIVE',
        currentPeriodStart: { lte: new Date() },
        currentPeriodEnd: { gt: new Date() },
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            categoryName: true,
            isUnlimited: true,
          },
        },
        balances: {
          select: {
            id: true,
            sourceCategoryNameSnapshot: true,
            sessionsTotal: true,
            sessionsUsed: true,
            sessionsRemaining: true,
            isUnlimited: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    const covering = memberships.filter((membership) =>
      membershipCoversSessionType(
        membership,
        params.session.classType.name,
      ),
    );
    const bookable = covering.filter((membership) =>
      hasAnyBookableCredit(membership, params.session.classType.name),
    );

    if (params.userPackageId !== undefined) {
      const explicit = bookable.find(
        (membership) => membership.id === params.userPackageId,
      );
      if (explicit === undefined) {
        throw new BadRequestException(
          'Selected package is not eligible for booking',
        );
      }
      return explicit;
    }

    if (bookable.length === 0) {
      throw new BadRequestException(
        'No eligible package found for this session',
      );
    }
    if (bookable.length > 1) {
      throw new BadRequestException(
        'Multiple eligible packages found. Select one package.',
      );
    }
    return bookable[0];
  }
}
