import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  pickBalanceForCategory,
  type UserPackageWithPlanAndBalances,
} from './package-usage.helpers';

@Injectable()
export class PackageUsageLedgerService {
  private readonly logger = new Logger(PackageUsageLedgerService.name);

  async consumeSession(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
    membership: UserPackageWithPlanAndBalances;
    sessionClassType: { id: string; name: string };
    requiredSessions: number;
  }): Promise<void> {
    if (params.requiredSessions <= 0) {
      return;
    }
    this.logger.debug(
      `consumeSession bookingId=${params.bookingId} membershipId=${params.membership.id} requiredSessions=${params.requiredSessions}`,
    );
    const balance = pickBalanceForCategory(
      params.membership,
      params.sessionClassType,
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

  async consumeGuestSlot(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
    membership: UserPackageWithPlanAndBalances;
  }): Promise<void> {
    if (params.membership.guestSlotsRemaining <= 0) {
      throw new BadRequestException(
        'No guest passes remaining on this package',
      );
    }
    await params.tx.userPackage.update({
      where: { id: params.membership.id },
      data: { guestSlotsRemaining: { decrement: 1 } },
    });
    await params.tx.bookingConsumption.create({
      data: {
        bookingId: params.bookingId,
        userPackageId: params.membership.id,
        consumedSessions: 0,
        consumedGuestSlots: 1,
      },
    });
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
              consumedGuestSlots: number;
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
      if (consumption.consumedGuestSlots > 0) {
        await params.tx.userPackage.update({
          where: { id: consumption.userPackageId },
          data: {
            guestSlotsRemaining: { increment: consumption.consumedGuestSlots },
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
}
