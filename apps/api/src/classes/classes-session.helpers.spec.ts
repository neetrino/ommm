import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  ADMIN_SESSION_INCLUDE,
  buildBatchSessionData,
} from './classes-session.helpers';
import type { CreateSessionBatchDto } from './dto/create-session-batch.dto';

describe('ADMIN_SESSION_INCLUDE', () => {
  it('counts occupied bookings so past classes still show attendees', () => {
    expect(
      ADMIN_SESSION_INCLUDE._count.select.bookings.where.status.in,
    ).toEqual([
      BookingStatus.BOOKED,
      BookingStatus.COMPLETED,
      BookingStatus.MISSED,
    ]);
  });
});

describe('buildBatchSessionData', () => {
  const baseDto: CreateSessionBatchDto = {
    classTypeId: 'type-1',
    coachId: 'coach-1',
    capacity: 1,
    timezoneOffsetMinutes: -240,
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    slots: [{ weekday: 'MONDAY', startTime: '08:00', endTime: '08:50' }],
  };

  it('creates ACTIVE classes even when the source status is FINISHED', () => {
    const rows = buildBatchSessionData(
      { ...baseDto, status: ClassSessionStatus.FINISHED },
      'Reformer Individual',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe(ClassSessionStatus.ACTIVE);
  });

  it('creates ACTIVE classes even when the source status is FULL', () => {
    const rows = buildBatchSessionData(
      { ...baseDto, status: ClassSessionStatus.FULL },
      'Reformer Individual',
    );
    expect(rows[0]?.status).toBe(ClassSessionStatus.ACTIVE);
  });
});
