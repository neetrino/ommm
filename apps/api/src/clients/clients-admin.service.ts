import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, type User } from '@prisma/client';
import { writeAuditLog } from '../audit/write-audit-log';
import { BACKOFFICE_WRITE_ROLES } from '../common/backoffice-roles';
import { roleAllows } from '../common/manager-permission.matrix';
import { normalizeOptionalPhone } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import { archiveUser, restoreArchivedUser } from '../users/archive-user';
import type { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async updateBasicInfo(actor: User, id: string, dto: UpdateClientDto) {
    if (
      dto.isBlocked !== undefined &&
      !roleAllows(BACKOFFICE_WRITE_ROLES, actor.role)
    ) {
      throw new ForbiddenException(
        'Only admins and managers can block or unblock clients',
      );
    }
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true, deletedAt: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    if (dto.isBlocked === false && user.deletedAt !== null) {
      throw new BadRequestException(
        'Restore the archived client before activating them',
      );
    }
    const data = {
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && {
        phone: normalizeOptionalPhone(dto.phone ?? null),
      }),
      ...(dto.whatsappPhone !== undefined && {
        whatsappPhone: normalizeOptionalPhone(dto.whatsappPhone ?? null),
      }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
      ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
      ...(dto.doNotCall !== undefined && { doNotCall: dto.doNotCall }),
    };
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          phone: true,
          whatsappPhone: true,
          doNotCall: true,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        actorRole: actor.role,
        action: 'CLIENT_UPDATED',
        entityType: 'User',
        entityId: id,
        payload: data,
      });
      return row;
    });
    return updated;
  }

  async remove(actor: User, id: string): Promise<void> {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can archive clients');
    }
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Client not found');
    }
    await this.prisma.$transaction((tx) =>
      archiveUser(tx, {
        userId: id,
        actorId: actor.id,
        actorRole: actor.role,
        action: 'CLIENT_ARCHIVED',
      }),
    );
  }

  async restore(actor: User, id: string): Promise<void> {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can restore clients');
    }
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Client not found');
    }
    await this.prisma.$transaction((tx) =>
      restoreArchivedUser(tx, {
        userId: id,
        actorId: actor.id,
        actorRole: actor.role,
      }),
    );
  }

  async listNotes(userId: string) {
    await this.assertUserExists(userId);
    return this.prisma.clientNote.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      take: 200,
    });
  }

  async addNote(
    authorId: string,
    authorRole: Role,
    userId: string,
    body: string,
  ) {
    await this.assertUserExists(userId);
    return this.prisma.$transaction(async (tx) => {
      const note = await tx.clientNote.create({
        data: {
          userId,
          authorId,
          body: body.trim(),
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
      await writeAuditLog(tx, {
        actorId: authorId,
        actorRole: authorRole,
        action: 'CLIENT_NOTE_ADDED',
        entityType: 'ClientNote',
        entityId: note.id,
        payload: { userId },
      });
      return note;
    });
  }

  private async assertUserExists(id: string) {
    const exists = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException();
    }
  }
}
