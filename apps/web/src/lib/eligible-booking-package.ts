export type EligibleBookingPackage = {
  userPackageId: string;
  planId: string;
  planName: string;
  remainingSessions: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  isUnlimited: boolean;
  canBook: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  includedCategories: string[];
  guestSlotsTotal?: number;
  guestSlotsRemaining?: number;
  canBookGuest?: boolean;
};
