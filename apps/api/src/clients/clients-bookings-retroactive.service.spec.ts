import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Role,
  UserPackageStatus,
  type User,
} from '@prisma/client';
import { RETROACTIVE_ATTACH_ERROR } from './clients-bookings-retroactive.constants';
import { ClientsBookingsRetroactiveService } from './clients-bookings-retroactive.service';

const NOW = new Date('2026-08-27T15:00:00.000Z');
const PAST_START = new Date('2026-08-27T12:00:00.000Z');

function createActor(): User {
  return {
    id: 'admin-1',
    role: Role.ADMIN,
  } as User;
}

function createMembership() {
  return {
    id: 'pkg-1',
    userId: 'client-1',
    status: UserPackageStatus.ACTIVE,
    awaitingFirstVisit: true,
    currentPeriodStart: NOW,
    currentPeriodEnd: new Date('2026-09-26T15:00:00.000Z'),
    plan: { id: 'plan-1', name: 'Reformer 8', categoryName: 'Reformer', isUnlimited: false },
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
  };
}

function createSession() {
  return {
    id: 'session-1',
    startsAt: PAST_START,
    status: ClassSessionStatus.FINISHED,
    priceCents: 8000,
    sessionRequirement: 1,
    classType: { id: 'ct-1', name: 'Reformer' },
  };
}

function createService(overrides?: {
  existingBooking?: { id: string; consumptions: Array<{ restoredAt: Date | null }> } | null;
}) {
  const existingBooking = overrides?.existingBooking ?? null;
  const bookingCreate = jest.fn().mockResolvedValue({ id: 'booking-new' });
  const bookingUpdate = jest.fn().mockResolvedValue({ id: 'booking-existing' });
  const bookingNoteCreate = jest.fn().mockResolvedValue({ id: 'note-1' });
  const tx = {
    booking: {
      findUnique: jest.fn().mockResolvedValue(existingBooking),
      create: bookingCreate,
      update: bookingUpdate,
    },
    bookingNote: { create: bookingNoteCreate },
  };
  const prisma = {
    user: { findFirst: jest.fn().mockResolvedValue({ id: 'client-1' }) },
    userPackage: { findFirst: jest.fn().mockResolvedValue(createMembership()) },
    classSession: { findUnique: jest.fn().mockResolvedValue(createSession()) },
    $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) =>
      fn(tx),
    ),
  };
  const packageUsage = {
    getValidatedUserPackageForBooking: jest.fn().mockResolvedValue(createMembership()),
    consumeSession: jest.fn().mockResolvedValue(undefined),
  };
  const packagesActivation = {
    activateFromCompletedBooking: jest.fn().mockResolvedValue(undefined),
  };
  const schedule = { invalidatePublicCache: jest.fn().mockResolvedValue(undefined) };
  const realtime = { emitBookingSessionChange: jest.fn() };
  const service = new ClientsBookingsRetroactiveService(
    prisma as never,
    packageUsage as never,
    packagesActivation as never,
    schedule as never,
    realtime as never,
  );
  return {
    service,
    prisma,
    tx,
    packageUsage,
    packagesActivation,
    bookingCreate,
    bookingUpdate,
    bookingNoteCreate,
  };
}

describe('ClientsBookingsRetroactiveService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a completed booking and consumes a credit when the visit is missing', async () => {
    const ctx = createService({ existingBooking: null });
    const result = await ctx.service.attachPastSession(
      createActor(),
      'client-1',
      'pkg-1',
      { sessionId: 'session-1', note: 'walk-in after class' },
    );

    expect(result).toEqual({
      bookingId: 'booking-new',
      attachedExistingVisit: false,
    });
    expect(ctx.bookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'client-1',
        sessionId: 'session-1',
        status: BookingStatus.COMPLETED,
        attendedAt: NOW,
      }),
    });
    expect(ctx.packageUsage.consumeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'booking-new',
        requiredSessions: 1,
      }),
    );
    expect(ctx.bookingNoteCreate).toHaveBeenCalled();
    expect(ctx.packagesActivation.activateFromCompletedBooking).toHaveBeenCalledWith(
      'booking-new',
    );
  });

  it('attaches an existing walk-in visit and consumes a credit', async () => {
    const ctx = createService({
      existingBooking: { id: 'booking-existing', consumptions: [] },
    });
    const result = await ctx.service.attachPastSession(
      createActor(),
      'client-1',
      'pkg-1',
      { sessionId: 'session-1' },
    );

    expect(result).toEqual({
      bookingId: 'booking-existing',
      attachedExistingVisit: true,
    });
    expect(ctx.bookingUpdate).toHaveBeenCalledWith({
      where: { id: 'booking-existing' },
      data: {
        status: BookingStatus.COMPLETED,
        cancelledAt: null,
        attendedAt: NOW,
      },
    });
    expect(ctx.packageUsage.consumeSession).toHaveBeenCalledWith(
      expect.objectContaining({ bookingId: 'booking-existing' }),
    );
    expect(ctx.bookingCreate).not.toHaveBeenCalled();
  });

  it('rejects a visit that already has an unrestored consumption', async () => {
    const ctx = createService({
      existingBooking: {
        id: 'booking-existing',
        consumptions: [{ restoredAt: null }],
      },
    });
    await expect(
      ctx.service.attachPastSession(createActor(), 'client-1', 'pkg-1', {
        sessionId: 'session-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a session that has not started', async () => {
    const ctx = createService();
    ctx.prisma.classSession.findUnique.mockResolvedValue({
      ...createSession(),
      startsAt: new Date('2026-08-27T16:00:00.000Z'),
      status: ClassSessionStatus.ACTIVE,
    });
    await expect(
      ctx.service.attachPastSession(createActor(), 'client-1', 'pkg-1', {
        sessionId: 'session-1',
      }),
    ).rejects.toMatchObject({
      message: RETROACTIVE_ATTACH_ERROR.SESSION_NOT_STARTED,
    });
  });

  it('rejects a missing client', async () => {
    const ctx = createService();
    ctx.prisma.user.findFirst.mockResolvedValue(null);
    await expect(
      ctx.service.attachPastSession(createActor(), 'client-1', 'pkg-1', {
        sessionId: 'session-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
