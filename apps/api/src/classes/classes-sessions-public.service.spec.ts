import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  ClassesSessionsPublicService,
  PUBLIC_CLASS_SESSIONS_LIST_LIMIT,
} from './classes-sessions-public.service';

type FindManyArgs = {
  where: {
    startsAt: { gte: Date; lte: Date };
    status: { in: ClassSessionStatus[] };
  };
  take: number;
  orderBy: { startsAt: 'asc' };
  include: {
    _count: {
      select: {
        bookings: { where: { status: BookingStatus } };
      };
    };
  };
};

describe('ClassesSessionsPublicService', () => {
  it('applies a defensive take limit on public session queries', () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      classSession: { findMany },
    };
    const service = new ClassesSessionsPublicService(prisma as never);
    const from = new Date('2026-06-08T00:00:00.000Z');
    const to = new Date('2026-07-08T23:59:59.999Z');

    void service.listSessionsPublic({ from, to });

    expect(findMany).toHaveBeenCalledTimes(1);
    const calls = findMany.mock.calls as Array<[FindManyArgs]>;
    const args = calls[0][0];
    expect(args.take).toBe(PUBLIC_CLASS_SESSIONS_LIST_LIMIT);
    expect(args.orderBy).toEqual({ startsAt: 'asc' });
    expect(args.where.startsAt).toEqual({ gte: from, lte: to });
    expect(args.where.status.in).toEqual([
      ClassSessionStatus.ACTIVE,
      ClassSessionStatus.FULL,
    ]);
    expect(args.include._count.select.bookings.where.status).toBe(
      BookingStatus.BOOKED,
    );
  });
});
