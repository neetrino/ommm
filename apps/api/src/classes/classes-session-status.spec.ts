import { ClassSessionStatus } from '@prisma/client';
import { resolveAdminSessionStatus } from './classes-session.helpers';

describe('resolveAdminSessionStatus', () => {
  const now = new Date('2026-08-20T14:00:00.000Z');

  it('marks ended ACTIVE sessions as FINISHED', () => {
    expect(
      resolveAdminSessionStatus({
        status: ClassSessionStatus.ACTIVE,
        endsAt: new Date('2026-08-20T10:50:00.000Z'),
        bookedCount: 3,
        capacity: 13,
        now,
      }),
    ).toBe(ClassSessionStatus.FINISHED);
  });

  it('marks ended FULL sessions as FINISHED', () => {
    expect(
      resolveAdminSessionStatus({
        status: ClassSessionStatus.FULL,
        endsAt: new Date('2026-08-20T11:50:00.000Z'),
        bookedCount: 6,
        capacity: 6,
        now,
      }),
    ).toBe(ClassSessionStatus.FINISHED);
  });

  it('keeps CANCELLED even after the class end time', () => {
    expect(
      resolveAdminSessionStatus({
        status: ClassSessionStatus.CANCELLED,
        endsAt: new Date('2026-08-20T09:50:00.000Z'),
        bookedCount: 0,
        capacity: 10,
        now,
      }),
    ).toBe(ClassSessionStatus.CANCELLED);
  });

  it('keeps ACTIVE before endsAt and derives FULL from capacity', () => {
    expect(
      resolveAdminSessionStatus({
        status: ClassSessionStatus.ACTIVE,
        endsAt: new Date('2026-08-20T15:00:00.000Z'),
        bookedCount: 10,
        capacity: 10,
        now,
      }),
    ).toBe(ClassSessionStatus.FULL);
  });
});
