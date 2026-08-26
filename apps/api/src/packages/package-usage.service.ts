import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PackageUsageEligibilityService } from './package-usage-eligibility.service';
import {
  computeUsageStats,
  resolveInitialSessions,
  type EligibleBookingPackage,
  type PackageUsageStats,
  type SessionShape,
  type UserPackageWithPlanAndBalances,
} from './package-usage.helpers';
import { PackageUsageLedgerService } from './package-usage-ledger.service';
import { PackageUsageMaintenanceService } from './package-usage-maintenance.service';

export type { EligibleBookingPackage, PackageUsageStats };

@Injectable()
export class PackageUsageService {
  constructor(
    private readonly eligibility: PackageUsageEligibilityService,
    private readonly ledger: PackageUsageLedgerService,
    private readonly maintenance: PackageUsageMaintenanceService,
  ) {}

  computeUsageStats(membership: {
    sessionsTotal: number | null;
    sessionsRemaining: number | null;
    plan: { isUnlimited: boolean } | null;
    planIsUnlimitedSnapshot: boolean;
  }): PackageUsageStats {
    return computeUsageStats(membership);
  }

  resolveInitialSessions(plan: {
    isUnlimited: boolean;
    sessionsPerMonth: number | null;
  }) {
    return resolveInitialSessions(plan);
  }

  listEligibleUserPackages(params: {
    userId: string;
    session: SessionShape;
  }): Promise<EligibleBookingPackage[]> {
    return this.eligibility.listEligibleUserPackages(params);
  }

  listCoveringUserPackages(params: {
    userId: string;
    session: SessionShape;
    includeDepleted?: boolean;
  }): Promise<UserPackageWithPlanAndBalances[]> {
    return this.eligibility.listCoveringUserPackages(params);
  }

  assertCanBookWithoutPackageCredit(params: {
    userId: string;
    session: SessionShape;
  }): Promise<void> {
    return this.eligibility.assertCanBookWithoutPackageCredit(params);
  }

  getValidatedUserPackageForBooking(params: {
    tx: Prisma.TransactionClient;
    userId: string;
    session: SessionShape;
    userPackageId?: string;
  }): Promise<UserPackageWithPlanAndBalances> {
    return this.eligibility.getValidatedUserPackageForBooking(params);
  }

  getValidatedUserPackageForGuestPass(params: {
    tx: Prisma.TransactionClient;
    userId: string;
    session: SessionShape;
    userPackageId: string;
  }): Promise<UserPackageWithPlanAndBalances> {
    return this.eligibility.getValidatedUserPackageForGuestPass(params);
  }

  consumeSession(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
    membership: UserPackageWithPlanAndBalances;
    sessionClassType: { id: string; name: string };
    requiredSessions: number;
  }): Promise<void> {
    return this.ledger.consumeSession(params);
  }

  consumeGuestSlot(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
    membership: UserPackageWithPlanAndBalances;
  }): Promise<void> {
    return this.ledger.consumeGuestSlot(params);
  }

  restoreSession(params: {
    tx: Prisma.TransactionClient;
    bookingId: string;
  }): Promise<void> {
    return this.ledger.restoreSession(params);
  }

  syncExpiredMemberships(userId?: string): Promise<void> {
    return this.maintenance.syncExpiredMemberships(userId);
  }

  reconcileSessionsRemaining(userId?: string): Promise<void> {
    return this.maintenance.reconcileSessionsRemaining(userId);
  }
}
