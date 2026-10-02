import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_CELL_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** Image · Amount · Status · Created · Expiration · Available · Actions. */
const GIFT_CARDS_GRID_CLASS = "md:grid-cols-[repeat(7,minmax(0,1fr))]";

/** Same tracks without the actions column. */
const GIFT_CARDS_GRID_READONLY_CLASS = "md:grid-cols-[repeat(6,minmax(0,1fr))]";

export const ADMIN_GIFT_CARDS_LIST_TABLE_CLASS = buildAdminListTableClass(GIFT_CARDS_GRID_CLASS);

export const ADMIN_GIFT_CARDS_LIST_TABLE_READONLY_CLASS = buildAdminListTableClass(
  GIFT_CARDS_GRID_READONLY_CLASS,
);

export const ADMIN_GIFT_CARDS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_GIFT_CARDS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_GIFT_CARDS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_GIFT_CARDS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_GIFT_CARDS_LIST_STATUS_CELL =
  "min-w-0 w-full max-w-full overflow-hidden justify-self-stretch text-left md:self-center md:text-center";

export const ADMIN_GIFT_CARDS_LIST_ACTIONS_CELL =
  "flex w-full min-w-0 shrink-0 justify-self-stretch md:items-center md:justify-center md:self-center";

export const ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
