"use client";

import { useTranslations } from "next-intl";
import { DetailsCard, DetailsStat, DetailsStatStrip } from "@/components/shared/details/details-card";
import {
  CalendarGlyph,
  ClockGlyph,
  TicketGlyph,
  UsersGlyph,
} from "@/components/shared/details/details-glyphs";

export type CoachActivityCounts = {
  totalClasses: number;
  substituteClasses: number;
  assignedClassesCount: number;
  availabilitySlotsCount: number;
};

/** Classes taught, substitutions, assigned class types and availability slots. */
export function CoachActivityStats({ counts }: { counts: CoachActivityCounts }) {
  const t = useTranslations("adminPages.coaches");
  return (
    <DetailsCard>
      <DetailsStatStrip columns={4} bordered={false}>
        <DetailsStat label={t("drawer.totalClasses")} icon={<CalendarGlyph />} tone="mint">
          {counts.totalClasses}
        </DetailsStat>
        <DetailsStat label={t("drawer.substitutions")} icon={<UsersGlyph />} tone="peach">
          {counts.substituteClasses}
        </DetailsStat>
        <DetailsStat label={t("drawer.assignedClasses")} icon={<TicketGlyph />} tone="blue">
          {counts.assignedClassesCount}
        </DetailsStat>
        <DetailsStat label={t("drawer.availabilitySlots")} icon={<ClockGlyph />} tone="sand">
          {counts.availabilitySlotsCount}
        </DetailsStat>
      </DetailsStatStrip>
    </DetailsCard>
  );
}
