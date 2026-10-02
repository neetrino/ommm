import { GUEST_PASSES_ENABLED } from '../bookings/guest-passes.config';

export function resolveGuestSlotsFromPlan(guestCount: number): {
  guestSlotsTotal: number;
  guestSlotsRemaining: number;
} {
  const slots = Math.max(0, guestCount);
  return { guestSlotsTotal: slots, guestSlotsRemaining: slots };
}

export function toUserPackageGuestPassApi(row: {
  guestSlotsTotal: number;
  guestSlotsRemaining: number;
}): {
  guestSlotsTotal: number;
  guestSlotsRemaining: number;
} {
  if (!GUEST_PASSES_ENABLED) {
    return { guestSlotsTotal: 0, guestSlotsRemaining: 0 };
  }
  return {
    guestSlotsTotal: row.guestSlotsTotal,
    guestSlotsRemaining: row.guestSlotsRemaining,
  };
}

export function hasGuestPassSlot(row: {
  guestSlotsRemaining: number;
}): boolean {
  if (!GUEST_PASSES_ENABLED) {
    return false;
  }
  return row.guestSlotsRemaining > 0;
}
