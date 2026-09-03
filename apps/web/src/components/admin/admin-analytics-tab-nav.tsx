"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  analyticsSectionHref,
  analyticsSectionIdsFor,
  type AnalyticsSectionId,
  type AnalyticsWorkspace,
} from "@/components/admin/admin-analytics-module";
import { buildAnalyticsTabHref } from "@/components/admin/admin-analytics-url";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
  type OliveSegmentedColumnCount,
} from "@/components/ui/olive-segmented-switcher";

const TAB_LABEL_KEY: Record<AnalyticsSectionId, string> = {
  overview: "overview",
  revenue: "revenue",
  bookings: "bookings",
  members: "members",
  coaches: "coaches",
};

export function AdminAnalyticsTabNav({
  className = "",
  workspace = "admin",
}: {
  className?: string;
  workspace?: AnalyticsWorkspace;
}) {
  const t = useTranslations("adminPages.analytics.tabs");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );
  const sections = analyticsSectionIdsFor(workspace);
  const columnCount = sections.length as OliveSegmentedColumnCount;
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => {
      const basePath = analyticsSectionHref(section, workspace);
      return pathname === basePath || pathname.endsWith(basePath);
    }),
  );

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={oliveSegmentedTrackClass(columnCount, className)}
    >
      <span aria-hidden className={oliveSegmentedThumbClass(columnCount, activeIndex)} />
      {sections.map((section) => {
        const basePath = analyticsSectionHref(section, workspace);
        const href = buildAnalyticsTabHref(section, search, workspace);
        const active = pathname === basePath || pathname.endsWith(basePath);
        return (
          <Link
            key={section}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={oliveSegmentedSegmentClassName(active, columnCount)}
          >
            {t(TAB_LABEL_KEY[section])}
          </Link>
        );
      })}
    </nav>
  );
}
