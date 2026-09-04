import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  ADMIN_LIST_TITLE_SERIF_CLASS,
  ADMIN_LIST_TITLE_TEXT_CLASS,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

const SOLD_PACKAGES_GRID_CLASS =
  "md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(7.5rem,auto)_minmax(7rem,auto)]";

export const ADMIN_SOLD_PACKAGES_LIST_TABLE_CLASS =
  buildAdminListTableClass(SOLD_PACKAGES_GRID_CLASS);

export const ADMIN_SOLD_PACKAGES_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL =
  "min-w-0 text-left text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const ADMIN_SOLD_PACKAGES_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_SOLD_PACKAGES_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_SOLD_PACKAGES_LIST_DATE_CELL = USER_LIST_DATE_CELL;

export const ADMIN_SOLD_PACKAGES_CLIENT_TITLE_CLASS = ADMIN_LIST_TITLE_TEXT_CLASS;

export const ADMIN_SOLD_PACKAGES_CLIENT_META_CLASS =
  "mt-0.5 break-words text-xs text-sage-500";

export const ADMIN_SOLD_PACKAGES_NAME_CLASS = ADMIN_LIST_TITLE_SERIF_CLASS;

export const ADMIN_SOLD_PACKAGES_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
