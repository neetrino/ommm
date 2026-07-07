import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, type User } from '@prisma/client';
import { GOOGLE_OAUTH_SIGNUP_TTL_MS } from '../common/constants';
import { hashPassword } from '../common/password-crypto';
import {
  hashOpaqueToken,
  newOpaqueToken,
} from '../common/opaque-token';
import { PrismaService } from '../prisma/prisma.service';
import {
  GOOGLE_PROVIDER,
  type GoogleOAuthProfile,
} from './google-oauth.types';

const DEFAULT_UI_LOCALE = 'en';
const WEB_DEFAULT_URL = 'http://localhost:3000';
const WEB_SET_PASSWORD_PATH = `/${DEFAULT_UI_LOCALE}/set-password`;

@Injectable()
export class OAuthPendingSignupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  createOrRefreshPendingSignup(
    profile: GoogleOAuthProfile,
  ): Promise<{ redirectUrl: string }> {
    const rawToken = newOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + GOOGLE_OAUTH_SIGNUP_TTL_MS);

    return this.prisma.pendingOAuthSignup
      .upsert({
        where: {
          provider_providerAccountId: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: profile.providerAccountId,
          },
        },
        create: {
          tokenHash,
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.providerAccountId,
          providerEmail: profile.providerEmail,
          providerEmailVerified: profile.providerEmailVerified,
          name: profile.name,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          expiresAt,
        },
        update: {
          tokenHash,
          providerEmail: profile.providerEmail,
          providerEmailVerified: profile.providerEmailVerified,
          name: profile.name,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          expiresAt,
        },
      })
      .then(() => ({
        redirectUrl: this.buildSetPasswordUrl(rawToken),
      }));
  }

  async completePendingSignup(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Promise<User> {
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    const tokenHash = hashOpaqueToken(token);
    const pending = await this.prisma.pendingOAuthSignup.findUnique({
      where: { tokenHash },
    });
    if (!pending || pending.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired signup token');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: pending.providerEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const linkedOAuth = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: pending.provider,
          providerAccountId: pending.providerAccountId,
        },
      },
    });
    if (linkedOAuth) {
      throw new ConflictException('Google account already linked');
    }

    const passwordHash = await hashPassword(newPassword);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: pending.providerEmail,
            passwordHash,
            role: Role.USER,
            locale: DEFAULT_UI_LOCALE,
            emailVerified: new Date(),
            name: pending.name,
            lastName: pending.lastName,
            avatarUrl: pending.avatarUrl,
            oauthAccounts: {
              create: {
                provider: pending.provider,
                providerAccountId: pending.providerAccountId,
                providerEmail: pending.providerEmail,
                providerEmailVerified: pending.providerEmailVerified,
              },
            },
          },
        });
        await tx.pendingOAuthSignup.delete({ where: { id: pending.id } });
        return user;
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Account already exists');
      }
      throw error;
    }
  }

  private buildSetPasswordUrl(rawToken: string): string {
    const configured = this.config.get<string>('WEB_APP_URL')?.trim();
    const baseUrl =
      configured && configured.length > 0 ? configured : WEB_DEFAULT_URL;
    const query = `token=${encodeURIComponent(rawToken)}`;
    return `${baseUrl.replace(/\/$/, '')}${WEB_SET_PASSWORD_PATH}?${query}`;
  }
}
