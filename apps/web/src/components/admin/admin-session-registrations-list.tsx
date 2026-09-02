"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import {
  compareSessionRegistrationRows,
  isRosterSessionRegistration,
  isStaffCancellableSessionRegistration,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import { AdminSessionRegistrationRow } from "@/components/admin/admin-session-registration-row";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

type FetchResult = {
  key: string;
  rows: readonly SessionRegistrationRow[];
  error: string | null;
};

type AdminSessionRegistrationsListProps = {
  sessionId: string;
  locale: string;
  /** When false, skip fetch (e.g. tab not active). */
  active: boolean;
  canCancel?: boolean;
  onBookingCancelled?: () => void;
  onNotice?: (message: string, tone: "ok" | "err") => void;
};

const LIST_ROOT_CLASS = "mt-3 flex min-h-0 flex-1 flex-col";
const LIST_SCROLL_CLASS = "min-h-0 flex-1 overflow-y-auto overscroll-y-contain";

export function AdminSessionRegistrationsList({
  sessionId,
  locale,
  active,
  canCancel = true,
  onBookingCancelled,
  onNotice,
}: AdminSessionRegistrationsListProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const tClasses = useTranslations("adminPages.classes");
  const [fetchResult, setFetchResult] = useState<FetchResult | null>(null);
  const [pendingCancel, setPendingCancel] = useState<SessionRegistrationRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active && selectedClientId !== null) {
      setSelectedClientId(null);
    }
  }

  const fetchKey = active ? `${sessionId}:${String(reloadNonce)}` : null;
  const loading = fetchKey !== null && (fetchResult === null || fetchResult.key !== fetchKey);
  const rows = fetchResult?.key === fetchKey ? fetchResult.rows : [];
  const error = fetchResult?.key === fetchKey ? fetchResult.error : null;

  useEffect(() => {
    if (fetchKey === null) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<SessionRegistrationRow[]>(
      `/bookings/admin?sessionId=${encodeURIComponent(sessionId)}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setFetchResult({
          key: fetchKey,
          rows: payload
            .filter(isRosterSessionRegistration)
            .slice()
            .sort(compareSessionRegistrationRows),
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setFetchResult({
          key: fetchKey,
          rows: [],
          error: err instanceof ApiError ? err.message : t("error"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchKey, sessionId, t]);

  async function confirmCancel(): Promise<void> {
    if (pendingCancel === null || busyId !== null) {
      return;
    }
    const row = pendingCancel;
    setBusyId(row.id);
    try {
      await apiFetch(`/bookings/admin/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      setReloadNonce((value) => value + 1);
      setPendingCancel(null);
      onBookingCancelled?.();
      onNotice?.(t("cancelSuccess"), "ok");
    } catch (err) {
      onNotice?.(
        err instanceof ApiError ? err.message : tClasses("messages.genericError"),
        "err",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (!active) {
    return null;
  }

  if (loading) {
    return (
      <p className="mt-3 py-10 text-center text-sm text-sage-500" aria-live="polite">
        {t("loading")}
      </p>
    );
  }

  if (error !== null) {
    return (
      <p
        className="mt-3 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="mt-3 py-10 text-center text-sm text-sage-500">
        {tClasses("sheetTabs.bookingsEmpty")}
      </p>
    );
  }

  return (
    <>
      <div className={LIST_ROOT_CLASS}>
        <ul className={LIST_SCROLL_CLASS}>
          {rows.map((row) => (
            <AdminSessionRegistrationRow
              key={row.id}
              row={row}
              locale={locale}
              canCancel={canCancel && isStaffCancellableSessionRegistration(row)}
              busy={busyId !== null}
              onCancel={() => setPendingCancel(row)}
              onMemberClick={setSelectedClientId}
            />
          ))}
        </ul>
      </div>

      <OmmConfirmDialog
        isOpen={pendingCancel !== null}
        title={t("cancelConfirmTitle")}
        description={t("cancelConfirmDescription")}
        confirmLabel={
          busyId !== null ? tClasses("savingButton") : t("cancelConfirmLabel")
        }
        cancelLabel={tClasses("confirmDialogNo")}
        backdropAriaLabel={tClasses("confirmDialogBackdrop")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        forceCenteredModal
        pending={pendingCancel !== null && busyId === pendingCancel.id}
        onConfirm={() => {
          void confirmCancel();
        }}
        onCancel={() => {
          if (busyId === null) {
            setPendingCancel(null);
          }
        }}
      />
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        useOverlayPortalRoot
      />
    </>
  );
}
