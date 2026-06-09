import { USER_LIST_ROW_CARD } from "@/components/account/user-list-table-layout";

/** Member mobile session card — matches outer card corner radius. */
export const USER_SESSION_MOBILE_CARD_RADIUS_CLASS = "rounded-[28px]";

export const USER_SESSION_MOBILE_CARD_CLASS = [
  USER_LIST_ROW_CARD,
  "ommm-bg-admin overflow-hidden p-0",
  USER_SESSION_MOBILE_CARD_RADIUS_CLASS,
].join(" ");

/** Creme date strip — card-radius on every corner, flush from the card top. */
export const USER_SESSION_MOBILE_CARD_HEADER_CLASS = [
  "ommm-bg-admin relative z-10 flex w-full items-start justify-between gap-3 px-4 py-3",
  USER_SESSION_MOBILE_CARD_RADIUS_CLASS,
].join(" ");

export const USER_SESSION_MOBILE_CARD_BODY_CLASS = [
  "relative z-0 -mt-3 bg-white/95 space-y-4 px-4 pb-4 pt-5",
  "rounded-b-[28px]",
].join(" ");

export const USER_SESSION_MOBILE_CARD_DIVIDER_CLASS = "border-t border-sage-900/10";

/** Today/Tomorrow — book primary colors, compact label size from the original header badge. */
export const USER_SESSION_MOBILE_CARD_RELATIVE_LABEL_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-full bg-sand-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm";
