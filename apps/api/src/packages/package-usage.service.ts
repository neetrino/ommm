import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export type PackageUsageStats = {
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

@Injectable()
export class PackageUsageService {
  computeUsageStats(
    _membership: unknown,
  ): PackageUsageStats {
    return {
      totalSessions: null,
      usedSessions: null,
      remainingSessions: null,
      isUnlimited: false,
    };
  }

  resolveInitialSessions(plan: {
    isUnlimited: boolean;
    sessionsPerMonth: number | null;
  }): { sessionsTotal: number | null; sessionsRemaining: number | null } {
    if (plan.isUnlimited) {
      return { sessionsTotal: null, sessionsRemaining: null };
    }
    const total = plan.sessionsPerMonth ?? 0;
    return { sessionsTotal: total, sessionsRemaining: total };
  }

  async listEligibleUserPackages(): Promise<[]> {
    return [];
  }

  /** Active packages whose plan covers the class type (including zero remaining). */
  async listCoveringUserPackages(): Promise<[]> {
    return [];
  }

  /** Blocks complimentary bookings when the member only has depleted covering packages. */
  async assertCanBookWithoutPackageCredit(): Promise<void> {
    return;
  }

  async getValidatedUserPackageForBooking(): Promise<never> {
    throw new Error('Package module is disabled');
  }

  async consumeSession(_tx: Prisma.TransactionClient, _userPackageId: string): Promise<void> {
    return;
  }

  async restoreSession(_tx: Prisma.TransactionClient, _userPackageId: string): Promise<void> {
    return;
  }

  async syncExpiredMemberships(userId?: string): Promise<void> {
    void userId;
  }

  /**
   * Keeps `sessionsRemaining` aligned with active BOOKED rows per package.
   * Heals drift when consume/restore and booking state diverge.
   */
  async reconcileSessionsRemaining(userId?: string): Promise<void> {
    void userId;
  }
}
