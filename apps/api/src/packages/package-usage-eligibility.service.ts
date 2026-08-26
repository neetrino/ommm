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
import { resumeDueFreezes } from './packages-freeze.resume';

const USER_PACKAGE_BALANCE_SELECT = {
  id: true,
  classTypeId: true,
  sourceCategoryNameSnapshot: true,
  sessionsTotal: true,
  sessionsUsed: true,
  sessionsRemaining: true,
  isUnlimited: true,
} as const;

const USER_PACKAGE_PLAN_SELECT = {
  id: true,
  name: true,
  categoryName: true,
  isUnlimited: true,
} as const;

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
      toEligibleBookingPackage(membership, params.session.classType),
    );
  }

  async listCoveringUserPackages(params: {
    userId: string;
    session: SessionShape;
    includeDepleted?: boolean;
  }): Promise<UserPackageWithPlanAndBalances[]> {
    const memberships = await this.findActiveMembershipsForSession(
      this.prisma,
      params.userId,
      params.session.startsAt,
    );
    const matching = memberships.filter((membership) =>
      membershipCoversSessionType(membership, params.session.classType),
    );
    if (params.includeDepleted === true) {
      return matching;
    }
    return matching.filter((membership) =>
      hasAnyBookableCredit(membership, params.session.classType),
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
      hasAnyBookableCredit(membership, params.session.classType),
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
    const memberships = await this.findActiveMembershipsForSession(
      params.tx,
      params.userId,
      params.session.startsAt,
    );
    const covering = memberships.filter((membership) =>
      membershipCoversSessionType(membership, params.session.classType),
    );
    const bookable = covering.filter((membership) =>
      hasAnyBookableCredit(membership, params.session.classType),
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

  private async findActiveMembershipsForSession(
    client: PrismaService | Prisma.TransactionClient,
    userId: string,
    sessionStartsAt: Date,
  ): Promise<UserPackageWithPlanAndBalances[]> {
    await resumeDueFreezes(client, { userId });
    return (
      client as unknown as {
        userPackage: {
          findMany(args: unknown): Promise<UserPackageWithPlanAndBalances[]>;
        };
      }
    ).userPackage.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          { awaitingFirstVisit: true },
          {
            currentPeriodStart: { lte: sessionStartsAt },
            currentPeriodEnd: { gt: sessionStartsAt },
          },
        ],
      },
      include: {
        plan: { select: USER_PACKAGE_PLAN_SELECT },
        balances: { select: USER_PACKAGE_BALANCE_SELECT },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
