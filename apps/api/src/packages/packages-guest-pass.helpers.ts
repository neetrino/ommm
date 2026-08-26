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
  return {
    guestSlotsTotal: row.guestSlotsTotal,
    guestSlotsRemaining: row.guestSlotsRemaining,
  };
}

export function hasGuestPassSlot(row: {
  guestSlotsRemaining: number;
}): boolean {
  return row.guestSlotsRemaining > 0;
}
