"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";

type MarketingScheduleAnimatedSectionsProps = {
  scheduleView: ReactNode;
};

export function MarketingScheduleAnimatedSections({
  scheduleView,
}: MarketingScheduleAnimatedSectionsProps) {
  return (
    <MarketingScrollReveal index={0} gridColumns={1} entrance="aboveFold">
      {scheduleView}
    </MarketingScrollReveal>
  );
}
