"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientBookingHistoryRow } from "@/components/admin/admin-client-booking-history-row";
import type {
  ClientSheetBookingItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";

const COACH_CLIENT_BOOKINGS_PAGE_SIZE = 8;

type FetchResult = {
  key: string;
  items: ClientSheetBookingItem[];
  total: number;
  failed: boolean;
};

type CoachClientBookingsHistoryProps = {
  clientId: string;
  locale: string;
};

function useCoachClientBookings(clientId: string) {
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const [result, setResult] = useState<FetchResult | null>(null);
  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }
  const pageSize = COACH_CLIENT_BOOKINGS_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const fetchKey = `${clientId}:${page}:${pageSize}`;
  useCoachClientBookingsFetch(clientId, fetchKey, pageSize, offset, setResult);
  const current = result?.key === fetchKey ? result : null;
  return {
    page,
    setPage,
    pageSize,
    offset,
    loading: current === null,
    items: current?.items ?? [],
    total: current?.total ?? 0,
    failed: current?.failed ?? false,
  };
}

function useCoachClientBookingsFetch(
  clientId: string,
  fetchKey: string,
  pageSize: number,
  offset: number,
  setResult: (value: FetchResult) => void,
): void {
  useEffect(() => {
    let cancelled = false;
    const path = `/coaches/panel/clients/${encodeURIComponent(clientId)}/bookings?take=${pageSize}&offset=${offset}`;
    void apiFetch<ClientSheetPaginatedResponse<ClientSheetBookingItem>>(path)
      .then((payload) => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: payload.items, total: payload.total, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0, failed: true });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, fetchKey, offset, pageSize, setResult]);
}

export function CoachClientBookingsHistory({
  clientId,
  locale,
}: CoachClientBookingsHistoryProps) {
  const t = useTranslations("coachPages.clients");
  const bookings = useCoachClientBookings(clientId);

  return (
    <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
      <p className="font-medium text-sage-900">{t("bookingHistory")}</p>
      <BookingRows
        loading={bookings.loading}
        failed={bookings.failed}
        items={bookings.items}
        locale={locale}
        emptyLabel={t("noBookings")}
        errorLabel={t("loadBookingsFailed")}
      />
      {bookings.total > bookings.pageSize ? (
        <OmmListPagination
          total={bookings.total}
          page={bookings.page}
          pageSize={bookings.pageSize}
          offset={bookings.offset}
          disabled={bookings.loading}
          onPageChange={bookings.setPage}
          scrollOnPageChange={false}
        />
      ) : null}
    </section>
  );
}

function BookingRows({
  loading,
  failed,
  items,
  locale,
  emptyLabel,
  errorLabel,
}: {
  loading: boolean;
  failed: boolean;
  items: ClientSheetBookingItem[];
  locale: string;
  emptyLabel: string;
  errorLabel: string;
}) {
  if (loading) {
    return <p className="mt-2 text-sm text-sage-500">…</p>;
  }
  if (failed) {
    return <p className="mt-2 text-sm text-sage-600">{errorLabel}</p>;
  }
  if (items.length === 0) {
    return <p className="mt-2 text-sm text-sage-500">{emptyLabel}</p>;
  }
  return (
    <div className="mt-2 space-y-2">
      {items.map((booking) => (
        <AdminClientBookingHistoryRow
          key={booking.id}
          booking={booking}
          locale={locale}
          allowCancel={false}
          busy={false}
          onCancel={() => undefined}
          onReturnSuccess={() => undefined}
          onReturnError={() => undefined}
        />
      ))}
    </div>
  );
}
