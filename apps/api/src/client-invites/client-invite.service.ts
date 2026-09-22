import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientRegistrationSource, Prisma, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  isClientInviteCode,
  isClientInviteStaffRole,
  newClientInviteCode,
} from './client-invite-code';

const ALLOCATE_ATTEMPTS = 5;

export type ClientInviteSummary = {
  code: string;
  referredCount: number;
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class ClientInviteService {
  constructor(private readonly prisma: PrismaService) {}

  /** Unknown or inactive codes do not block signup; they simply are not attributed. */
  async resolveReferrerId(raw: string | undefined): Promise<string | null> {
    const code = raw?.trim() ?? '';
    if (!isClientInviteCode(code)) {
      return null;
    }
    const referrer = await this.prisma.user.findUnique({
      where: { clientInviteCode: code },
      select: { id: true, role: true, isBlocked: true },
    });
    if (!referrer || referrer.isBlocked) {
      return null;
    }
    if (!isClientInviteStaffRole(referrer.role)) {
      return null;
    }
    return referrer.id;
  }

  async summaryFor(
    user: Pick<User, 'id' | 'clientInviteCode'>,
  ): Promise<ClientInviteSummary> {
    const code = user.clientInviteCode ?? (await this.ensureCode(user.id));
    const referredCount = await this.prisma.user.count({
      where: {
        registeredById: user.id,
        registrationSource: ClientRegistrationSource.INVITE,
      },
    });
    return { code, referredCount };
  }

  private async ensureCode(userId: string): Promise<string> {
    const existing = await this.readCode(userId);
    if (existing) {
      return existing;
    }
    for (let attempt = 0; attempt < ALLOCATE_ATTEMPTS; attempt += 1) {
      await this.claimCode(userId, newClientInviteCode());
      const code = await this.readCode(userId);
      if (code) {
        return code;
      }
    }
    throw new InternalServerErrorException(
      'Could not allocate client invite code',
    );
  }

  private async claimCode(userId: string, code: string): Promise<boolean> {
    try {
      const updated = await this.prisma.user.updateMany({
        where: { id: userId, clientInviteCode: null },
        data: { clientInviteCode: code },
      });
      return updated.count === 1;
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        return false;
      }
      throw error;
    }
  }

  private async readCode(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { clientInviteCode: true },
    });
    return row?.clientInviteCode ?? null;
  }
}
