import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Role, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { normalizeOptionalPhone } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async updateBasicInfo(actor: User, id: string, dto: UpdateClientDto) {
    if (dto.isBlocked !== undefined && actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can block or unblock clients');
    }
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const data = {
      ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.phone !== undefined && {
        phone: normalizeOptionalPhone(dto.phone ?? null),
      }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
      ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
    };
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_UPDATED',
      entityType: 'User',
      entityId: id,
      payload: data,
    });
    return updated;
  }

  async remove(actor: User, id: string): Promise<void> {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete clients');
    }
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('Client not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: { userId: id, status: BookingStatus.BOOKED },
    });
    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete a client with active bookings. Cancel bookings or block the client instead.',
      );
    }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This client account has linked records and cannot be deleted. Block the client instead.',
        );
      }
      throw error;
    }

    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_DELETED',
      entityType: 'User',
      entityId: id,
    });
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
    const note = await this.prisma.clientNote.create({
      data: {
        userId,
        authorId,
        body: body.trim(),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    await this.audit.log({
      actorId: authorId,
      actorRole: authorRole,
      action: 'CLIENT_NOTE_ADDED',
      entityType: 'ClientNote',
      entityId: note.id,
      payload: { userId },
    });
    return note;
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
