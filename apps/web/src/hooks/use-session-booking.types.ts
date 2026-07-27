import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

export type BookSessionResponse = {
  id: string;
};

export type UseSessionBookingOptions = {
  sessionId: string;
  locale: string;
  onBooked?: (bookingId: string) => void;
  onError?: (message: string) => void;
};

export type SessionBookingCachedPurchase = {
  plans: PackageSubscribePlanOption[];
  suggestedPlanId?: string;
};

export const SESSION_BOOKING_PURCHASE_CACHE_PREFIX = "ommm:buyPackage:";
