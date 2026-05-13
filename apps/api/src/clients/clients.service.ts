import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.user.findMany({
      where: { role: Role.USER },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        memberships: {
          where: { status: MembershipStatus.ACTIVE },
          take: 1,
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async get(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      include: {
        memberships: { include: { plan: true } },
        bookings: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: { session: { include: { classType: true } } },
        },
        payments: { take: 50, orderBy: { createdAt: 'desc' } },
        giftCardsPurchased: { take: 20 },
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return rest;
  }

  async updateBasicInfo(id: string, dto: UpdateClientDto) {
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
      ...(dto.phone !== undefined && { phone: dto.phone }),
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
      action: 'CLIENT_UPDATED',
      entityType: 'User',
      entityId: id,
      payload: data,
    });
    return updated;
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
