import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserPackageStatus, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminAdjustUserPackageSessionsDto } from './dto/admin-adjust-user-package-sessions.dto';
import { ADMIN_SESSION_ADJUST_ERROR } from './packages-admin-sessions.constants';
import {
  buildSessionAdjustmentNote,
  nextLimitedSessionCounts,
  resolveAdjustableBalance,
  type AdjustablePackageBalance,
} from './packages-admin-sessions.helpers';

type LoadedUserPackage = {
  id: string;
  userId: string;
  status: UserPackageStatus;
  planNameSnapshot: string;
  planIsUnlimitedSnapshot: boolean;
  sessionsTotal: number | null;
  sessionsRemaining: number | null;
  balances: AdjustablePackageBalance[];
  user: { id: string; role: Role };
};

@Injectable()
export class PackagesAdminSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async adjustSessions(
    actor: Pick<User, 'id' | 'role'>,
    userPackageId: string,
    dto: AdminAdjustUserPackageSessionsDto,
  ) {
    const existing = await this.loadAdjustablePackage(userPackageId);
    const balance = resolveAdjustableBalance(
      existing.balances,
      dto.userPackageBalanceId,
    );
    if (balance === null) {
      throw new BadRequestException(
        existing.balances.filter((row) => !row.isUnlimited).length > 1
          ? ADMIN_SESSION_ADJUST_ERROR.BALANCE_REQUIRED
          : ADMIN_SESSION_ADJUST_ERROR.BALANCE_INVALID,
      );
    }
    const applied = await this.applySessionCredit(
      actor,
      existing,
      balance,
      dto,
    );
    await this.recordSessionCredit(actor, existing, balance, dto, applied);
    return {
      id: existing.id,
      sessionsAdded: dto.sessions,
      sessionsRemaining: applied.packageCounts.sessionsRemaining,
      sessionsTotal: applied.packageCounts.sessionsTotal,
    };
  }

  private async loadAdjustablePackage(
    userPackageId: string,
  ): Promise<LoadedUserPackage> {
    const existing = await this.prisma.userPackage.findUnique({
      where: { id: userPackageId },
      include: {
        user: { select: { id: true, role: true } },
        balances: {
          select: {
            id: true,
            isUnlimited: true,
            sessionsTotal: true,
            sessionsRemaining: true,
            sourceCategoryNameSnapshot: true,
          },
        },
      },
    });
    if (existing === null || existing.user.role !== Role.USER) {
      throw new NotFoundException(ADMIN_SESSION_ADJUST_ERROR.NOT_FOUND);
    }
    this.assertPackageCanReceiveSessions(existing);
    return existing;
  }

  private assertPackageCanReceiveSessions(existing: LoadedUserPackage): void {
    if (existing.status === UserPackageStatus.CANCELLED) {
      throw new BadRequestException(ADMIN_SESSION_ADJUST_ERROR.CANCELLED);
    }
    if (existing.status === UserPackageStatus.PENDING) {
      throw new BadRequestException(ADMIN_SESSION_ADJUST_ERROR.PENDING);
    }
    if (existing.planIsUnlimitedSnapshot || existing.sessionsRemaining === null) {
      throw new BadRequestException(ADMIN_SESSION_ADJUST_ERROR.UNLIMITED);
    }
  }

  private async applySessionCredit(
    actor: Pick<User, 'id' | 'role'>,
    existing: LoadedUserPackage,
    balance: AdjustablePackageBalance,
    dto: AdminAdjustUserPackageSessionsDto,
  ) {
    const packageCounts = nextLimitedSessionCounts({
      sessionsTotal: existing.sessionsTotal,
      sessionsRemaining: existing.sessionsRemaining,
      add: dto.sessions,
    });
    const balanceCounts = nextLimitedSessionCounts({
      sessionsTotal: balance.sessionsTotal,
      sessionsRemaining: balance.sessionsRemaining,
      add: dto.sessions,
    });
    await this.prisma.$transaction(async (tx) => {
      await tx.userPackageBalance.update({
        where: { id: balance.id },
        data: balanceCounts,
      });
      await tx.userPackage.update({
        where: { id: existing.id },
        data: packageCounts,
      });
      await tx.clientNote.create({
        data: {
          userId: existing.userId,
          authorId: actor.id,
          body: buildSessionAdjustmentNote({
            sessions: dto.sessions,
            packageName: existing.planNameSnapshot,
            classTypeName: balance.sourceCategoryNameSnapshot,
            reason: dto.reason,
          }),
        },
      });
    });
    return { packageCounts };
  }

  private async recordSessionCredit(
    actor: Pick<User, 'id' | 'role'>,
    existing: LoadedUserPackage,
    balance: AdjustablePackageBalance,
    dto: AdminAdjustUserPackageSessionsDto,
    applied: {
      packageCounts: { sessionsTotal: number; sessionsRemaining: number };
    },
  ): Promise<void> {
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_PACKAGE_SESSIONS_ADDED',
      entityType: 'UserPackage',
      entityId: existing.id,
      payload: {
        userId: existing.userId,
        sessionsAdded: dto.sessions,
        userPackageBalanceId: balance.id,
        reason: dto.reason,
        remainingAfter: applied.packageCounts.sessionsRemaining,
        totalAfter: applied.packageCounts.sessionsTotal,
      },
    });
  }
}
