"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

export function AdminHomeSectionsStatusNotice() {
  const t = useTranslations("adminPages.settings.homeSections");

  return (
    <aside
      className="mt-4 w-full max-w-lg rounded-[20px] border border-sand-200/55 bg-gradient-to-b from-white/75 to-sand-50/45 px-4 py-3.5 text-center shadow-[0_10px_28px_-22px_rgba(45,40,35,0.18)] backdrop-blur-sm sm:px-5 sm:py-4"
      role="note"
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-600 shadow-[0_6px_16px_-12px_rgba(45,40,35,0.25)]">
          <DashboardNavIcon name="bell" className="h-3.5 w-3.5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-pretty text-sm font-medium leading-snug tracking-[0.01em] text-sage-800">
            {t("statusNoticeTitle")}
          </p>
          <p className="ommm-body-muted text-pretty leading-relaxed">
            {t("statusNoticeDetail")}
          </p>
        </div>
      </div>
    </aside>
  );
}
