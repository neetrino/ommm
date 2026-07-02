import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthTokenType,
  BookingStatus,
  Prisma,
  Role,
  type User,
} from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { PASSWORD_RESET_TTL_MS } from '../common/constants';
import { generateSecurePassword } from '../common/generate-secure-password';
import { hashPassword } from '../common/password-crypto';
import {
  normalizeOptionalPhone,
  normalizeRequiredPhone,
} from '../common/phone';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateClientDto } from './dto/admin-create-client.dto';
import type { UpdateClientDto } from './dto/update-client.dto';
import { clientInclude, toClientRow } from './clients-row.mapper';

function hashOpaqueToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

function newOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

@Injectable()
export class ClientsAdminService {
  private readonly logger = new Logger(ClientsAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async create(actor: User, dto: AdminCreateClientDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = normalizeRequiredPhone(dto.phone);
    const notes = dto.notes?.trim() ?? '';
    const autoGenerate = dto.autoGeneratePassword === true;
    const forceReset = dto.forcePasswordResetOnFirstLogin === true;

    let plainPassword = dto.password?.trim() ?? '';
    if (autoGenerate || plainPassword.length === 0) {
      plainPassword = generateSecurePassword();
    }
    if (plainPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const [emailTaken, phoneTaken] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phone } }),
    ]);
    if (emailTaken) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (phoneTaken) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }

    const passwordHash = await hashPassword(plainPassword);
    const dateOfBirth =
      dto.dateOfBirth !== undefined && dto.dateOfBirth.length > 0
        ? new Date(dto.dateOfBirth)
        : null;
    if (dateOfBirth !== null && Number.isNaN(dateOfBirth.getTime())) {
      throw new BadRequestException('Invalid date of birth');
    }

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name.trim(),
          lastName: dto.lastName.trim(),
          phone,
          dateOfBirth,
          role: Role.USER,
          emailVerified: new Date(),
        },
        include: clientInclude,
      });

      if (notes.length > 0) {
        await tx.clientNote.create({
          data: {
            userId: user.id,
            authorId: actor.id,
            body: notes,
          },
        });
      }

      return user;
    });

    const freshUser = await this.prisma.user.findFirstOrThrow({
      where: { id: createdUser.id },
      include: clientInclude,
    });

    let passwordResetUrl: string | null = null;
    if (forceReset) {
      const raw = newOpaqueToken();
      const tokenHash = hashOpaqueToken(raw);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
      await this.prisma.authToken.create({
        data: {
          userId: createdUser.id,
          tokenHash,
          type: AuthTokenType.PASSWORD_RESET,
          expiresAt,
        },
      });
      const webUrl =
        this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
      const locale = createdUser.locale.trim() || 'en';
      passwordResetUrl = `${webUrl}/${locale}/reset-password?token=${encodeURIComponent(raw)}`;
    }

    let welcomeEmailSent = false;
    if (dto.sendWelcomeEmail === true) {
      const greet = [createdUser.name, createdUser.lastName]
        .filter(Boolean)
        .join(' ');
      const webUrl =
        this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
      const loginUrl = `${webUrl}/${createdUser.locale || 'en'}/login`;
      const credentialBlock = forceReset
        ? `<p>Please set your password using this link: <a href="${passwordResetUrl}">Choose a password</a></p>`
        : `<p>Sign in at <a href="${loginUrl}">${loginUrl}</a> with your email and the temporary password provided by the studio.</p>`;
      try {
        await this.mail.sendEmail({
          to: createdUser.email,
          subject: 'Welcome to Ommm',
          html: `<p>Hi${greet ? ` ${greet}` : ''},</p><p>Your client account has been created.</p>${credentialBlock}`,
        });
        welcomeEmailSent = true;
      } catch (error) {
        this.logger.warn(
          `Welcome email failed for ${createdUser.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }

    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_CREATED',
      entityType: 'User',
      entityId: createdUser.id,
      payload: { email, phone },
    });

    const client = toClientRow(freshUser);
    return {
      client,
      credentials: {
        email: createdUser.email,
        temporaryPassword: forceReset ? null : plainPassword,
        passwordResetUrl,
      },
      welcomeEmailSent,
    };
  }

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
