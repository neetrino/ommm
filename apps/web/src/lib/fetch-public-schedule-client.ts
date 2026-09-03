import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { apiFetch } from "@/lib/api";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import { filterVisiblePublicScheduleItems } from "@/lib/filter-public-schedule-items";
import { buildPublicScheduleRangeQuery } from "@/lib/schedule-session-range";

type PublicScheduleClientResult = {
  items: MarketingScheduleItem[];
  classTypes: string[];
};

let inFlightScheduleFetch: Promise<PublicScheduleClientResult> | null = null;

async function loadPublicScheduleClient(): Promise<PublicScheduleClientResult> {
  const rows = await apiFetch<MarketingScheduleItem[]>(
    `/schedule/public?${buildPublicScheduleRangeQuery()}`,
  );
  if (!Array.isArray(rows)) {
    throw new Error("Invalid public schedule response");
  }
  const activeItems = filterVisiblePublicScheduleItems(rows);
  return {
    items: activeItems,
    classTypes: getScheduleClassTypeValues(activeItems),
  };
}

/** Client-side refresh of the public schedule window (today + 30 days). */
export async function fetchPublicScheduleClient(): Promise<PublicScheduleClientResult> {
  if (inFlightScheduleFetch !== null) {
    return inFlightScheduleFetch;
  }

  const pending = loadPublicScheduleClient().finally(() => {
    if (inFlightScheduleFetch === pending) {
      inFlightScheduleFetch = null;
    }
  });
  inFlightScheduleFetch = pending;
  return pending;
}
