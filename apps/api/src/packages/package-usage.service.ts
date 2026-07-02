import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { type Prisma, type UserPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  resolveUserPackagePlanCategoryName,
  resolveUserPackagePlanIsUnlimited,
  type UserPackagePlanSnapshotFields,
} from './user-package-plan-snapshot.util';

export type PackageUsageStats = {
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

export type EligibleBookingPackage = {
  userPackageId: string;
  planId: string;
  planName: string;
  remainingSessions: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  isUnlimited: boolean;
  canBook: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  includedCategories: string[];
};

type SessionShape = {
  id: string;
  classType: {
    id: string;
    name: string;
  };
};

type UserPackageWithPlanAndBalances = UserPackage &
  UserPackagePlanSnapshotFields & {
    plan: {
      id: string;
      name: string;
      categoryName: string;
      isUnlimited: boolean;
    } | null;
    balances: Array<{
      id: string;
      sourceCategoryNameSnapshot: string;
      sessionsTotal: number | null;
      sessionsUsed: number;
      sessionsRemaining: number | null;
      isUnlimited: boolean;
    }>;
  };

@Injectable()
export class PackageUsageService {
  private readonly logger = new Logger(PackageUsageService.name);

  constructor(private readonly prisma: PrismaService) {}

  computeUsageStats(membership: {
    sessionsTotal: number | null;
    sessionsRemaining: number | null;
    plan: { isUnlimited: boolean } | null;
    planIsUnlimitedSnapshot: boolean;
  }): PackageUsageStats {
    const totalSessions = membership.sessionsTotal;
    const remainingSessions = membership.sessionsRemaining;
    const isUnlimited = resolveUserPackagePlanIsUnlimited(membership);
    const usedSessions =
      totalSessions === null || remainingSessions === null
        ? null
        : Math.max(totalSessions - remainingSessions, 0);
    return {
      totalSessions,
      usedSessions,
      remainingSessions,
      isUnlimited,
    };
  }

  resolveInitialSessions(plan: {
    isUnlimited: boolean;
    sessionsPerMonth: number | null;
  }): { sessionsTotal: number | null; sessionsRemaining: number | null } {
    if (plan.isUnlimited) {
      return { sessionsTotal: null, sessionsRemaining: null };
    }
    const total = plan.sessionsPerMonth ?? 0;
    return { sessionsTotal: total, sessionsRemaining: total };
  }

  async listEligibleUserPackages(params: {
    userId: string;
    session: SessionShape;
  }): Promise<EligibleBookingPackage[]> {
    const memberships = await this.listCoveringUserPackages({
      userId: params.userId,
      session: params.session,
      includeDepleted: true,
    });
    return memberships.map((membership) =>
      this.toEligibleBookingPackage(membership, params.session.classType.name),
    );
  }

  /** Active packages whose plan covers the class type (including zero remaining). */
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
      this.membershipCoversSessionType(
        membership,
        params.session.classType.name,
      ),
    );
    if (params.includeDepleted === true) {
      return matching;
    }
    return matching.filter((membership) =>
      this.hasAnyBookableCredit(membership, params.session.classType.name),
    );
  }

  /** Blocks complimentary bookings when the member only has depleted covering packages. */
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
      this.hasAnyBookableCredit(membership, params.session.classType.name),
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
      this.membershipCoversSessionType(
        membership,
        params.session.classType.name,
      ),
    );
    const bookable = covering.filter((membership) =>
      this.hasAnyBookableCredit(membership, params.session.classType.name),
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

  async consumeSession(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
    membership: UserPackageWithPlanAndBalances;
    sessionCategoryName: string;
    requiredSessions: number;
  }): Promise<void> {
    if (params.requiredSessions <= 0) {
      return;
    }
    this.logger.debug(
      `consumeSession bookingId=${params.bookingId} membershipId=${params.membership.id} requiredSessions=${params.requiredSessions}`,
    );
    const balance = this.pickBalanceForCategory(
      params.membership,
      params.sessionCategoryName,
    );
    if (balance === null) {
      throw new BadRequestException(
        'No matching package balance for this session',
      );
    }
    if (balance.isUnlimited || balance.sessionsRemaining === null) {
      await (
        params.tx as unknown as {
          bookingConsumption: {
            create(args: unknown): Promise<unknown>;
          };
        }
      ).bookingConsumption.create({
        data: {
          bookingId: params.bookingId,
          userPackageId: params.membership.id,
          userPackageBalanceId: balance.id,
          consumedSessions: 0,
        },
      });
      return;
    }
    if (balance.sessionsRemaining < params.requiredSessions) {
      this.logger.warn(
        `consumeSession insufficient balance bookingId=${params.bookingId} membershipId=${params.membership.id} remaining=${balance.sessionsRemaining} required=${params.requiredSessions}`,
      );
      throw new BadRequestException(
        'Selected package has no remaining sessions',
      );
    }
    await (
      params.tx as unknown as {
        userPackageBalance: {
          update(args: unknown): Promise<unknown>;
        };
      }
    ).userPackageBalance.update({
      where: { id: balance.id },
      data: {
        sessionsUsed: { increment: params.requiredSessions },
        sessionsRemaining: { decrement: params.requiredSessions },
      },
    });
    await (
      params.tx as unknown as {
        userPackage: {
          update(args: unknown): Promise<unknown>;
        };
      }
    ).userPackage.update({
      where: { id: params.membership.id },
      data: { sessionsRemaining: { decrement: params.requiredSessions } },
    });
    await (
      params.tx as unknown as {
        bookingConsumption: {
          create(args: unknown): Promise<unknown>;
        };
      }
    ).bookingConsumption.create({
      data: {
        bookingId: params.bookingId,
        userPackageId: params.membership.id,
        userPackageBalanceId: balance.id,
        consumedSessions: params.requiredSessions,
      },
    });
    this.logger.log(
      `consumeSession applied bookingId=${params.bookingId} membershipId=${params.membership.id} consumed=${params.requiredSessions}`,
    );
  }

  async restoreSession(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
  }): Promise<void> {
    const consumptions = await (
      params.tx as unknown as {
        bookingConsumption: {
          findMany(args: unknown): Promise<
            Array<{
              id: string;
              userPackageId: string;
              userPackageBalanceId: string | null;
              consumedSessions: number;
            }>
          >;
          update(args: unknown): Promise<unknown>;
        };
      }
    ).bookingConsumption.findMany({
      where: { bookingId: params.bookingId, restoredAt: null },
      orderBy: { createdAt: 'asc' },
    });
    this.logger.debug(
      `restoreSession bookingId=${params.bookingId} pendingConsumptions=${consumptions.length}`,
    );
    for (const consumption of consumptions) {
      if (
        consumption.consumedSessions > 0 &&
        consumption.userPackageBalanceId
      ) {
        await (
          params.tx as unknown as {
            userPackageBalance: {
              update(args: unknown): Promise<unknown>;
            };
          }
        ).userPackageBalance.update({
          where: { id: consumption.userPackageBalanceId },
          data: {
            sessionsUsed: { decrement: consumption.consumedSessions },
            sessionsRemaining: { increment: consumption.consumedSessions },
          },
        });
        await (
          params.tx as unknown as {
            userPackage: {
              update(args: unknown): Promise<unknown>;
            };
          }
        ).userPackage.update({
          where: { id: consumption.userPackageId },
          data: {
            sessionsRemaining: { increment: consumption.consumedSessions },
          },
        });
      }
      await (
        params.tx as unknown as {
          bookingConsumption: {
            update(args: unknown): Promise<unknown>;
          };
        }
      ).bookingConsumption.update({
        where: { id: consumption.id },
        data: { restoredAt: new Date() },
      });
    }
    this.logger.log(
      `restoreSession completed bookingId=${params.bookingId} restoredConsumptions=${consumptions.length}`,
    );
  }

  async syncExpiredMemberships(userId?: string): Promise<void> {
    const now = new Date();
    await this.prisma.userPackage.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        status: 'ACTIVE',
        currentPeriodEnd: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });
  }

  /**
   * Keeps `sessionsRemaining` aligned with active BOOKED rows per package.
   * Heals drift when consume/restore and booking state diverge.
   */
  async reconcileSessionsRemaining(userId?: string): Promise<void> {
    const memberships = await (
      this.prisma as unknown as {
        userPackage: {
          findMany(args: unknown): Promise<
            Array<{
              id: string;
              balances: Array<{
                sessionsRemaining: number | null;
                isUnlimited: boolean;
              }>;
            }>
          >;
          update(args: unknown): Promise<unknown>;
        };
      }
    ).userPackage.findMany({
      where: {
        ...(userId ? { userId } : {}),
        status: 'ACTIVE',
      },
      include: {
        balances: {
          select: {
            sessionsRemaining: true,
            isUnlimited: true,
          },
        },
      },
    });
    this.logger.log(
      `reconcileSessionsRemaining started memberships=${memberships.length}${userId ? ` userId=${userId}` : ''}`,
    );
    for (const membership of memberships) {
      const hasUnlimited = membership.balances.some(
        (balance) => balance.isUnlimited,
      );
      if (hasUnlimited) {
        await (
          this.prisma as unknown as {
            userPackage: {
              update(args: unknown): Promise<unknown>;
            };
          }
        ).userPackage.update({
          where: { id: membership.id },
          data: { sessionsRemaining: null },
        });
        continue;
      }
      const nextRemaining = membership.balances.reduce((sum, balance) => {
        return sum + (balance.sessionsRemaining ?? 0);
      }, 0);
      await (
        this.prisma as unknown as {
          userPackage: {
            update(args: unknown): Promise<unknown>;
          };
        }
      ).userPackage.update({
        where: { id: membership.id },
        data: { sessionsRemaining: nextRemaining },
      });
    }
    this.logger.log(
      `reconcileSessionsRemaining finished memberships=${memberships.length}${userId ? ` userId=${userId}` : ''}`,
    );
  }

  private toEligibleBookingPackage(
    membership: UserPackageWithPlanAndBalances,
    classTypeName: string,
  ): EligibleBookingPackage {
    const usage = this.computeUsageStats(membership);
    const includedCategories = Array.from(
      new Set(
        membership.balances
          .map((balance) => balance.sourceCategoryNameSnapshot.trim())
          .filter((value) => value.length > 0),
      ),
    );
    return {
      userPackageId: membership.id,
      planId: membership.plan?.id ?? membership.sourcePlanIdSnapshot,
      planName: membership.plan?.name ?? membership.planNameSnapshot,
      remainingSessions: usage.remainingSessions,
      totalSessions: usage.totalSessions,
      usedSessions: usage.usedSessions,
      isUnlimited: usage.isUnlimited,
      canBook: this.hasAnyBookableCredit(membership, classTypeName),
      currentPeriodStart: membership.currentPeriodStart.toISOString(),
      currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
      includedCategories,
    };
  }

  private membershipCoversSessionType(
    membership: UserPackageWithPlanAndBalances,
    classTypeName: string,
  ): boolean {
    const normalized = classTypeName.trim().toLowerCase();
    if (normalized.length === 0) {
      return false;
    }
    if (membership.balances.length > 1) {
      return membership.balances.some(
        (balance) =>
          balance.sourceCategoryNameSnapshot.trim().toLowerCase() ===
          normalized,
      );
    }
    const categoryName = resolveUserPackagePlanCategoryName({
      plan: membership.plan,
      planCategoryNameSnapshot: membership.planCategoryNameSnapshot,
      balances: membership.balances,
    });
    return categoryName.trim().toLowerCase() === normalized;
  }

  private hasAnyBookableCredit(
    membership: UserPackageWithPlanAndBalances,
    classTypeName: string,
  ): boolean {
    const balance = this.pickBalanceForCategory(membership, classTypeName);
    if (balance === null) {
      return false;
    }
    if (balance.isUnlimited || balance.sessionsRemaining === null) {
      return true;
    }
    return balance.sessionsRemaining > 0;
  }

  private pickBalanceForCategory(
    membership: UserPackageWithPlanAndBalances,
    classTypeName: string,
  ) {
    const normalized = classTypeName.trim().toLowerCase();
    const exact = membership.balances.find(
      (balance) =>
        balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
    );
    if (exact !== undefined) {
      return exact;
    }
    if (membership.balances.length > 1) {
      return null;
    }
    return membership.balances[0] ?? null;
  }
}
