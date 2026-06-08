import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { StaffRosterHeaderCell } from "@/components/shared/staff/staff-roster-header-cell";
import {
  STAFF_ROSTER_LIST_EMPHASIZED_HEADER,
  STAFF_ROSTER_LIST_HEADER_CLASS,
  STAFF_ROSTER_LIST_TABLE_CLASS,
} from "@/components/shared/staff/staff-roster-list-layout";
import {
  StaffRosterRow,
  type StaffRosterRowData,
} from "@/components/shared/staff/staff-roster-row";

export type StaffRosterListItem = {
  row: StaffRosterRowData;
  actions: ReactNode;
};

type StaffRosterListProps = {
  locale: string;
  items: readonly StaffRosterListItem[];
  emptyMessage: string;
};

/** Staff roster list — coach groups, future manager views. */
export async function StaffRosterList({
  locale,
  items,
  emptyMessage,
}: StaffRosterListProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });

  if (items.length === 0) {
    return <p className={adminChrome.metaText}>{emptyMessage}</p>;
  }

  return (
    <div className={STAFF_ROSTER_LIST_TABLE_CLASS}>
      <div className={STAFF_ROSTER_LIST_HEADER_CLASS}>
        <StaffRosterHeaderCell label={t("colUserPhone")} icon="userPhone" />
        <StaffRosterHeaderCell
          label={t("colClassType")}
          icon="classType"
          className={STAFF_ROSTER_LIST_EMPHASIZED_HEADER}
        />
        <StaffRosterHeaderCell
          label={t("colDateTime")}
          icon="dateTime"
          className={STAFF_ROSTER_LIST_EMPHASIZED_HEADER}
        />
        <StaffRosterHeaderCell
          label={t("colAttendanceStatus")}
          icon="attendance"
          className={`${STAFF_ROSTER_LIST_EMPHASIZED_HEADER} justify-end`}
        />
      </div>
      {items.map(({ row, actions }) => (
        <StaffRosterRow
          key={row.id}
          locale={locale}
          row={row}
          actions={actions}
        />
      ))}
    </div>
  );
}
