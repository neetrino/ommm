import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN_COOKIE, OAUTH_STATE_COOKIE } from '../common/constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService, sanitizeUser } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const OAUTH_STATE_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function accessTokenCookieBaseOptions(): {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

function readCookie(req: Request, key: string): string | undefined {
  const cookiesUnknown: unknown =
    'cookies' in req ? (req as { cookies?: unknown }).cookies : undefined;
  if (
    cookiesUnknown === null ||
    cookiesUnknown === undefined ||
    typeof cookiesUnknown !== 'object' ||
    Array.isArray(cookiesUnknown)
  ) {
    return undefined;
  }
  const raw: unknown = Reflect.get(
    cookiesUnknown as Record<PropertyKey, unknown>,
    key,
  );
  return typeof raw === 'string' ? raw : undefined;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly googleOAuth: GoogleOAuthService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.auth.register(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...accessTokenCookieBaseOptions(),
      maxAge: COOKIE_MAX_AGE_MS,
    });
    return { user, accessToken };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.auth.login(dto);
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...accessTokenCookieBaseOptions(),
      maxAge: COOKIE_MAX_AGE_MS,
    });
    return { user: sanitizeUser(user), accessToken };
  }

  @Get('google')
  googleStart(@Res() res: Response) {
    const { authorizationUrl, state } = this.googleOAuth.startGoogleAuth();
    res.cookie(OAUTH_STATE_COOKIE, state, {
      ...accessTokenCookieBaseOptions(),
      maxAge: OAUTH_STATE_COOKIE_MAX_AGE_MS,
    });
    res.redirect(authorizationUrl);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const storedState = readCookie(req, OAUTH_STATE_COOKIE);
    try {
      const { accessToken, redirectUrl } =
        await this.googleOAuth.completeGoogleAuth({
          code,
          state,
          storedState,
        });
      res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        ...accessTokenCookieBaseOptions(),
        maxAge: COOKIE_MAX_AGE_MS,
      });
      res.redirect(redirectUrl);
    } finally {
      res.clearCookie(OAUTH_STATE_COOKIE, accessTokenCookieBaseOptions());
    }
  }

  /** Clears httpOnly access cookie; unauthenticated calls are no-ops (no guard — expired JWT must still clear cookie). */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieBaseOptions());
    return { ok: true };
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.auth.verifyEmail(dto.token);
    return { ok: true };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.auth.requestPasswordReset(dto.email);
    return { ok: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.auth.resetPassword(dto.token, dto.newPassword);
    return { ok: true };
  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  session(@CurrentUser() user: Parameters<typeof sanitizeUser>[0]) {
    return { user: sanitizeUser(user) };
  }
}
