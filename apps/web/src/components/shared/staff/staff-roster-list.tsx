import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
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
        <span>{t("colUserPhone")}</span>
        <span className={STAFF_ROSTER_LIST_EMPHASIZED_HEADER}>{t("colClassType")}</span>
        <span className={STAFF_ROSTER_LIST_EMPHASIZED_HEADER}>{t("colDateTime")}</span>
        <span className={STAFF_ROSTER_LIST_EMPHASIZED_HEADER}>{t("colAttendanceStatus")}</span>
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
