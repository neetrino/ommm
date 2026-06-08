import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PackageStatus, Prisma, type UserPackage } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PackageUsageStats = {
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

type PackageWithPlan = UserPackage & {
  plan: { isUnlimited: boolean; sessionsPerMonth: number | null };
};

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

  async findUsablePackage(
    tx: Prisma.TransactionClient,
    userId: string,
    now: Date = new Date(),
  ): Promise<PackageWithPlan | null> {
    const packages = await tx.userPackage.findMany({
      where: {
        userId,
        status: PackageStatus.ACTIVE,
        currentPeriodEnd: { gt: now },
        currentPeriodStart: { lte: now },
      },
      include: {
        plan: { select: { isUnlimited: true, sessionsPerMonth: true } },
      },
      orderBy: { currentPeriodEnd: 'asc' },
    });
    for (const pkg of packages) {
      if (pkg.plan.isUnlimited) {
        return pkg;
      }
      if ((pkg.sessionsRemaining ?? 0) > 0) {
        return pkg;
      }
    }
    return null;
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
      throw new BadRequestException('No package sessions remaining');
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
