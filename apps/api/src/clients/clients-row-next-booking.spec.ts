import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BookingStatus } from '@prisma/client';
import {
  attachNextBookingsToRows,
  pickNextBookingFromBookings,
} from './clients-row-next-booking';

void describe('clients-row-next-booking', () => {
  const nowMs = Date.parse('2026-07-29T12:00:00.000Z');

  void it('picks earliest upcoming BOOKED booking', () => {
    const picked = pickNextBookingFromBookings(
      [
        {
          id: 'b-later',
          status: BookingStatus.BOOKED,
          session: {
            startsAt: new Date('2026-08-02T10:00:00.000Z'),
            classType: { name: 'Yoga' },
          },
        },
        {
          id: 'b-soon',
          status: BookingStatus.BOOKED,
          session: {
            startsAt: new Date('2026-07-30T10:00:00.000Z'),
            classType: { name: 'Reformer' },
          },
        },
        {
          id: 'b-past',
          status: BookingStatus.BOOKED,
          session: {
            startsAt: new Date('2026-07-28T10:00:00.000Z'),
            classType: { name: 'Mat' },
          },
        },
        {
          id: 'b-cancelled',
          status: BookingStatus.CANCELLED,
          session: {
            startsAt: new Date('2026-07-30T09:00:00.000Z'),
            classType: { name: 'Cancel' },
          },
        },
      ],
      nowMs,
    );

    assert.deepEqual(picked, {
      id: 'b-soon',
      startsAt: '2026-07-30T10:00:00.000Z',
      classTypeName: 'Reformer',
    });
  });

  void it('returns null when no upcoming booked sessions', () => {
    assert.equal(
      pickNextBookingFromBookings(
        [
          {
            id: 'b1',
            status: BookingStatus.COMPLETED,
            session: {
              startsAt: new Date('2026-07-30T10:00:00.000Z'),
              classType: { name: 'Yoga' },
            },
          },
        ],
        nowMs,
      ),
      null,
    );
  });

  void it('attachNextBookingsToRows overwrites with batch map', () => {
    const rows = attachNextBookingsToRows(
      [
        {
          id: 'u1',
          nextBooking: {
            id: 'old',
            startsAt: '2026-08-01T00:00:00.000Z',
            classTypeName: 'Old',
          },
        },
        { id: 'u2', nextBooking: null },
      ],
      new Map([
        [
          'u1',
          {
            id: 'new',
            startsAt: '2026-07-30T10:00:00.000Z',
            classTypeName: 'Reformer',
          },
        ],
      ]),
    );

    assert.equal(rows[0]?.nextBooking?.id, 'new');
    assert.equal(rows[1]?.nextBooking, null);
  });
});
