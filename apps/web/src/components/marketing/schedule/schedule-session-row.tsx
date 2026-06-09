import type { CSSProperties } from "react";
import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_INK,
  SCHEDULE_MUTED,
  SCHEDULE_ROW_DIVIDER,
} from "@/components/marketing/schedule/schedule-public-design";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

export type ScheduleSessionRowProps = {
  row: MarketingScheduleItem;
  bookLabel: string;
  subtitle: string;
  timeLabel: string;
  durationLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  className?: string;
  style?: CSSProperties;
};

export function ScheduleSessionRow({
  row,
  bookLabel,
  subtitle,
  timeLabel,
  durationLabel,
  audience,
  className,
  style,
}: ScheduleSessionRowProps) {
  return (
    <li
      className={`flex flex-col gap-4 py-5 sm:grid sm:grid-cols-[minmax(0,5.5rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-6 ${SCHEDULE_ROW_DIVIDER} ${className ?? ""}`}
      style={style}
    >
      <div className="shrink-0">
        <p className={`text-base font-semibold ${SCHEDULE_INK}`}>{timeLabel}</p>
        <p className={`mt-0.5 text-xs ${SCHEDULE_MUTED}`}>{durationLabel}</p>
      </div>
      <div className="min-w-0">
        <p className={`text-base font-semibold leading-snug ${SCHEDULE_INK}`}>{row.className}</p>
        <p className={`mt-1 text-sm ${SCHEDULE_MUTED}`}>{subtitle}</p>
      </div>
      <div className="flex items-center justify-end">
        <AuthAwareScheduleBookingAction
          sessionId={row.id}
          availableSpots={row.availableSpots}
          sessionStatus={row.status}
          bookLabel={bookLabel}
          audience={audience}
          className={SCHEDULE_BOOK_BTN}
        />
      </div>
    </li>
  );
}
