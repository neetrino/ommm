"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  ANALYTICS_SECTION_HREF,
  ANALYTICS_SECTION_IDS,
  type AnalyticsSectionId,
} from "@/components/admin/admin-analytics-module";

const TAB_LABEL_KEY: Record<AnalyticsSectionId, string> = {
  overview: "overview",
  revenue: "revenue",
  bookings: "bookings",
  members: "members",
  coaches: "coaches",
};

export function AdminAnalyticsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("adminPages.analytics.tabs");
  const pathname = usePathname();

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={`flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {ANALYTICS_SECTION_IDS.map((section) => {
        const href = ANALYTICS_SECTION_HREF[section];
        const active = pathname === href || pathname.endsWith(href);
        return (
          <Link
            key={section}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            scroll={false}
            className={
              active
                ? "ommm-admin-pill-tab ommm-admin-pill-tab-active shrink-0 px-4 normal-case tracking-normal"
                : "ommm-admin-pill-tab shrink-0 px-4 normal-case tracking-normal"
            }
          >
            {t(TAB_LABEL_KEY[section])}
          </Link>
        );
      })}
    </nav>
  );
}
