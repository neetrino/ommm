import { ClassSessionStatus } from '@prisma/client';
import { canAdminAssignVisitorToSessionStatus } from './clients-bookings-create.helpers';

describe('canAdminAssignVisitorToSessionStatus', () => {
  it('allows active, full, and finished sessions', () => {
    expect(canAdminAssignVisitorToSessionStatus(ClassSessionStatus.ACTIVE)).toBe(
      true,
    );
    expect(canAdminAssignVisitorToSessionStatus(ClassSessionStatus.FULL)).toBe(
      true,
    );
    expect(
      canAdminAssignVisitorToSessionStatus(ClassSessionStatus.FINISHED),
    ).toBe(true);
  });

  it('blocks cancelled and draft sessions', () => {
    expect(
      canAdminAssignVisitorToSessionStatus(ClassSessionStatus.CANCELLED),
    ).toBe(false);
    expect(canAdminAssignVisitorToSessionStatus(ClassSessionStatus.DRAFT)).toBe(
      false,
    );
  });
});
