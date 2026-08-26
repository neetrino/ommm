/** Owner's own class booking. Guest companions use 1, 2, … */
export const OWNER_BOOKING_GUEST_PASS_SLOT = 0;

export function ownerBookingUniqueWhere(userId: string, sessionId: string) {
  return {
    userId_sessionId_guestPassSlot: {
      userId,
      sessionId,
      guestPassSlot: OWNER_BOOKING_GUEST_PASS_SLOT,
    },
  } as const;
}

export function readGuestPassName(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}
