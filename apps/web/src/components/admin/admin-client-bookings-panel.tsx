"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminClientBookingCreateSheet } from "@/components/admin/admin-client-booking-create-sheet";
import type {
  ClientDetail,
  ClientSheetBookingItem,
} from "@/components/admin/admin-clients-types";
import { replaceAdminClientsSearchParams } from "@/components/admin/admin-clients-query";
import { ClientSheetPaginatedTab } from "@/components/admin/admin-client-sheet-paginated-tab";
import {
  CLIENT_ADD_BOOKING_QUERY_KEY,
  CLIENT_ADD_BOOKING_QUERY_VALUE,
  CLIENT_PROFILE_TAB_QUERY_KEY,
  CLIENT_SHEET_TAB_BOOKINGS,
} from "@/components/admin/admin-client-sheet-tabs";
import { OmmButton } from "@/components/ui/omm-button";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const createOpen =
    allowCreateBooking &&
    searchParams.get(CLIENT_ADD_BOOKING_QUERY_KEY) === CLIENT_ADD_BOOKING_QUERY_VALUE;

  const openCreate = () => {
    replaceAdminClientsSearchParams(pathname, router, (params) => {
      params.set(CLIENT_PROFILE_TAB_QUERY_KEY, CLIENT_SHEET_TAB_BOOKINGS);
      params.set(CLIENT_ADD_BOOKING_QUERY_KEY, CLIENT_ADD_BOOKING_QUERY_VALUE);
    });
  };

  const closeCreate = () => {
    replaceAdminClientsSearchParams(pathname, router, (params) => {
      params.delete(CLIENT_ADD_BOOKING_QUERY_KEY);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-sage-800">
          {t("bookings.heading")}
        </h3>
        {allowCreateBooking ? (
          <OmmButton type="button" variant="primary" onClick={openCreate}>
            {t("bookings.addBooking")}
          </OmmButton>
        ) : null}
      </div>

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

      {createOpen ? (
        <AdminClientBookingCreateSheet
          client={client}
          locale={locale}
          onClose={closeCreate}
          onSuccess={() => {
            closeCreate();
            onCreateSuccess();
          }}
        />
      ) : null}
    </div>
  );
}
