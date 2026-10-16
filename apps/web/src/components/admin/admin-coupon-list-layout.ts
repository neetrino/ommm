import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** Code · Discount · Status · Used · Created by · Actions. */
const COUPONS_GRID_CLASS =
  "md:grid-cols-[minmax(0,1.7fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(5rem,0.55fr)_minmax(0,1.1fr)_auto]";

export const ADMIN_COUPONS_LIST_TABLE_CLASS = buildAdminListTableClass(COUPONS_GRID_CLASS);

export const ADMIN_COUPONS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS = ADMIN_LIST_EMPHASIZED_HEADER;

export const ADMIN_COUPONS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;
