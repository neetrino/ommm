import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, type User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';
import { inviteRegistrationFields } from '../client-invites/client-invite-code';
import { ClientInviteService } from '../client-invites/client-invite.service';
import { PrismaService } from '../prisma/prisma.service';
import { releaseSelfClosedAccount } from '../users/archive-user';
import { AuthService } from './auth.service';
import { isStateMatch, isUniqueConstraintError } from './google-oauth.helpers';
import { fetchVerifiedGoogleProfile as readGoogleProfile } from './google-oauth.profile';
import {
  resolveClosedAccountLoginUrl,
  resolveWebEntryUrl,
} from './google-oauth-urls';
import { assertGoogleSignInAllowed } from './google-sign-in.guard';
import {
  GOOGLE_PROVIDER,
  type GoogleAuthCompletion,
  type GoogleOAuthProfile,
} from './google-oauth.types';

const GOOGLE_OAUTH_SCOPES = ['openid', 'email', 'profile'];
const DEFAULT_UI_LOCALE = 'en';

type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly clientInvites: ClientInviteService,
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
    inviteCode?: string;
  }): Promise<GoogleAuthCompletion> {
    this.assertState(params.state, params.storedState);
    const code = this.requireCode(params.code);
    const profile = await this.fetchVerifiedGoogleProfile(code);
    return this.resolveGoogleAuthCompletion(profile, params.inviteCode);
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

  private fetchVerifiedGoogleProfile(
    code: string,
  ): Promise<GoogleOAuthProfile> {
    return readGoogleProfile(this.getGoogleConfig(), code);
  }

  private async resolveGoogleAuthCompletion(
    profile: GoogleOAuthProfile,
    inviteCode?: string,
  ): Promise<GoogleAuthCompletion> {
    const linked = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: GOOGLE_PROVIDER,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });
    const linkedReleased = linked
      ? await releaseSelfClosedAccount(this.prisma, linked.user)
      : false;
    if (linked && !linkedReleased) {
      return this.sessionCompletion(linked.user);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: profile.providerEmail },
    });
    if (
      existingUser &&
      !(await releaseSelfClosedAccount(this.prisma, existingUser))
    ) {
      assertGoogleSignInAllowed(existingUser);
      const user = await this.linkOAuthToExistingUser(existingUser, profile);
      return this.sessionCompletion(user);
    }

    const referrerId = await this.clientInvites.resolveReferrerId(inviteCode);
    const user = await this.createUserFromGoogleProfile(profile, referrerId);
    return this.sessionCompletion(user);
  }

  private sessionCompletion(user: User): GoogleAuthCompletion {
    assertGoogleSignInAllowed(user);
    return {
      accessToken: this.auth.issueAccessTokenForUser(user),
      redirectUrl: resolveWebEntryUrl(
        user.locale,
        this.config.get<string>('WEB_APP_URL'),
      ),
    };
  }

  closedAccountLoginUrl(locale: string): string {
    return resolveClosedAccountLoginUrl(
      locale,
      this.config.get<string>('WEB_APP_URL'),
    );
  }

  private async createUserFromGoogleProfile(
    profile: GoogleOAuthProfile,
    referrerId: string | null,
  ): Promise<User> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.pendingOAuthSignup.deleteMany({
          where: {
            provider: GOOGLE_PROVIDER,
            providerAccountId: profile.providerAccountId,
          },
        });

        return tx.user.create({
          data: {
            email: profile.providerEmail,
            passwordHash: null,
            role: Role.USER,
            locale: DEFAULT_UI_LOCALE,
            emailVerified: new Date(),
            name: profile.name,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
            ...inviteRegistrationFields(referrerId),
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
      });
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: profile.providerEmail },
        });
        if (
          existingUser &&
          (await releaseSelfClosedAccount(this.prisma, existingUser))
        ) {
          return this.createUserFromGoogleProfile(profile, referrerId);
        }
        if (existingUser) {
          assertGoogleSignInAllowed(existingUser);
          return this.linkOAuthToExistingUser(existingUser, profile);
        }
      }
      throw error;
    }
  }

  private async linkOAuthToExistingUser(
    user: User,
    profile: GoogleOAuthProfile,
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
      if (isUniqueConstraintError(error)) {
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
}
