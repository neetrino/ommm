"use client";

import { useTranslations } from "next-intl";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";

type AdminScheduleListEmptyStateProps = {
  variant: "selectedDay" | "filtered";
};

/** Polished empty panel for the admin schedule session list. */
export function AdminScheduleListEmptyState({ variant }: AdminScheduleListEmptyStateProps) {
  const tClasses = useTranslations("adminPages.classes");
  const tSchedule = useTranslations("adminPages.schedule");

  const title =
    variant === "selectedDay"
      ? tSchedule("emptyForSelectedDayTitle")
      : tClasses("empty.filteredTitle");
  const body =
    variant === "selectedDay"
      ? tSchedule("emptyForSelectedDayBody")
      : tClasses("empty.filteredBody");

  return (
    <div
      className="flex min-h-[14rem] w-full items-center justify-center rounded-[28px] border border-white/70 bg-white/55 px-6 py-12 shadow-[0_18px_44px_-30px_rgba(45,40,35,0.3)] backdrop-blur-md sm:min-h-[16rem] sm:px-10 sm:py-14"
      role="status"
    >
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-sage-800/10 bg-sand-50 text-sage-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9)]">
          <AdminNavIcon slug="schedule" className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold tracking-[-0.02em] text-sage-900 sm:text-[1.75rem]">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-sm font-light leading-relaxed tracking-wide text-sage-600">
          {body}
        </p>
      </div>
    </div>
  );
}
