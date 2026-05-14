import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";
import { serverApiJson } from "@/lib/server-api";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";

type MarketingScheduleDataResult = {
  items: MarketingScheduleItem[];
  classTypes: string[];
  loadErrorStatus: number | null;
};

const DAY_ORDER: Record<MarketingScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function toSorted(items: MarketingScheduleItem[]): MarketingScheduleItem[] {
  return [...items].sort((a, b) => {
    const dayDelta = DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek];
    if (dayDelta !== 0) {
      return dayDelta;
    }
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function fetchPublicScheduleItems(
  cookieHeader: string,
): Promise<MarketingScheduleDataResult> {
  const res = await serverApiJson<MarketingScheduleItem[]>(
    "/schedule/public",
    cookieHeader,
  );
  if (!res.ok) {
    return {
      items: [],
      classTypes: [],
      loadErrorStatus: res.status,
    };
  }
  const activeItems = res.data.filter((item) => item.isActive);
  return {
    items: toSorted(activeItems),
    classTypes: getScheduleClassTypeValues(activeItems),
    loadErrorStatus: null,
  };
}
