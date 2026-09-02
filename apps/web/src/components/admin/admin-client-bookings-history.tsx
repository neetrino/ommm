"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type {
  ClientSheetBookingItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import {
  isDashboardShellRole,
  SESSION_REGISTRATION_STAFF_CANCELLABLE_STATUSES,
  sessionCancelledByDisplayName,
} from "@/components/admin/admin-session-registrations-types";
import { BanGlyph } from "@/components/ui/admin-action-glyphs";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

function isCancellableBooking(booking: ClientSheetBookingItem): boolean {
  return SESSION_REGISTRATION_STAFF_CANCELLABLE_STATUSES.some(
    (status) => status === booking.status,
  );
}

const CLIENT_BOOKINGS_HISTORY_PAGE_SIZE = 5;
const CANCEL_BUTTON_CLASS = [
  "inline-flex shrink-0 items-center gap-1.5 rounded-full",
  "border border-rose-200/80 bg-rose-50/80 px-2.5 py-1",
  "text-xs font-medium text-rose-700",
  "transition hover:bg-rose-100/90",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");
const CANCEL_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

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
  onCancelError: (message: string) => void;
};

export function AdminClientBookingsHistory({
  clientId,
  locale,
  active,
  refreshKey,
  allowCancel,
  onCancelSuccess,
  onCancelError,
}: AdminClientBookingsHistoryProps) {
  const t = useTranslations("adminPages.clients");
  const tRoles = useTranslations("dashboard.shell.roles");
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
            ? items.map((booking) => {
                const showCancel =
                  allowCancel && isCancellableBooking(booking);
                const extra = booking.cancelledAt
                  ? `${t("drawer.cancelled")} ${formatDateForUi(booking.cancelledAt)}`
                  : booking.attendedAt
                    ? `${t("drawer.attended")} ${formatDateForUi(booking.attendedAt)}`
                    : null;
                const cancelledBy = booking.cancelledBy ?? null;
                const cancelledByLabel =
                  cancelledBy === null
                    ? null
                    : t("drawer.cancelledBy", {
                        name: sessionCancelledByDisplayName(cancelledBy),
                        role: isDashboardShellRole(cancelledBy.role)
                          ? tRoles(cancelledBy.role)
                          : cancelledBy.role,
                      });
                const signedUp = `${t("drawer.signedUp")} ${formatDateTimeForUi(booking.createdAt, locale)}`;

                return (
                  <div
                    key={booking.id}
                    className="flex items-start gap-2 rounded-xl border border-white/70 bg-white/65 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sage-900">
                        {booking.session.classType.name}
                      </p>
                      {booking.guestName ? (
                        <p className="text-xs text-sand-800">
                          {t("drawer.guestPass")}: {booking.guestName}
                        </p>
                      ) : null}
                      <p className="text-xs text-sage-600">
                        {`${formatDateTimeForUi(booking.session.startsAt, locale)} · ${booking.status} · ${booking.session.level ?? "—"}`}
                      </p>
                      <p className="mt-1 text-xs text-sage-500">{signedUp}</p>
                      {extra !== null ? (
                        <p className="text-xs text-sage-500">{extra}</p>
                      ) : null}
                      {cancelledByLabel !== null ? (
                        <p className="text-xs font-medium text-rose-700">{cancelledByLabel}</p>
                      ) : null}
                    </div>
                    {showCancel ? (
                      <button
                        type="button"
                        className={CANCEL_BUTTON_CLASS}
                        disabled={busyId !== null}
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingCancel(booking);
                        }}
                      >
                        <span>{t("bookings.cancelButton")}</span>
                        <BanGlyph className={CANCEL_ICON_CLASS} />
                      </button>
                    ) : null}
                  </div>
                );
              })
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
        title={t("bookings.cancelConfirmTitle")}
        description={
          pendingCancel === null
            ? t("bookings.cancelConfirmDescription")
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
