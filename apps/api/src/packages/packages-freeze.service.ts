import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role, UserPackageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  FREEZE_ERROR,
  MIN_FREEZE_DAYS_PER_REQUEST,
} from './packages-freeze.constants';
import {
  addDaysUtc,
  canStartFreeze,
  isEnabledFreezePolicy,
  resolveFreezeCounters,
  resolveFreezePolicy,
} from './packages-freeze.helpers';
import { toUserPackageFreezeApi } from './packages-freeze.mapper';
import { applyFreezeResume, resumeDueFreezes } from './packages-freeze.resume';
import {
  USER_PACKAGE_FREEZE_INITIATOR,
  USER_PACKAGE_FREEZE_STATUS,
  asFreezeDb,
  type FreezeDb,
  type LoadedUserPackage,
  type UserPackageFreezeInitiator,
} from './packages-freeze.types';

type FreezeActor = {
  userId: string;
  initiator: UserPackageFreezeInitiator;
};

@Injectable()
export class PackagesFreezeService {
  private readonly db: FreezeDb;

  constructor(prisma: PrismaService) {
    this.db = asFreezeDb(prisma);
  }

  resumeDueFreezes(userId?: string) {
    return resumeDueFreezes(this.db, { userId });
  }

  async freezeForUser(userId: string, userPackageId: string, days: number) {
    const userPackage = await this.loadOwnedPackage(userId, userPackageId);
    return this.freezePackage(userPackage, days, {
      userId,
      initiator: USER_PACKAGE_FREEZE_INITIATOR.USER,
    });
  }

  async freezeForAdmin(adminId: string, userPackageId: string, days: number) {
    const userPackage = await this.loadAdminPackage(userPackageId);
    return this.freezePackage(userPackage, days, {
      userId: adminId,
      initiator: USER_PACKAGE_FREEZE_INITIATOR.ADMIN,
    });
  }

  async unfreezeForUser(userId: string, userPackageId: string) {
    const userPackage = await this.loadOwnedPackage(userId, userPackageId);
    return this.unfreezePackage(userPackage);
  }

  async unfreezeForAdmin(userPackageId: string) {
    const userPackage = await this.loadAdminPackage(userPackageId);
    return this.unfreezePackage(userPackage);
  }

  private async freezePackage(
    userPackage: LoadedUserPackage,
    days: number,
    actor: FreezeActor,
  ) {
    await resumeDueFreezes(this.db, { userId: userPackage.userId });
    const fresh = await this.reloadPackage(userPackage.id);
    this.assertCanFreeze(fresh, days);
    await this.assertNoUpcomingBookings(fresh);
    const now = new Date();
    const pausedUntil = addDaysUtc(now, days);
    const policy = resolveFreezePolicy(fresh, fresh.plan);

    const updated = await this.db.$transaction(async (tx) => {
      await tx.userPackageFreeze.create({
        data: {
          userPackageId: fresh.id,
          daysRequested: days,
          startedAt: now,
          scheduledEndAt: pausedUntil,
          initiatedBy: actor.initiator,
          initiatedByUserId: actor.userId,
          status: USER_PACKAGE_FREEZE_STATUS.ACTIVE,
        },
      });
      return tx.userPackage.update({
        where: { id: fresh.id },
        data: {
          status: UserPackageStatus.PAUSED,
          pausedAt: now,
          pausedUntil,
          freezesUsedCount: { increment: 1 },
          freezeAllowedCountSnapshot: policy.allowedCount,
          freezeMaxDaysPerUseSnapshot: policy.maxDaysPerUse,
        },
        include: { plan: true },
      });
    });

    return this.toMutationResponse(updated);
  }

  private async unfreezePackage(userPackage: LoadedUserPackage) {
    await resumeDueFreezes(this.db, { userId: userPackage.userId });
    const fresh = await this.reloadPackage(userPackage.id);
    if (fresh.status !== UserPackageStatus.PAUSED) {
      if (fresh.status === UserPackageStatus.ACTIVE) {
        return this.toMutationResponse(fresh);
      }
      throw new BadRequestException(FREEZE_ERROR.NOT_FROZEN);
    }

    const activeFreeze = await this.db.userPackageFreeze.findFirst({
      where: {
        userPackageId: fresh.id,
        status: USER_PACKAGE_FREEZE_STATUS.ACTIVE,
      },
      orderBy: { startedAt: 'desc' },
    });
    await applyFreezeResume(
      this.db,
      { ...fresh, freezes: activeFreeze === null ? [] : [activeFreeze] },
      new Date(),
    );
    const updated = await this.reloadPackage(fresh.id);
    return this.toMutationResponse(updated);
  }

  private assertCanFreeze(userPackage: LoadedUserPackage, days: number): void {
    if (userPackage.status === UserPackageStatus.PAUSED) {
      throw new BadRequestException(FREEZE_ERROR.ALREADY_FROZEN);
    }
    if (userPackage.status !== UserPackageStatus.ACTIVE) {
      throw new BadRequestException(FREEZE_ERROR.NOT_ACTIVE);
    }
    const policy = resolveFreezePolicy(userPackage, userPackage.plan);
    if (!isEnabledFreezePolicy(policy)) {
      throw new BadRequestException(FREEZE_ERROR.NOT_ALLOWED);
    }
    const { remainingCount } = resolveFreezeCounters(
      userPackage.freezesUsedCount,
      policy,
    );
    if (
      !canStartFreeze({
        status: userPackage.status,
        remainingCount,
        policy,
      })
    ) {
      throw new BadRequestException(FREEZE_ERROR.NO_REMAINING);
    }
    if (days < MIN_FREEZE_DAYS_PER_REQUEST || days > policy.maxDaysPerUse) {
      throw new BadRequestException(FREEZE_ERROR.INVALID_DAYS);
    }
  }

  private async assertNoUpcomingBookings(
    userPackage: LoadedUserPackage,
  ): Promise<void> {
    const upcoming = await this.db.booking.findFirst({
      where: {
        userId: userPackage.userId,
        status: BookingStatus.BOOKED,
        session: { startsAt: { gt: new Date() } },
        consumptions: {
          some: {
            userPackageId: userPackage.id,
            restoredAt: null,
          },
        },
      },
      select: { id: true },
    });
    if (upcoming !== null) {
      throw new BadRequestException(FREEZE_ERROR.UPCOMING_BOOKINGS);
    }
  }

  private async loadOwnedPackage(userId: string, userPackageId: string) {
    const userPackage = await this.db.userPackage.findFirst({
      where: { id: userPackageId, userId },
      include: { plan: true, user: { select: { id: true, role: true } } },
    });
    if (userPackage === null) {
      throw new NotFoundException(FREEZE_ERROR.NOT_FOUND);
    }
    return userPackage;
  }

  private async loadAdminPackage(userPackageId: string) {
    const userPackage = await this.db.userPackage.findUnique({
      where: { id: userPackageId },
      include: { plan: true, user: { select: { id: true, role: true } } },
    });
    if (userPackage === null || userPackage.user.role !== Role.USER) {
      throw new NotFoundException(FREEZE_ERROR.NOT_FOUND);
    }
    return userPackage;
  }

  private async reloadPackage(userPackageId: string) {
    return this.loadAdminPackage(userPackageId);
  }

  private toMutationResponse(userPackage: LoadedUserPackage) {
    return {
      id: userPackage.id,
      status: userPackage.status,
      currentPeriodStart: userPackage.currentPeriodStart.toISOString(),
      currentPeriodEnd: userPackage.currentPeriodEnd.toISOString(),
      freeze: toUserPackageFreezeApi(userPackage, userPackage.plan),
    };
  }
}
