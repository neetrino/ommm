"use client";

import { useTranslations } from "next-intl";
import { BookingCardFields } from "@/components/admin/admin-booking-compact-row-fields";
import { ADMIN_BOOKINGS_LIST_ROW_CLASS } from "@/components/admin/admin-bookings-list-layout";
import type { AdminBookingRow } from "@/components/admin/admin-bookings-query";

type AdminBookingCompactRowProps = {
  locale: string;
  row: AdminBookingRow;
  busy: boolean;
  onOpenDetails: () => void;
  onOpenUser: (userId: string) => void;
  onEdit: () => void;
  onMove: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
  onChangeStatus: (status: AdminBookingRow["status"]) => void;
};

export function AdminBookingCompactRow({
  locale,
  row,
  busy,
  onOpenDetails,
  onOpenUser,
  onEdit,
  onMove,
  onDeactivate,
  onActivate,
  onChangeStatus,
}: AdminBookingCompactRowProps) {
  const t = useTranslations("adminPages.bookings");
  const userLabel = row.user.name ?? row.user.email;
  const coachName = row.session.coach.name?.trim();
  const coachLabel = coachName ? coachName : t("coachNotAssigned");

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("viewDetailsFor", { name: userLabel })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={ADMIN_BOOKINGS_LIST_ROW_CLASS}
    >
      <BookingCardFields
        locale={locale}
        row={row}
        busy={busy}
        userLabel={userLabel}
        coachName={coachName}
        coachLabel={coachLabel}
        onOpenUser={onOpenUser}
        onEdit={onEdit}
        onMove={onMove}
        onDeactivate={onDeactivate}
        onActivate={onActivate}
        onChangeStatus={onChangeStatus}
      />
    </article>
  );
}
