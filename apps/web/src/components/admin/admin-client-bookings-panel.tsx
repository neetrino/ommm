"use client";

import { useTranslations } from "next-intl";
import { AdminClientBookingCreateBar } from "@/components/admin/admin-client-booking-create-bar";
import type {
  ClientDetail,
  ClientSheetBookingItem,
} from "@/components/admin/admin-clients-types";
import { ClientSheetPaginatedTab } from "@/components/admin/admin-client-sheet-paginated-tab";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

type ClientBookingsPanelProps = {
  client: ClientDetail;
  locale: string;
  active: boolean;
  refreshKey: number;
  allowCreateBooking: boolean;
  onCreateSuccess: () => void;
};

export function ClientBookingsPanel({
  client,
  locale,
  active,
  refreshKey,
  allowCreateBooking,
  onCreateSuccess,
}: ClientBookingsPanelProps) {
  const t = useTranslations("adminPages.clients");

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
        {t("bookings.heading")}
      </h3>

      {allowCreateBooking ? (
        <AdminClientBookingCreateBar
          client={client}
          locale={locale}
          onSuccess={onCreateSuccess}
        />
      ) : null}

      <ClientSheetPaginatedTab<ClientSheetBookingItem>
        clientId={client.id}
        active={active}
        refreshKey={refreshKey}
        endpoint={`/clients/${client.id}/bookings`}
        title={t("drawer.bookingHistory")}
        empty={t("drawer.noBookings")}
        mapItem={(booking) => ({
          id: booking.id,
          main: booking.session.classType.name,
          meta: `${formatDateTimeForUi(booking.session.startsAt, locale)} · ${booking.status} · ${booking.session.level ?? "—"}`,
          extra: booking.cancelledAt
            ? `${t("drawer.cancelled")} ${formatDateForUi(booking.cancelledAt)}`
            : booking.attendedAt
              ? `${t("drawer.attended")} ${formatDateForUi(booking.attendedAt)}`
              : null,
        })}
      />
    </div>
  );
}
