import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Role,
  UserPackageFreezeStatus,
  UserPackageStatus,
  type User,
} from '@prisma/client';
import { writeAuditLog } from '../audit/write-audit-log';
import { PrismaService } from '../prisma/prisma.service';

const PACKAGE_NOT_FOUND = 'Package not found';

type RemovablePackage = {
  id: string;
  status: UserPackageStatus;
  planNameSnapshot: string;
};

@Injectable()
export class ClientsPackagesRemoveService {
  constructor(private readonly prisma: PrismaService) {}

  async remove(actor: User, clientId: string, packageId: string) {
    await this.assertClientExists(clientId);
    const membership = await this.loadRemovablePackage(clientId, packageId);
    const removedAt = new Date();
    await this.applyRemoval(membership, actor, clientId, removedAt);
    return { id: membership.id, removedAt: removedAt.toISOString() };
  }

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.user.findFirst({
      where: { id: clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }
  }

  private async loadRemovablePackage(
    clientId: string,
    packageId: string,
  ): Promise<RemovablePackage> {
    const membership = await this.prisma.userPackage.findFirst({
      where: { id: packageId, userId: clientId, removedAt: null },
      select: { id: true, status: true, planNameSnapshot: true },
    });
    if (membership === null) {
      throw new NotFoundException(PACKAGE_NOT_FOUND);
    }
    return membership;
  }

  private async applyRemoval(
    membership: RemovablePackage,
    actor: User,
    clientId: string,
    removedAt: Date,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.userPackageFreeze.updateMany({
        where: {
          userPackageId: membership.id,
          status: UserPackageFreezeStatus.ACTIVE,
        },
        data: {
          status: UserPackageFreezeStatus.COMPLETED,
          endedAt: removedAt,
        },
      });
      await tx.userPackage.update({
        where: { id: membership.id },
        data: {
          status: UserPackageStatus.CANCELLED,
          removedAt,
          removedByUserId: actor.id,
          pausedAt: null,
          pausedUntil: null,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        actorRole: actor.role,
        action: 'CLIENT_PACKAGE_REMOVED',
        entityType: 'UserPackage',
        entityId: membership.id,
        payload: {
          clientId,
          previousStatus: membership.status,
          planName: membership.planNameSnapshot,
        },
      });
    });
  }
}
