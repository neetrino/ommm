import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthTokenType,
  Role,
  type User,
} from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import { PASSWORD_RESET_TTL_MS } from '../common/constants';
import { generateSecurePassword } from '../common/generate-secure-password';
import { hashPassword } from '../common/password-crypto';
import { normalizeRequiredPhone } from '../common/phone';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateClientDto } from './dto/admin-create-client.dto';
import { clientInclude, toClientRow } from './clients-row.mapper';

function hashOpaqueToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex');
}

function newOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

@Injectable()
export class ClientsAdminCreateService {
  private readonly logger = new Logger(ClientsAdminCreateService.name);

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
}
