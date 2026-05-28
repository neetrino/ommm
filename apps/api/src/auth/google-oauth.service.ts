import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, type User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const GOOGLE_PROVIDER = 'google';
const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'];
const DEFAULT_UI_LOCALE = 'en';
const WEB_DEFAULT_URL = 'http://localhost:3000';
const WEB_AUTH_ENTRY_PATH = `/${DEFAULT_UI_LOCALE}/account`;
const WEB_SET_PASSWORD_PATH = `/${DEFAULT_UI_LOCALE}/set-password`;

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

type GoogleProfile = {
  providerAccountId: string;
  providerEmail: string;
  providerEmailVerified: true;
  name: string | null;
  lastName: string | null;
  avatarUrl: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseGoogleName(payload: {
  given_name?: string | null;
  family_name?: string | null;
  name?: string | null;
}): { name: string | null; lastName: string | null } {
  const first = payload.given_name?.trim() ?? '';
  const last = payload.family_name?.trim() ?? '';
  if (first || last) {
    return {
      name: first || null,
      lastName: last || null,
    };
  }
  const fullName = payload.name?.trim() ?? '';
  if (!fullName) {
    return { name: null, lastName: null };
  }
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { name: parts[0], lastName: null };
  }
  return {
    name: parts[0] ?? null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

function isStateMatch(state: string, storedState: string): boolean {
  const stateBuffer = Buffer.from(state, 'utf8');
  const storedStateBuffer = Buffer.from(storedState, 'utf8');
  if (stateBuffer.length !== storedStateBuffer.length) {
    return false;
  }
  return timingSafeEqual(stateBuffer, storedStateBuffer);
}

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  startGoogleAuth(): { authorizationUrl: string; state: string } {
    const { clientId, clientSecret, callbackUrl } = this.getGoogleConfig();
    const client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri: callbackUrl,
    });
    const state = randomBytes(32).toString('base64url');
    const authorizationUrl = client.generateAuthUrl({
      scope: GOOGLE_OAUTH_SCOPES,
      state,
      prompt: 'select_account',
    });
    return { authorizationUrl, state };
  }

  async completeGoogleAuth(params: {
    code?: string;
    state?: string;
    storedState?: string;
  }): Promise<{ accessToken: string; redirectUrl: string }> {
    this.assertState(params.state, params.storedState);
    const code = this.requireCode(params.code);
    const profile = await this.fetchVerifiedGoogleProfile(code);
    const user = await this.resolveUserForGoogleProfile(profile);
    return {
      accessToken: this.auth.issueAccessTokenForUser(user),
      redirectUrl: this.resolveWebEntryUrl(user),
    };
  }

  private getGoogleConfig(): GoogleOAuthConfig {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')?.trim() ?? '';
    const clientSecret =
      this.config.get<string>('GOOGLE_CLIENT_SECRET')?.trim() ?? '';
    const callbackUrl =
      this.config.get<string>('GOOGLE_CALLBACK_URL')?.trim() ?? '';
    if (!clientId || !clientSecret || !callbackUrl) {
      throw new InternalServerErrorException(
        'Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.',
      );
    }
    return { clientId, clientSecret, callbackUrl };
  }

  private assertState(state?: string, storedState?: string): void {
    if (!state || !storedState || !isStateMatch(state, storedState)) {
      throw new UnauthorizedException('Invalid Google OAuth state');
    }
  }

  private requireCode(code?: string): string {
    if (!code) {
      throw new BadRequestException('Missing Google authorization code');
    }
    return code;
  }

  private async fetchVerifiedGoogleProfile(
    code: string,
  ): Promise<GoogleProfile> {
    const { clientId, clientSecret, callbackUrl } = this.getGoogleConfig();
    const client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri: callbackUrl,
    });
    const { tokens } = await client.getToken(code);
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new UnauthorizedException('Missing Google ID token');
    }
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google ID token payload');
    }
    const audienceRaw: unknown = Reflect.get(
      payload as unknown as Record<string, unknown>,
      'aud',
    );
    const audienceMatches =
      typeof audienceRaw === 'string'
        ? audienceRaw === clientId
        : Array.isArray(audienceRaw) &&
          audienceRaw.some(
            (item: unknown) => typeof item === 'string' && item === clientId,
          );
    if (!audienceMatches) {
      throw new UnauthorizedException('Google audience does not match');
    }
    const providerAccountId = payload.sub?.trim();
    const providerEmail = payload.email?.trim();
    if (
      !providerAccountId ||
      !providerEmail ||
      payload.email_verified !== true
    ) {
      throw new UnauthorizedException('Google email is missing or unverified');
    }
    const parsedName = parseGoogleName({
      given_name: payload.given_name,
      family_name: payload.family_name,
      name: payload.name,
    });
    return {
      providerAccountId,
      providerEmail: normalizeEmail(providerEmail),
      providerEmailVerified: true,
      name: parsedName.name,
      lastName: parsedName.lastName,
      avatarUrl: payload.picture?.trim() ?? null,
    };
  }

  private async resolveUserForGoogleProfile(
    profile: GoogleProfile,
  ): Promise<User> {
    const linked = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });
    if (linked) {
      return linked.user;
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.providerEmail },
    });
    if (existingUser) {
      return this.linkOAuthToExistingUser(existingUser, profile);
    }
    return this.createUserWithOAuth(profile);
  }

  private async linkOAuthToExistingUser(
    user: User,
    profile: GoogleProfile,
  ): Promise<User> {
    try {
      const [, updatedUser] = await this.prisma.$transaction([
        this.prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: GOOGLE_PROVIDER,
            providerAccountId: profile.providerAccountId,
            providerEmail: profile.providerEmail,
            providerEmailVerified: profile.providerEmailVerified,
          },
        }),
        this.prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: user.emailVerified ?? new Date(),
          },
        }),
      ]);
      return updatedUser;
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const linked = await this.prisma.oAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: GOOGLE_PROVIDER,
              providerAccountId: profile.providerAccountId,
            },
          },
          include: { user: true },
        });
        if (linked?.user) {
          return linked.user;
        }
      }
      throw error;
    }
  }

  private createUserWithOAuth(profile: GoogleProfile): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: profile.providerEmail,
        passwordHash: null,
        role: Role.USER,
        locale: DEFAULT_UI_LOCALE,
        emailVerified: new Date(),
        name: profile.name,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        oauthAccounts: {
          create: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: profile.providerAccountId,
            providerEmail: profile.providerEmail,
            providerEmailVerified: profile.providerEmailVerified,
          },
        },
      },
    });
  }

  private resolveWebEntryUrl(user: Pick<User, 'passwordHash'>): string {
    const configured = this.config.get<string>('WEB_APP_URL')?.trim();
    const baseUrl =
      configured && configured.length > 0 ? configured : WEB_DEFAULT_URL;
    const path = user.passwordHash
      ? WEB_AUTH_ENTRY_PATH
      : WEB_SET_PASSWORD_PATH;
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  }
}
