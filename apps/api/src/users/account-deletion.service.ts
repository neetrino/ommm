import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType, Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { buildAccountDeletionCodeEmail } from '../mail/templates/account-deletion-email.template';
import { PrismaService } from '../prisma/prisma.service';
import {
  accountDeletionCodesMatch,
  hashAccountDeletionCode,
  isAccountDeletionCode,
  newAccountDeletionCode,
} from './account-deletion-code';
import {
  ACCOUNT_DELETION_CODE_INVALID,
  ACCOUNT_DELETION_CODE_TTL_MINUTES,
  ACCOUNT_DELETION_CODE_TTL_MS,
  ACCOUNT_DELETION_MAX_ATTEMPTS,
  COACH_SELF_DELETE_MESSAGE,
} from './account-deletion.constants';
import { UsersService } from './users.service';

type DeletionMember = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  role: Role;
};

type LiveDeletionCode = {
  id: string;
  tokenHash: string;
  attemptCount: number;
};

/**
 * Emails a one-time code, then closes the account only after that code matches.
 */
@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly users: UsersService,
  ) {}

  async sendCode(userId: string): Promise<{ ok: true }> {
    const user = await this.requireMember(userId);
    const code = newAccountDeletionCode();
    await this.replaceCode(user.id, code);
    try {
      await this.sendCodeEmail(user, code);
    } catch (error) {
      await this.clearCodes(user.id);
      throw error;
    }
    return { ok: true };
  }

  async confirm(userId: string, code: string): Promise<void> {
    const token = await this.findLiveCode(userId);
    if (!this.codeMatches(userId, code, token)) {
      await this.noteMiss(token);
      throw new BadRequestException(ACCOUNT_DELETION_CODE_INVALID);
    }
    await this.users.deleteOwnAccount(userId);
    await this.clearCodes(userId);
  }

  private async requireMember(userId: string): Promise<DeletionMember> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        role: true,
      },
    });
    if (user.role === Role.COACH) {
      throw new BadRequestException(COACH_SELF_DELETE_MESSAGE);
    }
    return user;
  }

  private async replaceCode(userId: string, code: string): Promise<void> {
    const tokenHash = hashAccountDeletionCode(this.secret(), userId, code);
    const expiresAt = new Date(Date.now() + ACCOUNT_DELETION_CODE_TTL_MS);
    await this.clearCodes(userId);
    await this.prisma.authToken.create({
      data: {
        userId,
        tokenHash,
        type: AuthTokenType.ACCOUNT_DELETION,
        expiresAt,
      },
    });
  }

  private async sendCodeEmail(user: DeletionMember, code: string): Promise<void> {
    const recipientName = [user.name, user.lastName].filter(Boolean).join(' ');
    await this.mail.sendEmail({
      to: user.email,
      ...buildAccountDeletionCodeEmail({
        recipientName,
        code,
        expiresInMinutes: ACCOUNT_DELETION_CODE_TTL_MINUTES,
      }),
    });
  }

  private async findLiveCode(userId: string): Promise<LiveDeletionCode | null> {
    return this.prisma.authToken.findFirst({
      where: {
        userId,
        type: AuthTokenType.ACCOUNT_DELETION,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, tokenHash: true, attemptCount: true },
    });
  }

  private codeMatches(
    userId: string,
    code: string,
    token: LiveDeletionCode | null,
  ): token is LiveDeletionCode {
    if (token === null || !isAccountDeletionCode(code)) {
      return false;
    }
    const candidate = hashAccountDeletionCode(this.secret(), userId, code);
    return accountDeletionCodesMatch(token.tokenHash, candidate);
  }

  private async noteMiss(token: LiveDeletionCode | null): Promise<void> {
    if (token === null) {
      return;
    }
    const nextAttempt = token.attemptCount + 1;
    if (nextAttempt >= ACCOUNT_DELETION_MAX_ATTEMPTS) {
      await this.prisma.authToken.delete({ where: { id: token.id } });
      return;
    }
    await this.prisma.authToken.update({
      where: { id: token.id },
      data: { attemptCount: nextAttempt },
    });
  }

  private async clearCodes(userId: string): Promise<void> {
    await this.prisma.authToken.deleteMany({
      where: { userId, type: AuthTokenType.ACCOUNT_DELETION },
    });
  }

  private secret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET');
  }
}
