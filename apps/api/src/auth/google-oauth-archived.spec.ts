import { Role } from '@prisma/client';
import { GoogleOAuthService } from './google-oauth.service';
import type { GoogleOAuthProfile } from './google-oauth.types';
import { GoogleAccountClosedException } from './google-sign-in.guard';

const profile: GoogleOAuthProfile = {
  providerAccountId: 'google-1',
  providerEmail: 'ada@example.com',
  providerEmailVerified: true,
  name: 'Ada',
  lastName: null,
  avatarUrl: null,
};

const archivedUser = {
  id: 'user-1',
  email: 'ada@example.com',
  role: Role.USER,
  isBlocked: true,
  deletedAt: new Date('2026-10-14T00:00:00.000Z'),
  locale: 'hy',
};

describe('GoogleOAuthService archived account', () => {
  const state = 'state-token';

  function serviceWith(prisma: object, issueAccessTokenForUser: jest.Mock) {
    const service = new GoogleOAuthService(
      { get: jest.fn() } as never,
      prisma as never,
      { issueAccessTokenForUser } as never,
      { resolveReferrerId: jest.fn().mockResolvedValue(null) } as never,
    );
    jest
      .spyOn(
        service as unknown as {
          fetchVerifiedGoogleProfile: () => Promise<GoogleOAuthProfile>;
        },
        'fetchVerifiedGoogleProfile',
      )
      .mockResolvedValue(profile);
    return service;
  }

  it('does not issue a token for an archived linked Google account', async () => {
    const issueAccessTokenForUser = jest.fn();
    const prisma = {
      oAuthAccount: {
        findUnique: jest.fn().mockResolvedValue({ user: archivedUser }),
        create: jest.fn(),
      },
      user: { findUnique: jest.fn() },
    };
    const service = serviceWith(prisma, issueAccessTokenForUser);

    await expect(
      service.completeGoogleAuth({
        code: 'code',
        state,
        storedState: state,
      }),
    ).rejects.toBeInstanceOf(GoogleAccountClosedException);
    expect(issueAccessTokenForUser).not.toHaveBeenCalled();
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it('does not create a new user when that email belongs to a closed account', async () => {
    const issueAccessTokenForUser = jest.fn();
    const prisma = {
      oAuthAccount: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(archivedUser),
        create: jest.fn(),
      },
    };
    const service = serviceWith(prisma, issueAccessTokenForUser);

    await expect(
      service.completeGoogleAuth({
        code: 'code',
        state,
        storedState: state,
      }),
    ).rejects.toBeInstanceOf(GoogleAccountClosedException);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
    expect(issueAccessTokenForUser).not.toHaveBeenCalled();
  });

  it('opens a new account when the member closed that Google account', async () => {
    const created = {
      id: 'user-2',
      email: profile.providerEmail,
      locale: 'en',
      isBlocked: false,
      deletedAt: null,
      role: Role.USER,
    };
    const selfClosed = { ...archivedUser, deletedById: archivedUser.id };
    const issueAccessTokenForUser = jest.fn().mockReturnValue('token');
    const db = {
      oAuthAccount: {
        findUnique: jest.fn().mockResolvedValue({ user: selfClosed }),
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'oauth-1', providerAccountId: 'google-1' },
          ]),
        update: jest.fn().mockResolvedValue({ id: 'oauth-1' }),
        create: jest.fn(),
      },
      pendingOAuthSignup: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: {
        findUnique: jest.fn(
          (args: { where: { id?: string; email?: string } }) => {
            if (args.where.id !== undefined) {
              return Promise.resolve({ email: 'ada@example.com' });
            }
            return Promise.resolve(null);
          },
        ),
        update: jest.fn().mockResolvedValue({ id: 'user-1' }),
        create: jest.fn().mockResolvedValue(created),
      },
    };
    const prisma = {
      ...db,
      $transaction: jest.fn((work: unknown) => {
        if (typeof work === 'function') {
          return (work as (tx: typeof db) => Promise<unknown>)(db);
        }
        return Promise.all(work as Promise<unknown>[]);
      }),
    };
    const service = serviceWith(prisma, issueAccessTokenForUser);

    const result = await service.completeGoogleAuth({
      code: 'code',
      state,
      storedState: state,
    });

    expect(result.accessToken).toBe('token');
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'closed+user-1@users.invalid',
        phone: null,
        whatsappPhone: null,
      },
    });
    expect(issueAccessTokenForUser).toHaveBeenCalledWith(created);
  });
});
