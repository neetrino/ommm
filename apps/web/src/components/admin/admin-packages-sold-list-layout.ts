import {
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
} from "@/components/admin/admin-list-table-layout";

export const ADMIN_SOLD_PACKAGES_BOARD_GRID_CLASS =
  "grid w-full min-w-0 max-w-full items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3";

export const ADMIN_SOLD_PACKAGES_BOARD_CARD_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group flex h-full w-full min-w-0 flex-col gap-4 p-5 text-left sm:p-6",
].join(" ");

export const ADMIN_SOLD_PACKAGES_BOARD_AVATAR_CLASS = [
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
  "border border-sand-200/80 bg-gradient-to-b from-sand-50 to-white",
  "text-sm font-semibold text-sand-800",
  "shadow-[inset_0_1px_0_rgb(255_255_255_/_0.95)]",
].join(" ");

export const ADMIN_SOLD_PACKAGES_BOARD_EYEBROW_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500";

export const ADMIN_SOLD_PACKAGES_BOARD_PACKAGE_CLASS =
  "min-w-0 font-serif text-xl leading-snug tracking-tight text-sage-950 sm:text-2xl";

export const ADMIN_SOLD_PACKAGES_BOARD_META_ROW_CLASS =
  "mt-auto flex items-end justify-between gap-3 border-t border-sand-500/10 pt-4";
