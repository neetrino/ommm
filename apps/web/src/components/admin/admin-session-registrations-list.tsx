"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isActiveSessionRegistration,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatPhoneDisplay } from "@/lib/phone";
import { userDisplayName } from "@/lib/user-display-name";

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

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
}

function memberContactLine(user: SessionRegistrationRow["user"]): string {
  if (user.phone?.trim()) {
    return formatPhoneDisplay(user.phone);
  }
  return user.email.trim();
}

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

  const fetchKey = active ? sessionId : null;
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
          rows: payload.filter(isActiveSessionRegistration),
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
      setFetchResult((prev) =>
        prev === null || prev.key !== fetchKey
          ? prev
          : { ...prev, rows: prev.rows.filter((item) => item.id !== row.id) },
      );
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
      <p className="mt-4 rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-6 text-center text-sm text-sage-600">
        {t("loading")}
      </p>
    );
  }

  if (error !== null) {
    return (
      <p
        className="mt-4 rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-sage-500">{t("empty")}</p>;
  }

  return (
    <>
      <ul className="mt-4 max-h-[min(40vh,20rem)] space-y-2 overflow-y-auto pr-1">
        {rows.map((row) => {
          const displayName = userDisplayName(row.user.name, null, row.user.email);
          return (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/60 px-4 py-3"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-100 font-serif text-sm text-sage-800"
                aria-hidden
              >
                {memberInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sage-900">{displayName}</p>
                <p className="truncate text-xs text-sage-500">{memberContactLine(row.user)}</p>
                <p className="mt-0.5 text-[11px] text-sage-400">
                  {t("registeredAt", {
                    date: formatDateTimeForUi(row.createdAt, locale),
                  })}
                </p>
              </div>
              {canCancel ? (
                <OmmButton
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={busyId !== null}
                  onClick={() => setPendingCancel(row)}
                >
                  {t("cancelButton")}
                </OmmButton>
              ) : null}
            </li>
          );
        })}
      </ul>

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
    </>
  );
}
