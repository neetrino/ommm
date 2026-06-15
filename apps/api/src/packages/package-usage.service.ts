import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PackageStatus, Prisma, type UserPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  isPlanEligibleForClassType,
  type PackageClassTypeRef,
} from './package-eligibility.util';

export type PackageUsageStats = {
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

type PackagePlanUsageRef = {
  id: string;
  name: string;
  planType: 'SINGLE' | 'COMBINED';
  categoryName: string;
  allowedCategoryNames: string[];
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

type PackageWithPlan = UserPackage & {
  plan: PackagePlanUsageRef;
};

const PACKAGE_PLAN_SELECT = {
  id: true,
  name: true,
  planType: true,
  categoryName: true,
  allowedCategoryNames: true,
  isUnlimited: true,
  sessionsPerMonth: true,
} satisfies Prisma.PackagePlanSelect;

@Injectable()
export class PackageUsageService {
  constructor(private readonly prisma: PrismaService) {}

  computeUsageStats(
    membership: Pick<UserPackage, 'sessionsTotal' | 'sessionsRemaining'> & {
      plan: { isUnlimited: boolean; sessionsPerMonth: number | null };
    },
  ): PackageUsageStats {
    if (membership.plan.isUnlimited) {
      return {
        totalSessions: null,
        usedSessions: null,
        remainingSessions: null,
        isUnlimited: true,
      };
    }
    const total =
      membership.sessionsTotal ?? membership.plan.sessionsPerMonth ?? 0;
    const remaining = membership.sessionsRemaining ?? 0;
    const used = Math.max(0, Math.min(total, total - remaining));
    return {
      totalSessions: total,
      usedSessions: used,
      remainingSessions: remaining,
      isUnlimited: false,
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

  async listEligibleUserPackages(
    tx: Prisma.TransactionClient,
    userId: string,
    classType: PackageClassTypeRef,
    now: Date = new Date(),
  ): Promise<PackageWithPlan[]> {
    const packages = await this.listActiveUserPackages(tx, userId, now);
    return packages.filter((pkg) => this.isUserPackageBookable(pkg, classType));
  }

  /** Active packages whose plan covers the class type (including zero remaining). */
  async listCoveringUserPackages(
    tx: Prisma.TransactionClient,
    userId: string,
    classType: PackageClassTypeRef,
    now: Date = new Date(),
  ): Promise<PackageWithPlan[]> {
    const packages = await this.listActiveUserPackages(tx, userId, now);
    return packages.filter((pkg) =>
      isPlanEligibleForClassType(pkg.plan, classType),
    );
  }

  /** Blocks complimentary bookings when the member only has depleted covering packages. */
  async assertCanBookWithoutPackageCredit(
    tx: Prisma.TransactionClient,
    userId: string,
    classType: PackageClassTypeRef,
    now: Date = new Date(),
  ): Promise<void> {
    const covering = await this.listCoveringUserPackages(
      tx,
      userId,
      classType,
      now,
    );
    if (covering.length === 0) {
      return;
    }
    const hasBookable = covering.some((pkg) =>
      this.isUserPackageBookable(pkg, classType),
    );
    if (!hasBookable) {
      throw new BadRequestException('This package has no remaining visits.');
    }
  }

  private async listActiveUserPackages(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date,
  ): Promise<PackageWithPlan[]> {
    return tx.userPackage.findMany({
      where: {
        userId,
        status: PackageStatus.ACTIVE,
        currentPeriodEnd: { gt: now },
        currentPeriodStart: { lte: now },
      },
      include: { plan: { select: PACKAGE_PLAN_SELECT } },
      orderBy: { currentPeriodEnd: 'asc' },
    });
  }

  private isUserPackageBookable(
    pkg: PackageWithPlan,
    classType: PackageClassTypeRef,
  ): boolean {
    if (!isPlanEligibleForClassType(pkg.plan, classType)) {
      return false;
    }
    if (pkg.plan.isUnlimited) {
      return true;
    }
    return (pkg.sessionsRemaining ?? 0) > 0;
  }

  async findUsablePackage(
    tx: Prisma.TransactionClient,
    userId: string,
    classType: PackageClassTypeRef,
    now: Date = new Date(),
  ): Promise<PackageWithPlan | null> {
    const eligible = await this.listEligibleUserPackages(
      tx,
      userId,
      classType,
      now,
    );
    return eligible[0] ?? null;
  }

  async getValidatedUserPackageForBooking(
    tx: Prisma.TransactionClient,
    userId: string,
    userPackageId: string,
    classType: PackageClassTypeRef,
    now: Date = new Date(),
  ): Promise<PackageWithPlan> {
    const pkg = await tx.userPackage.findFirst({
      where: { id: userPackageId, userId },
      include: { plan: { select: PACKAGE_PLAN_SELECT } },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new BadRequestException('This package is not active');
    }
    if (pkg.currentPeriodEnd <= now) {
      throw new BadRequestException('This package has expired.');
    }
    if (pkg.currentPeriodStart > now) {
      throw new BadRequestException('This package is not active');
    }
    if (!isPlanEligibleForClassType(pkg.plan, classType)) {
      throw new BadRequestException(
        'This package cannot be used for the selected class.',
      );
    }
    if (!pkg.plan.isUnlimited && (pkg.sessionsRemaining ?? 0) <= 0) {
      throw new BadRequestException('This package has no remaining visits.');
    }
    return pkg;
  }

  async consumeSession(
    tx: Prisma.TransactionClient,
    userPackageId: string,
  ): Promise<void> {
    const pkg = await tx.userPackage.findUnique({
      where: { id: userPackageId },
      include: { plan: { select: { isUnlimited: true } } },
    });
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }
    if (pkg.status !== PackageStatus.ACTIVE) {
      throw new BadRequestException('Package is not active');
    }
    if (pkg.plan.isUnlimited) {
      return;
    }
    const updated = await tx.userPackage.updateMany({
      where: {
        id: userPackageId,
        status: PackageStatus.ACTIVE,
        sessionsRemaining: { gt: 0 },
      },
      data: { sessionsRemaining: { decrement: 1 } },
    });
    if (updated.count === 0) {
      throw new BadRequestException('This package has no remaining visits.');
    }
  }

  async restoreSession(
    tx: Prisma.TransactionClient,
    userPackageId: string,
  ): Promise<void> {
    const pkg = await tx.userPackage.findUnique({
      where: { id: userPackageId },
      include: { plan: { select: { isUnlimited: true } } },
    });
    if (!pkg) {
      return;
    }
    if (pkg.plan.isUnlimited) {
      return;
    }
    const total = pkg.sessionsTotal ?? pkg.sessionsRemaining ?? 0;
    const remaining = pkg.sessionsRemaining ?? 0;
    if (remaining >= total) {
      return;
    }
    await tx.userPackage.update({
      where: { id: userPackageId },
      data: { sessionsRemaining: { increment: 1 } },
    });
  }

  async syncExpiredMemberships(userId?: string): Promise<void> {
    await this.prisma.userPackage.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        status: PackageStatus.ACTIVE,
        currentPeriodEnd: { lte: new Date() },
      },
      data: { status: PackageStatus.EXPIRED },
    });
  }
}
