import { apiFetch } from "@/lib/api";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

let inFlightWaitlist: Promise<UserWaitlistRow[]> | null = null;

/** Coalesces concurrent `/waitlist/me` calls into a single in-flight request. */
export async function fetchMemberWaitlistDeduped(): Promise<UserWaitlistRow[]> {
  if (inFlightWaitlist) {
    return inFlightWaitlist;
  }
  inFlightWaitlist = apiFetch<UserWaitlistRow[]>("/waitlist/me").finally(() => {
    inFlightWaitlist = null;
  });
  return inFlightWaitlist;
}
