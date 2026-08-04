"use client";

import { useTranslations } from "next-intl";
import { AdminClientBookingCreateBar } from "@/components/admin/admin-client-booking-create-bar";
import { AdminClientBookingsHistory } from "@/components/admin/admin-client-bookings-history";
import type { ClientDetail } from "@/components/admin/admin-clients-types";

type ClientBookingsPanelProps = {
  client: ClientDetail;
  locale: string;
  active: boolean;
  refreshKey: number;
  allowCreateBooking: boolean;
  allowCancelBooking: boolean;
  onCreateSuccess: () => void;
  onCancelSuccess: () => void;
  onCancelError: (message: string) => void;
};

export function ClientBookingsPanel({
  client,
  locale,
  active,
  refreshKey,
  allowCreateBooking,
  allowCancelBooking,
  onCreateSuccess,
  onCancelSuccess,
  onCancelError,
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

      <AdminClientBookingsHistory
        clientId={client.id}
        locale={locale}
        active={active}
        refreshKey={refreshKey}
        allowCancel={allowCancelBooking}
        onCancelSuccess={onCancelSuccess}
        onCancelError={onCancelError}
      />
    </div>
  );
}
