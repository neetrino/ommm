import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

const CONTENT_POSTS_GRID_CLASS =
  "md:grid-cols-[minmax(0,auto)_minmax(0,1.4fr)_minmax(7rem,auto)_minmax(7rem,auto)_minmax(9rem,auto)_1fr_auto]";

const CONTENT_POSTS_MOBILE_TYPE_STATUS_CELL_CLASS =
  "min-w-0 max-md:w-auto md:flex md:w-full md:max-w-full md:justify-center md:justify-self-stretch md:overflow-hidden md:text-left";

/** Posts per page on Admin / Manager / Content Admin lists. */
export const CONTENT_POSTS_LIST_PAGE_SIZE = 10;

export const CONTENT_POSTS_LIST_TABLE_CLASS = buildAdminListTableClass(CONTENT_POSTS_GRID_CLASS);

export const CONTENT_POSTS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const CONTENT_POSTS_LIST_ROW_CLASS = `${ADMIN_LIST_ROW_CLASS} relative`;

export const CONTENT_POSTS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const CONTENT_POSTS_LIST_CELL = USER_LIST_CELL_CLASS;

/** Type + status sit together in the card’s top-right on phone; table columns on desktop. */
export const CONTENT_POSTS_LIST_TYPE_STATUS_CLUSTER_CLASS = [
  "flex flex-wrap items-center justify-end gap-1.5",
  "max-md:absolute max-md:right-3 max-md:top-3 max-md:z-10 max-md:max-w-[12rem]",
  "md:contents",
].join(" ");

export const CONTENT_POSTS_LIST_TYPE_CELL = CONTENT_POSTS_MOBILE_TYPE_STATUS_CELL_CLASS;

export const CONTENT_POSTS_LIST_STATUS_CELL = CONTENT_POSTS_MOBILE_TYPE_STATUS_CELL_CLASS;

export const CONTENT_POSTS_LIST_DATE_CELL =
  `${USER_LIST_DATE_CELL} md:text-center`;

export const CONTENT_POSTS_LIST_ACTIONS_CELL = `${USER_LIST_ACTIONS_CELL} max-md:hidden`;

export const CONTENT_POSTS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const CONTENT_POSTS_LIST_SPACER_CELL = USER_LIST_SPACER_CELL;

export const CONTENT_POSTS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
