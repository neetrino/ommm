import {
  HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

const CLASS_TYPE_GRADIENTS: Readonly<Record<string, string>> = {
  yoga: HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[0],
  pilates: HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[1],
  dances: HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[2],
  dance: HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[2],
};

/** Stable gradient pick for a schedule row — Figma-mapped types first, then hash fallback. */
export function getHomeWeeklyScheduleRowGradient(classType: string): string {
  const normalized = classType.trim().toLowerCase();
  const mapped = CLASS_TYPE_GRADIENTS[normalized];
  if (mapped !== undefined) {
    return mapped;
  }

  if (normalized.length === 0) {
    return HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[0];
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash + normalized.charCodeAt(index) * (index + 1)) % 9973;
  }

  const gradientIndex = hash % HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS.length;
  return HOME_WEEKLY_SCHEDULE_ROW_GRADIENTS[gradientIndex];
}
