import {
  hasGuestPassSlot,
  resolveGuestSlotsFromPlan,
} from './packages-guest-pass.helpers';

describe('packages-guest-pass.helpers', () => {
  it('snapshots plan guestCount onto the purchased package', () => {
    expect(resolveGuestSlotsFromPlan(2)).toEqual({
      guestSlotsTotal: 2,
      guestSlotsRemaining: 2,
    });
    expect(resolveGuestSlotsFromPlan(0)).toEqual({
      guestSlotsTotal: 0,
      guestSlotsRemaining: 0,
    });
  });

  it('does not allow a guest booking while guest passes are disabled', () => {
    expect(hasGuestPassSlot({ guestSlotsRemaining: 1 })).toBe(false);
    expect(hasGuestPassSlot({ guestSlotsRemaining: 0 })).toBe(false);
  });
});
