import { BadRequestException } from '@nestjs/common';
import { AuthTokenType, Role } from '@prisma/client';
import { ACCOUNT_DELETION_CODE_SUBJECT } from '../mail/templates/account-deletion-email.template';
import { hashAccountDeletionCode } from './account-deletion-code';
import {
  ACCOUNT_DELETION_CODE_INVALID,
  ACCOUNT_DELETION_MAX_ATTEMPTS,
} from './account-deletion.constants';
import { AccountDeletionService } from './account-deletion.service';

const SECRET = 'test-secret';
const USER_ID = 'user-1';

type AccountDeletionEmail = {
  to: string;
  subject: string;
  html: string;
};

type StoredDeletionToken = {
  data: { tokenHash: string };
};

const member = {
  id: USER_ID,
  email: 'ada@example.com',
  name: 'Ada',
  lastName: null,
  role: Role.USER,
};

function emailedCode(html: string): string {
  const match = html.match(/Closure code<\/p>\s*<p[^>]*>(\d{6})<\/p>/);
  const code = match?.[1];
  if (code === undefined) {
    throw new Error('closure code missing from email');
  }
  return code;
}

describe('AccountDeletionService', () => {
  const config = { getOrThrow: jest.fn().mockReturnValue(SECRET) };

  function makeService(prisma: object, mail: object, users: object) {
    return new AccountDeletionService(
      prisma as never,
      mail as never,
      config as never,
      users as never,
    );
  }

  it('emails a code and stores only its hash', async () => {
    const mail = {
      sendEmail: jest
        .fn<Promise<void>, [AccountDeletionEmail]>()
        .mockResolvedValue(undefined),
    };
    const prisma = {
      user: { findUniqueOrThrow: jest.fn().mockResolvedValue(member) },
      authToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest
          .fn<Promise<{ id: string }>, [StoredDeletionToken]>()
          .mockResolvedValue({ id: 'token-1' }),
      },
    };
    const service = makeService(prisma, mail, {});

    await expect(service.sendCode(USER_ID)).resolves.toEqual({ ok: true });

    const sent = mail.sendEmail.mock.calls[0]?.[0];
    if (sent === undefined) {
      throw new Error('email was not sent');
    }
    const code = emailedCode(sent.html);
    expect(sent.to).toBe(member.email);
    expect(sent.subject).toBe(ACCOUNT_DELETION_CODE_SUBJECT);
    expect(prisma.authToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: USER_ID,
        type: AuthTokenType.ACCOUNT_DELETION,
        tokenHash: hashAccountDeletionCode(SECRET, USER_ID, code),
      }) as { tokenHash: string },
    });
    const stored = prisma.authToken.create.mock.calls[0]?.[0]?.data.tokenHash;
    expect(stored).not.toBe(code);
  });

  it('does not email a coach', async () => {
    const mail = { sendEmail: jest.fn() };
    const prisma = {
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          ...member,
          role: Role.COACH,
        }),
      },
      authToken: { deleteMany: jest.fn(), create: jest.fn() },
    };
    const service = makeService(prisma, mail, {});

    await expect(service.sendCode(USER_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });

  it('closes the account when the code matches', async () => {
    const code = '123456';
    const users = { deleteOwnAccount: jest.fn().mockResolvedValue(undefined) };
    const prisma = {
      authToken: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'token-1',
          tokenHash: hashAccountDeletionCode(SECRET, USER_ID, code),
          attemptCount: 0,
        }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = makeService(prisma, {}, users);

    await service.confirm(USER_ID, code);

    expect(users.deleteOwnAccount).toHaveBeenCalledWith(USER_ID);
    expect(prisma.authToken.deleteMany).toHaveBeenCalled();
  });

  it('rejects a wrong code and keeps the account', async () => {
    const users = { deleteOwnAccount: jest.fn() };
    const prisma = {
      authToken: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'token-1',
          tokenHash: hashAccountDeletionCode(SECRET, USER_ID, '123456'),
          attemptCount: 0,
        }),
        update: jest.fn().mockResolvedValue({ id: 'token-1' }),
        delete: jest.fn(),
      },
    };
    const service = makeService(prisma, {}, users);

    await expect(service.confirm(USER_ID, '000000')).rejects.toThrow(
      ACCOUNT_DELETION_CODE_INVALID,
    );
    expect(users.deleteOwnAccount).not.toHaveBeenCalled();
    expect(prisma.authToken.update).toHaveBeenCalledWith({
      where: { id: 'token-1' },
      data: { attemptCount: 1 },
    });
  });

  it('drops the code after too many wrong guesses', async () => {
    const prisma = {
      authToken: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'token-1',
          tokenHash: hashAccountDeletionCode(SECRET, USER_ID, '123456'),
          attemptCount: ACCOUNT_DELETION_MAX_ATTEMPTS - 1,
        }),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({ id: 'token-1' }),
      },
    };
    const service = makeService(prisma, {}, { deleteOwnAccount: jest.fn() });

    await expect(service.confirm(USER_ID, '000000')).rejects.toThrow(
      ACCOUNT_DELETION_CODE_INVALID,
    );
    expect(prisma.authToken.delete).toHaveBeenCalledWith({
      where: { id: 'token-1' },
    });
    expect(prisma.authToken.update).not.toHaveBeenCalled();
  });
});
