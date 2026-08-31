import { ClassSessionStatus } from '@prisma/client';
import { RETROACTIVE_SESSION_LOOKBACK_MS } from './clients-bookings-retroactive.constants';
import type { UserPackageWithPlanAndBalances } from '../packages/package-usage.helpers';
import {
  hasUnrestoredConsumption,
  isRetroactiveSessionInLookback,
  isRetroactiveSessionStarted,
  isRetroactiveSessionStatusAllowed,
  isSessionAttachableToPackage,
  readOptionalAttachNote,
  resolveRetroactiveLookbackStart,
} from './clients-bookings-retroactive.helpers';

describe('clients-bookings-retroactive.helpers', () => {
  const now = new Date('2026-08-27T12:00:00.000Z');

  it('resolves lookback start from now', () => {
    expect(resolveRetroactiveLookbackStart(now).getTime()).toBe(
      now.getTime() - RETROACTIVE_SESSION_LOOKBACK_MS,
    );
  });

  it('treats a session as started only after its start', () => {
    expect(
      isRetroactiveSessionStarted(new Date('2026-08-27T11:59:59.000Z'), now),
    ).toBe(true);
    expect(
      isRetroactiveSessionStarted(new Date('2026-08-27T12:00:00.000Z'), now),
    ).toBe(false);
  });

  it('accepts sessions inside the lookback window', () => {
    expect(
      isRetroactiveSessionInLookback(new Date('2026-08-26T12:00:00.000Z'), now),
    ).toBe(true);
    expect(
      isRetroactiveSessionInLookback(
        new Date(now.getTime() - RETROACTIVE_SESSION_LOOKBACK_MS),
        now,
      ),
    ).toBe(true);
    expect(
      isRetroactiveSessionInLookback(
        new Date(now.getTime() - RETROACTIVE_SESSION_LOOKBACK_MS - 1),
        now,
      ),
    ).toBe(false);
  });

  it('rejects cancelled and draft sessions', () => {
    expect(isRetroactiveSessionStatusAllowed(ClassSessionStatus.FINISHED)).toBe(
      true,
    );
    expect(isRetroactiveSessionStatusAllowed(ClassSessionStatus.FULL)).toBe(
      true,
    );
    expect(isRetroactiveSessionStatusAllowed(ClassSessionStatus.ACTIVE)).toBe(
      true,
    );
    expect(
      isRetroactiveSessionStatusAllowed(ClassSessionStatus.CANCELLED),
    ).toBe(false);
    expect(isRetroactiveSessionStatusAllowed(ClassSessionStatus.DRAFT)).toBe(
      false,
    );
  });

  it('detects unrestored consumptions', () => {
    expect(hasUnrestoredConsumption([])).toBe(false);
    expect(
      hasUnrestoredConsumption([
        { restoredAt: new Date('2026-08-01T00:00:00.000Z') },
      ]),
    ).toBe(false);
    expect(hasUnrestoredConsumption([{ restoredAt: null }])).toBe(true);
  });

  it('allows an awaiting package to attach a covered past class without consumption', () => {
    const membership = {
      awaitingFirstVisit: true,
      currentPeriodStart: now,
      currentPeriodEnd: new Date('2026-09-26T12:00:00.000Z'),
      balances: [
        {
          id: 'bal-1',
          classTypeId: 'ct-1',
          sourceCategoryNameSnapshot: 'Reformer',
          sessionsTotal: 8,
          sessionsUsed: 0,
          sessionsRemaining: 8,
          isUnlimited: false,
        },
      ],
    } as UserPackageWithPlanAndBalances;
    const session = {
      startsAt: new Date('2026-08-26T12:00:00.000Z'),
      classType: { id: 'ct-1', name: 'Reformer' },
    };
    expect(isSessionAttachableToPackage(membership, session, undefined)).toBe(
      true,
    );
    expect(
      isSessionAttachableToPackage(membership, session, {
        consumptions: [{ restoredAt: null }],
      }),
    ).toBe(false);
  });

  it('trims optional notes', () => {
    expect(readOptionalAttachNote(undefined)).toBeNull();
    expect(readOptionalAttachNote('   ')).toBeNull();
    expect(readOptionalAttachNote('  trial converted  ')).toBe(
      'trial converted',
    );
  });
});
