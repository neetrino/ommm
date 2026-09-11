import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { formatDateForUi } from "@/lib/date-display";

/** Circular teacher avatar size in the schedule session detail modal. */
export const SCHEDULE_SESSION_DETAIL_AVATAR_SIZE_PX = 48;

export const SCHEDULE_SESSION_DETAIL_AVATAR_CLASS =
  "size-12 shrink-0 rounded-full text-sm";

/** Studio interior used as the session-detail hero banner. */
export const SCHEDULE_SESSION_DETAIL_BANNER_IMAGE =
  "/marketing/home/sections/gallery/home-gallery-pilates-studio.webp";

/** Enter/exit timing for schedule session detail modal (snappy but smooth). */
export const SCHEDULE_SESSION_DETAIL_MOTION_ENTER_MS = 220;
export const SCHEDULE_SESSION_DETAIL_MOTION_EXIT_MS = 200;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Prefer class type copy; fall back to session description. */
export function resolveScheduleSessionDetailDescription(
  session: Pick<MarketingScheduleItem, "classTypeDescription" | "description">,
): string | null {
  const classType = session.classTypeDescription?.trim() ?? "";
  if (classType.length > 0) {
    return classType;
  }
  const sessionDescription = session.description?.trim() ?? "";
  return sessionDescription.length > 0 ? sessionDescription : null;
}

/** Split description into bullet lines (same presentation as Conditions). */
export function splitScheduleSessionDetailDescriptionLines(
  description: string,
): string[] {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.length > 0 ? lines : [description.trim()].filter(Boolean);
}

/** Long date for the hero banner (e.g. September 12, 2026). */
export function formatScheduleSessionDetailDate(
  locale: string,
  isoDate: string | null,
): string | null {
  if (isoDate === null || isoDate.trim().length === 0) {
    return null;
  }
  const trimmed = isoDate.trim();
  const match = ISO_DATE_PATTERN.exec(trimmed);
  if (match === null) {
    const fallback = formatDateForUi(trimmed);
    return fallback.length > 0 ? fallback : null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const localDate = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(localDate);
}
