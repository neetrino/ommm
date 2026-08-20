import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  normalizeOptionalPhone,
  normalizeRequiredPhone,
} from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateManagerDto } from './dto/create-manager.dto';
import type { UpdateManagerDto } from './dto/update-manager.dto';
import { managerListSelect, toManagerDirectoryRow } from './managers.mapper';
import { ManagersInviteService } from './managers-invite.service';
import type { ManagerUserRecord } from './managers.types';

@Injectable()
export class ManagersWriteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly invite: ManagersInviteService,
  ) {}

  async create(actor: User, dto: CreateManagerDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = normalizeRequiredPhone(dto.phone);
    await this.assertEmailAndPhoneAvailable(email, phone);

    const created = await this.prisma.user.create({
      data: {
        email,
        passwordHash: null,
        name: dto.name.trim(),
        lastName: dto.lastName.trim(),
        phone,
        role: Role.MANAGER,
        emailVerified: new Date(),
      },
      select: { ...managerListSelect, locale: true },
    });

    const invite = await this.invite.issueAndSend({
      id: created.id,
      email: created.email,
      name: created.name,
      lastName: created.lastName,
      locale: created.locale,
    });

    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'MANAGER_CREATED',
      entityType: 'User',
      entityId: created.id,
      payload: { email, phone, welcomeEmailSent: invite.welcomeEmailSent },
    });

    return {
      manager: toManagerDirectoryRow(created, actor.id),
      invite,
    };
  }

  async update(actor: User, id: string, dto: UpdateManagerDto) {
    const existing = await this.requireManager(id);
    this.assertNotSelfStatusChange(actor.id, existing.id, dto.isBlocked);
    const data = await this.buildUpdateData(id, dto);
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: managerListSelect,
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'MANAGER_UPDATED',
      entityType: 'User',
      entityId: id,
      payload: data,
    });
    return toManagerDirectoryRow(updated, actor.id);
  }

  async remove(actor: User, id: string): Promise<void> {
    if (actor.id === id) {
      throw new ForbiddenException(
        'You cannot delete your own manager account',
      );
    }
    await this.requireManager(id);
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This manager account has linked records and cannot be deleted. Block the manager instead.',
        );
      }
      throw error;
    }
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'MANAGER_DELETED',
      entityType: 'User',
      entityId: id,
    });
  }

  async resendInvite(actor: User, id: string) {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: Role.MANAGER },
      select: { ...managerListSelect, locale: true },
    });
    if (existing === null) {
      throw new NotFoundException('Manager not found');
    }
    if (existing.passwordHash !== null) {
      throw new BadRequestException(
        'This manager already set a password. Use password reset instead.',
      );
    }
    const invite = await this.invite.issueAndSend({
      id: existing.id,
      email: existing.email,
      name: existing.name,
      lastName: existing.lastName,
      locale: existing.locale,
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'MANAGER_INVITE_RESENT',
      entityType: 'User',
      entityId: id,
      payload: { welcomeEmailSent: invite.welcomeEmailSent },
    });
    return {
      manager: toManagerDirectoryRow(existing, actor.id),
      invite,
    };
  }

  private async requireManager(id: string): Promise<ManagerUserRecord> {
    const existing = await this.prisma.user.findFirst({
      where: { id, role: Role.MANAGER },
      select: managerListSelect,
    });
    if (existing === null) {
      throw new NotFoundException('Manager not found');
    }
    return existing;
  }

  private assertNotSelfStatusChange(
    actorId: string,
    targetId: string,
    isBlocked: boolean | undefined,
  ): void {
    if (actorId === targetId && isBlocked !== undefined) {
      throw new ForbiddenException(
        'You cannot block or unblock your own manager account',
      );
    }
  }

  private async buildUpdateData(
    id: string,
    dto: UpdateManagerDto,
  ): Promise<Prisma.UserUpdateInput> {
    const email =
      dto.email !== undefined ? dto.email.toLowerCase().trim() : undefined;
    const phone =
      dto.phone !== undefined
        ? normalizeOptionalPhone(dto.phone ?? null)
        : undefined;
    if (email !== undefined) {
      await this.assertEmailAvailable(email, id);
    }
    if (phone !== undefined && phone !== null) {
      await this.assertPhoneAvailable(phone, id);
    }
    return {
      ...(email !== undefined && { email }),
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
      ...(phone !== undefined && { phone }),
      ...(dto.isBlocked !== undefined && { isBlocked: dto.isBlocked }),
    };
  }

  private async assertEmailAndPhoneAvailable(
    email: string,
    phone: string,
  ): Promise<void> {
    const [emailTaken, phoneTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { phone }, select: { id: true } }),
    ]);
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (phoneTaken) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }
  }

  private async assertEmailAvailable(
    email: string,
    excludeId: string,
  ): Promise<void> {
    const taken = await this.prisma.user.findFirst({
      where: { email, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException('An account with this email already exists.');
    }
  }

  private async assertPhoneAvailable(
    phone: string,
    excludeId: string,
  ): Promise<void> {
    const taken = await this.prisma.user.findFirst({
      where: { phone, NOT: { id: excludeId } },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }
  }
}
