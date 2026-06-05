"use client";

import { useTranslations } from "next-intl";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import {
  userListBoardViewButtonId,
  userListBoardViewSwitcherId,
  type UserListBoardViewMode,
  type UserListBoardViewPage,
} from "@/lib/user-list-board-view-preference";

type UserListBoardViewSwitcherProps = {
  pageId: UserListBoardViewPage;
  namespace:
    | "userPages.packages"
    | "userPages.bookings"
    | "userPages.classes"
    | "userPages.payments";
  value: UserListBoardViewMode;
  onChange: (mode: UserListBoardViewMode) => void;
};

const SEGMENT_BASE =
  "inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_BASE} bg-white text-sage-900 shadow-sm hover:bg-white hover:shadow-md`
    : `${SEGMENT_BASE} text-sage-600 hover:bg-white/60 hover:text-sage-900 hover:shadow-sm`;
}

export function UserListBoardViewSwitcher({
  pageId,
  namespace,
  value,
  onChange,
}: UserListBoardViewSwitcherProps) {
  const t = useTranslations(namespace);

  return (
    <div
      id={userListBoardViewSwitcherId(pageId)}
      role="group"
      aria-label={t("viewSwitcherAria")}
      className="inline-flex rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-md"
    >
      <button
        id={userListBoardViewButtonId(pageId, "list")}
        type="button"
        aria-pressed={value === "list"}
        className={segmentClassName(value === "list")}
        onClick={() => onChange("list")}
      >
        <DashboardNavIcon name="listOrdered" className="h-4 w-4 shrink-0" />
        {t("viewList")}
      </button>
      <button
        id={userListBoardViewButtonId(pageId, "board")}
        type="button"
        aria-pressed={value === "board"}
        className={segmentClassName(value === "board")}
        onClick={() => onChange("board")}
      >
        <DashboardNavIcon name="layoutGrid" className="h-4 w-4 shrink-0" />
        {t("viewBoard")}
      </button>
    </div>
  );
}
