import { USER_LIST_ROW_CARD } from "@/components/account/user-list-table-layout";

export const USER_SESSION_MOBILE_CARD_CLASS = [
  USER_LIST_ROW_CARD,
  "overflow-hidden rounded-[28px] bg-transparent p-0",
].join(" ");

export const USER_SESSION_MOBILE_CARD_HEADER_CLASS =
  "ommm-bg-admin relative z-10 flex w-full items-start justify-between gap-3 rounded-t-[28px] rounded-b-[20px] px-4 py-3";

export const USER_SESSION_MOBILE_CARD_BODY_CLASS =
  "relative z-0 rounded-b-[28px] bg-white/95 space-y-4 px-4 pb-4 pt-3";

export const USER_SESSION_MOBILE_CARD_DIVIDER_CLASS = "border-t border-sage-900/10";

/** Today/Tomorrow — book primary colors, compact label size from the original header badge. */
export const USER_SESSION_MOBILE_CARD_RELATIVE_LABEL_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-sand-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm";
