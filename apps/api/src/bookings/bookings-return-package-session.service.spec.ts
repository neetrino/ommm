import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
jest.mock('../packages/package-usage.service', () => ({
  PackageUsageService: class PackageUsageService {},
}));

import { BookingsReturnPackageSessionService } from './bookings-return-package-session.service';
import {
  RETURN_PACKAGE_SESSION_NOT_PAST,
  RETURN_PACKAGE_SESSION_NOTHING_HELD,
} from './bookings-return-package-session.helpers';

const BOOKING_ID = 'booking-1';

const HELD = {
  restoredAt: null,
  consumedSessions: 1,
  consumedGuestSlots: 0,
};

function booking(endsAt: Date, consumptions = [HELD]) {
  return {
    session: { endsAt },
    consumptions,
  };
}

describe('BookingsReturnPackageSessionService', () => {
  function buildService(row: ReturnType<typeof booking> | null) {
    const holds = row?.consumptions ?? [];
    const tx = {
      bookingConsumption: {
        findMany: jest.fn().mockResolvedValue(holds),
      },
    };
    const prisma = {
      booking: { findUnique: jest.fn().mockResolvedValue(row) },
      $transaction: jest.fn(async (run: (client: typeof tx) => Promise<void>) =>
        run(tx),
      ),
    };
    const packageUsage = {
      restoreSession: jest.fn().mockResolvedValue(undefined),
    };
    const service = new BookingsReturnPackageSessionService(
      prisma as never,
      packageUsage as never,
    );
    return { service, prisma, packageUsage, tx };
  }

  it('returns a held package session after the class has finished', async () => {
    const { service, packageUsage, tx } = buildService(
      booking(new Date(Date.now() - 60_000)),
    );

    await expect(service.returnToPackage(BOOKING_ID)).resolves.toEqual({
      ok: true,
    });
    expect(packageUsage.restoreSession).toHaveBeenCalledWith({
      tx,
      bookingId: BOOKING_ID,
    });
  });

  it('rejects a class that has not finished', async () => {
    const { service, packageUsage } = buildService(
      booking(new Date(Date.now() + 60_000)),
    );

    await expect(service.returnToPackage(BOOKING_ID)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.returnToPackage(BOOKING_ID)).rejects.toThrow(
      RETURN_PACKAGE_SESSION_NOT_PAST,
    );
    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('rejects a finished class whose package charge was already returned', async () => {
    const { service, packageUsage } = buildService(
      booking(new Date(Date.now() - 60_000), [
        {
          restoredAt: new Date(),
          consumedSessions: 1,
          consumedGuestSlots: 0,
        },
      ]),
    );

    await expect(service.returnToPackage(BOOKING_ID)).rejects.toThrow(
      RETURN_PACKAGE_SESSION_NOTHING_HELD,
    );
    expect(packageUsage.restoreSession).not.toHaveBeenCalled();
  });

  it('rejects a missing booking', async () => {
    const { service } = buildService(null);
    await expect(service.returnToPackage(BOOKING_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
