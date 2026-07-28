import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType, Role, type User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { normalizeAppUiLocale } from '../common/app-ui-locales';
import { CLIENT_INVITE_PASSWORD_SETUP_TTL_MS } from '../common/constants';
import { hashOpaqueToken, newOpaqueToken } from '../common/opaque-token';
import { normalizeRequiredPhone } from '../common/phone';
import { MailService } from '../mail/mail.service';
import { renderClientInviteEmail } from '../mail/templates/client-invite.template';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateClientDto } from './dto/admin-create-client.dto';
import { clientInclude, toClientRow } from './clients-row.mapper';

const DEFAULT_UI_LOCALE = 'en';

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

    const dateOfBirth =
      dto.dateOfBirth !== undefined && dto.dateOfBirth.length > 0
        ? new Date(dto.dateOfBirth)
        : null;
    if (dateOfBirth !== null && Number.isNaN(dateOfBirth.getTime())) {
      throw new BadRequestException('Invalid date of birth');
    }

    const inviteRawToken = newOpaqueToken();
    const inviteTokenHash = hashOpaqueToken(inviteRawToken);
    const inviteExpiresAt = new Date(
      Date.now() + CLIENT_INVITE_PASSWORD_SETUP_TTL_MS,
    );

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: null,
          name: dto.name.trim(),
          lastName: dto.lastName.trim(),
          phone,
          dateOfBirth,
          role: Role.USER,
          emailVerified: new Date(),
        },
        include: clientInclude,
      });

      await tx.authToken.create({
        data: {
          userId: user.id,
          tokenHash: inviteTokenHash,
          type: AuthTokenType.PASSWORD_RESET,
          expiresAt: inviteExpiresAt,
        },
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

    const webUrl =
      this.config.get<string>('WEB_APP_URL') ?? 'http://localhost:3000';
    const locale = normalizeAppUiLocale(
      createdUser.locale,
      DEFAULT_UI_LOCALE,
    );
    const passwordSetupUrl = `${webUrl}/${locale}/reset-password?token=${encodeURIComponent(inviteRawToken)}`;

    const greet = [createdUser.name, createdUser.lastName]
      .filter(Boolean)
      .join(' ');

    let welcomeEmailSent = false;
    try {
      await this.mail.sendEmail({
        to: createdUser.email,
        subject: 'Welcome to Ommm — create your password',
        html: renderClientInviteEmail({
          recipientName: greet,
          passwordSetupUrl,
        }),
      });
      welcomeEmailSent = true;
    } catch (error) {
      this.logger.warn(
        `Welcome invite email failed for ${createdUser.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }

    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'CLIENT_CREATED',
      entityType: 'User',
      entityId: createdUser.id,
      payload: { email, phone, welcomeEmailSent },
    });

    return {
      client: toClientRow(freshUser),
      invite: {
        email: createdUser.email,
        passwordSetupUrl,
        welcomeEmailSent,
      },
    };
  }
}
