import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenType, type Role, type User } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import {
  EMAIL_VERIFY_TTL_MS,
  PASSWORD_RESET_TTL_MS,
} from "../common/constants";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

function hashOpaqueToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function newOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sanitizeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _p, ...rest } = user;
  return rest;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private signAccessToken(user: User): string {
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

  async register(dto: RegisterDto): Promise<{ user: ReturnType<typeof sanitizeUser> }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        locale: dto.locale ?? "hy",
      },
    });
    const { raw } = await this.createOpaqueToken(
      user.id,
      AuthTokenType.EMAIL_VERIFY,
      EMAIL_VERIFY_TTL_MS,
    );
    const webUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    const verifyUrl = `${webUrl}/hy/verify-email?token=${encodeURIComponent(raw)}`;
    await this.mail.sendEmail({
      to: user.email,
      subject: "Verify your Ommm account",
      html: `<p>Hi${user.name ? ` ${user.name}` : ""},</p><p><a href="${verifyUrl}">Verify email</a></p>`,
    });
    return { user: sanitizeUser(user) };
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
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
      throw new BadRequestException("Invalid or expired token");
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
    const webUrl = this.config.get<string>("WEB_APP_URL") ?? "http://localhost:3000";
    const resetUrl = `${webUrl}/hy/reset-password?token=${encodeURIComponent(raw)}`;
    await this.mail.sendEmail({
      to: user.email,
      subject: "Reset your Ommm password",
      html: `<p><a href="${resetUrl}">Reset password</a></p>`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const row = await this.prisma.authToken.findUnique({
      where: { tokenHash },
    });
    if (
      !row ||
      row.type !== AuthTokenType.PASSWORD_RESET ||
      row.expiresAt < new Date()
    ) {
      throw new BadRequestException("Invalid or expired token");
    }
    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash },
      }),
      this.prisma.authToken.delete({ where: { tokenHash } }),
    ]);
  }

  issueAccessTokenForUser(user: User): string {
    return this.signAccessToken(user);
  }

  validateRole(user: User, ...roles: Role[]): void {
    if (!roles.includes(user.role)) {
      throw new UnauthorizedException();
    }
  }
}
