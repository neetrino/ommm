import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as passwordCrypto from '../common/password-crypto';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

describe('AuthService login blocked user', () => {
  it('rejects login when user.isBlocked is true', async () => {
    const verifyPasswordSpy = jest
      .spyOn(passwordCrypto, 'verifyPassword')
      .mockResolvedValue(true);
    const user = {
      id: 'user-1',
      email: 'blocked@example.com',
      passwordHash: '$argon2id$v=19$test',
      isBlocked: true,
      role: 'MEMBER',
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        update: jest.fn(),
      },
    };
    const service = new AuthService(
      prisma as never,
      { sign: jest.fn() } as unknown as JwtService,
      { sendEmail: jest.fn() } as never,
      { get: jest.fn() } as unknown as ConfigService,
    );

    await expect(
      service.login({ email: user.email, password: 'ValidPass123!' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.user.update).not.toHaveBeenCalled();
    verifyPasswordSpy.mockRestore();
  });
});

describe('JwtStrategy blocked user', () => {
  it('rejects validation when user.isBlocked is true', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'blocked@example.com',
          isBlocked: true,
        }),
      },
    };
    const strategy = new JwtStrategy(
      { getOrThrow: jest.fn().mockReturnValue('test-secret') } as never,
      prisma as never,
    );

    await expect(
      strategy.validate({ sub: 'user-1', email: 'blocked@example.com' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
