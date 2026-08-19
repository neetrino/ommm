import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType, type Role, type User } from '@prisma/client';
import { hashOpaqueToken, newOpaqueToken } from '../common/opaque-token';
import {
  EMAIL_VERIFY_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from '../common/constants';
import { hashPassword, verifyPassword } from '../common/password-crypto';
import {
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  buildCreatePasswordEmailMessage,
  buildResetPasswordEmailMessage,
  buildVerifyEmailMessage,
} from '../mail/templates/auth-emails.template';
import { PrismaService } from '../prisma/prisma.service';
import { isValidPhoneNumber, normalizePhoneForStorage } from '../common/phone';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import { buildCreatePasswordUrl } from './build-create-password-url';

/** Invite / first-time password token (added in migration `20260728140000`). */
const AUTH_TOKEN_PASSWORD_SETUP = 'PASSWORD_SETUP' as AuthTokenType;

export type SafeUser = Omit<User, 'passwordHash'> & { hasPassword: boolean };

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash, ...rest } = user;
  void passwordHash;
  return {
    ...rest,
    hasPassword: passwordHash !== null,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private signAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwt.sign(payload);
  }

  private async createOpaqueToken(
    userId: string,
    type: AuthTokenType,
    ttlMs: number,
  ): Promise<{ raw: string; hash: string }> {
    const raw = newOpaqueToken();
    const tokenHash = hashOpaqueToken(raw);
    const expiresAt = new Date(Date.now() + ttlMs);
    await this.prisma.authToken.create({
      data: { userId, tokenHash, type, expiresAt },
    });
    return { raw, hash: tokenHash };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ user: ReturnType<typeof sanitizeUser>; accessToken: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    if (!isValidPhoneNumber(dto.phone)) {
      throw new BadRequestException('Invalid phone number');
    }
    const phone = normalizePhoneForStorage(dto.phone);
    const phoneTaken = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (phoneTaken) {
      throw new ConflictException('Phone number already registered');
    }
    const passwordHash = await hashPassword(dto.password);
    const displayFirst = dto.name;
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: displayFirst,
        lastName: dto.lastName,
        phone,
        locale: resolveEmailLocale(dto.locale),
      },
    });
    const { raw } = await this.createOpaqueToken(
      user.id,
      AuthTokenType.EMAIL_VERIFY,
      EMAIL_VERIFY_TTL_MS,
    );
    const webUrl = resolveWebAppUrl(this.config.get<string>('WEB_APP_URL'));
    const locale = resolveEmailLocale(user.locale);
    const verifyUrl = `${webUrl}/${locale}/verify-email?token=${encodeURIComponent(raw)}`;
    const greet = [displayFirst, dto.lastName].filter(Boolean).join(' ');
    await this.mail.sendEmail({
      to: user.email,
      ...buildVerifyEmailMessage({
        recipientName: greet,
        actionUrl: verifyUrl,
      }),
    });
    const accessToken = this.signAccessToken(user);
    return { user: sanitizeUser(user), accessToken };
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await verifyPassword(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isBlocked) {
      throw new UnauthorizedException();
    }
    if (user.passwordHash.startsWith('$argon2')) {
      const passwordHash = await hashPassword(dto.password);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
    }
    const accessToken = this.signAccessToken(user);
    return { user, accessToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const row = await this.prisma.authToken.findUnique({
      where: { tokenHash },
    });
    if (
      !row ||
      row.type !== AuthTokenType.EMAIL_VERIFY ||
      row.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { emailVerified: new Date() },
      }),
      this.prisma.authToken.delete({ where: { tokenHash } }),
    ]);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return;
    }
    const { raw } = await this.createOpaqueToken(
      user.id,
      AuthTokenType.PASSWORD_RESET,
      PASSWORD_RESET_TTL_MS,
    );
    const webUrl = resolveWebAppUrl(this.config.get<string>('WEB_APP_URL'));
    const locale = resolveEmailLocale(user.locale);
    const needsCreate = user.passwordHash === null;
    const resetUrl = needsCreate
      ? buildCreatePasswordUrl({ webAppUrl: webUrl, locale, token: raw })
      : `${webUrl}/${locale}/reset-password?token=${encodeURIComponent(raw)}`;
    const recipientName = [user.name, user.lastName].filter(Boolean).join(' ');
    const authParams = { recipientName, actionUrl: resetUrl };
    const message = needsCreate
      ? buildCreatePasswordEmailMessage(authParams)
      : buildResetPasswordEmailMessage(authParams);
    await this.mail.sendEmail({ to: user.email, ...message });
  }

  /**
   * First-time password for admin-invited clients (`passwordHash` was null).
   * Accepts `PASSWORD_SETUP` tokens, plus legacy invite tokens stored as `PASSWORD_RESET`.
   * Issues a session so the member lands in their account immediately.
   */
  async createPassword(
    token: string,
    newPassword: string,
  ): Promise<{
    user: ReturnType<typeof sanitizeUser>;
    accessToken: string;
  }> {
    const tokenHash = hashOpaqueToken(token);
    const row = await this.prisma.authToken.findUnique({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isSetupType = row.type === AUTH_TOKEN_PASSWORD_SETUP;
    const isLegacyInviteReset =
      row.type === AuthTokenType.PASSWORD_RESET &&
      row.user.passwordHash === null;
    if (!isSetupType && !isLegacyInviteReset) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (row.user.isBlocked) {
      throw new UnauthorizedException();
    }
    if (row.user.passwordHash !== null) {
      throw new BadRequestException(
        'Password already set. Sign in or use forgot password.',
      );
    }

    const passwordHash = await hashPassword(newPassword);
    const [, updatedUser] = await this.prisma.$transaction([
      this.prisma.authToken.deleteMany({
        where: {
          userId: row.userId,
          type: {
            in: [AUTH_TOKEN_PASSWORD_SETUP, AuthTokenType.PASSWORD_RESET],
          },
        },
      }),
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
    ]);

    const accessToken = this.signAccessToken(updatedUser);
    return { user: sanitizeUser(updatedUser), accessToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const row = await this.prisma.authToken.findUnique({
      where: { tokenHash },
      include: {
        user: { select: { id: true, isBlocked: true } },
      },
    });
    if (
      !row ||
      row.type !== AuthTokenType.PASSWORD_RESET ||
      row.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }
    if (row.user.isBlocked) {
      throw new UnauthorizedException();
    }
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.delete({ where: { tokenHash } }),
    ]);
  }

  issueAccessTokenForUser(user: Pick<User, 'id' | 'email' | 'role'>): string {
    return this.signAccessToken(user);
  }

  validateRole(user: User, ...roles: Role[]): void {
    if (!roles.includes(user.role)) {
      throw new UnauthorizedException();
    }
  }
}
