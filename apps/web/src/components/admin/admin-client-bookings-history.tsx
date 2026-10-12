"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { isPastAdminCancelBookingStatus } from "@/components/admin/admin-booking-cancel.helpers";
import { AdminClientBookingHistoryRow } from "@/components/admin/admin-client-booking-history-row";
import type {
  ClientSheetBookingItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

const CLIENT_BOOKINGS_HISTORY_PAGE_SIZE = 5;

type FetchResult = {
  key: string;
  items: ClientSheetBookingItem[];
  total: number;
};

type AdminClientBookingsHistoryProps = {
  clientId: string;
  locale: string;
  active: boolean;
  refreshKey: number;
  allowCancel: boolean;
  onCancelSuccess: () => void;
  onReturnSuccess: () => void;
  onCancelError: (message: string) => void;
};

export function AdminClientBookingsHistory({
  clientId,
  locale,
  active,
  refreshKey,
  allowCancel,
  onCancelSuccess,
  onReturnSuccess,
  onCancelError,
}: AdminClientBookingsHistoryProps) {
  const t = useTranslations("adminPages.clients");
  const [page, setPage] = useState(1);
  const [prevClientId, setPrevClientId] = useState(clientId);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [pendingCancel, setPendingCancel] = useState<ClientSheetBookingItem | null>(
    null,
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setPage(1);
  }

  const pageSize = CLIENT_BOOKINGS_HISTORY_PAGE_SIZE;
  const fetchKey = `${clientId}:${page}:${pageSize}:${refreshKey}`;
  const loading = active && (result === null || result.key !== fetchKey);
  const items = result?.key === fetchKey ? result.items : [];
  const total = result?.key === fetchKey ? result.total : 0;
  const offset = (page - 1) * pageSize;
  const isPastPending =
    pendingCancel !== null && isPastAdminCancelBookingStatus(pendingCancel.status);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<ClientSheetPaginatedResponse<ClientSheetBookingItem>>(
      `/clients/${clientId}/bookings?take=${pageSize}&offset=${offset}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setResult({
          key: fetchKey,
          items: payload.items,
          total: payload.total,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: fetchKey, items: [], total: 0 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [active, clientId, fetchKey, offset, pageSize]);

  async function confirmCancel(): Promise<void> {
    if (pendingCancel === null || busyId !== null) {
      return;
    }
    const booking = pendingCancel;
    setBusyId(booking.id);
    try {
      await apiFetch(`/bookings/admin/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      setPendingCancel(null);
      onCancelSuccess();
    } catch (error) {
      onCancelError(
        error instanceof ApiError ? error.message : t("bookings.cancelError"),
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5">
        <p className="font-medium text-sage-900">{t("drawer.bookingHistory")}</p>
        <div className="mt-2 space-y-2">
          {loading ? null : items.length === 0 ? (
            <p className="text-sm text-sage-500">{t("drawer.noBookings")}</p>
          ) : null}
          {!loading
            ? items.map((booking) => (
                <AdminClientBookingHistoryRow
                  key={booking.id}
                  booking={booking}
                  locale={locale}
                  allowCancel={allowCancel}
                  busy={busyId !== null}
                  onCancel={setPendingCancel}
                  onReturnSuccess={onReturnSuccess}
                  onReturnError={onCancelError}
                />
              ))
            : null}
        </div>
      </section>

      {loading ? <p className="text-sm text-sage-500">…</p> : null}

      <OmmListPagination
        total={total}
        page={page}
        pageSize={pageSize}
        offset={offset}
        disabled={loading}
        onPageChange={setPage}
        scrollOnPageChange={false}
      />

      <OmmConfirmDialog
        isOpen={pendingCancel !== null}
        title={
          isPastPending
            ? t("bookings.cancelPastConfirmTitle")
            : t("bookings.cancelConfirmTitle")
        }
        description={
          pendingCancel === null
            ? t("bookings.cancelConfirmDescription")
            : isPastPending
              ? t("bookings.cancelPastConfirmDescription")
              : t("bookings.cancelConfirmDescriptionNamed", {
                  className: pendingCancel.session.classType.name,
                  when: formatDateTimeForUi(pendingCancel.session.startsAt, locale),
                })
        }
        confirmLabel={t("bookings.cancelConfirmLabel")}
        cancelLabel={t("bookings.cancelConfirmKeep")}
        backdropAriaLabel={t("modalBackdropClose")}
        pending={busyId !== null}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        forceCenteredModal
        dismissAsCloseIcon={isPastPending}
        onConfirm={() => {
          void confirmCancel();
        }}
        onCancel={() => {
          if (busyId === null) {
            setPendingCancel(null);
          }
        }}
      />
    </div>
  );
}
