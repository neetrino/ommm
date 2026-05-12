import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { User } from '@prisma/client';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_COOKIE } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
};

function readAccessTokenCookie(req: Request): string | null {
  const cookiesUnknown: unknown =
    'cookies' in req ? (req as { cookies?: unknown }).cookies : undefined;
  if (
    cookiesUnknown === null ||
    cookiesUnknown === undefined ||
    typeof cookiesUnknown !== 'object' ||
    Array.isArray(cookiesUnknown)
  ) {
    return null;
  }
  const raw: unknown = Reflect.get(
    cookiesUnknown as Record<PropertyKey, unknown>,
    ACCESS_TOKEN_COOKIE,
  );
  return typeof raw === 'string' ? raw : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => readAccessTokenCookie(req),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
