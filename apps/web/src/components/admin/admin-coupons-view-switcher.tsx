"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

export type CouponViewMode = "list" | "board";

type AdminCouponsViewSwitcherProps = {
  value: CouponViewMode;
  onChange: (mode: CouponViewMode) => void;
};

const SEGMENT_BASE =
  "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/60 hover:text-sage-900`;
}

export function AdminCouponsViewSwitcher({ value, onChange }: AdminCouponsViewSwitcherProps) {
  const t = useTranslations("adminPages.coupons");
  return (
    <div
      role="group"
      aria-label={t("viewSwitcherAria")}
      className="shrink-0 rounded-full border border-white/60 bg-white/55 p-1 shadow-sm"
    >
      <button
        type="button"
        aria-label={t("viewList")}
        title={t("viewList")}
        aria-pressed={value === "list"}
        className={segmentClassName(value === "list")}
        onClick={() => onChange("list")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
      </button>
      <button
        type="button"
        aria-label={t("viewBoard")}
        title={t("viewBoard")}
        aria-pressed={value === "board"}
        className={segmentClassName(value === "board")}
        onClick={() => onChange("board")}
      >
        <DashboardNavIcon name="layoutGrid" className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}
