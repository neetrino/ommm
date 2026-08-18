import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { resumeDueFreezes } from './packages-freeze.resume';

@Injectable()
export class PackageUsageMaintenanceService {
  private readonly logger = new Logger(PackageUsageMaintenanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async syncExpiredMemberships(userId?: string): Promise<void> {
    const now = new Date();
    await resumeDueFreezes(this.prisma, { userId, now });
    await this.prisma.userPackage.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        status: 'ACTIVE',
        currentPeriodEnd: { lte: now },
      },
      data: { status: 'EXPIRED' },
    });
  }

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
}
