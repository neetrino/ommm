"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminSessionRegistrationRow } from "@/components/admin/admin-session-registration-row";
import {
  isOccupiedSessionRegistration,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

const MODAL_PANEL_CLASS =
  "w-full max-w-lg rounded-[28px] border border-sand-200/80 bg-white p-6 shadow-[0_24px_48px_-28px_rgba(45,40,35,0.35)]";

type AdminSessionRegistrationsModalProps = {
  isOpen: boolean;
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  locale: string;
  booked: number;
  capacity: number;
  onClose: () => void;
};

export function AdminSessionRegistrationsModal({
  isOpen,
  sessionId,
  sessionTitle,
  startsAt,
  locale,
  booked,
  capacity,
  onClose,
}: AdminSessionRegistrationsModalProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const titleId = useId();
  const descId = useId();
  type RegistrationsFetchResult = {
    key: string;
    rows: readonly SessionRegistrationRow[];
    error: string | null;
  };

  const [fetchResult, setFetchResult] = useState<RegistrationsFetchResult | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen && selectedClientId !== null) {
      setSelectedClientId(null);
    }
  }
  const clientDrawerOpen = selectedClientId !== null;
  const fetchKey = isOpen ? sessionId : null;
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
          rows: payload.filter(isOccupiedSessionRegistration),
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

  const subtitle = useMemo(
    () =>
      t("subtitle", {
        count: booked,
        capacity,
      }),
    [booked, capacity, t],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <AdminSheetPortal presentation="modal"
        isOpen={isOpen}
        onClose={onClose}
        dialogRole="dialog"
        ariaLabelledBy={titleId}
        ariaDescribedBy={descId}
        backdropAriaLabel={t("backdropClose")}
        modalOverlayClassName="ommm-modal-overlay z-[110] p-4"
        modalPanelClassName={MODAL_PANEL_CLASS}
        closeOnEscape={!clientDrawerOpen}
        lockBodyScroll={!clientDrawerOpen}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
              {t("title")}
            </h2>
            <p id={descId} className="text-sm leading-relaxed text-sage-700">
              {sessionTitle}
            </p>
            <p className="text-xs text-sage-500">
              {formatDateTimeForUi(startsAt, locale)}
            </p>
            <p className="text-sm font-medium text-sage-800">{subtitle}</p>
          </div>

          {loading ? (
            <p className="rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-6 text-center text-sm text-sage-600">
              {t("loading")}
            </p>
          ) : error !== null ? (
            <p
              className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {error}
            </p>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-6 text-center text-sm text-sage-600">
              {t("empty")}
            </p>
          ) : (
            <ul className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto pr-1">
              {rows.map((row) => (
                <AdminSessionRegistrationRow
                  key={row.id}
                  row={row}
                  locale={locale}
                  variant="card"
                  onMemberClick={setSelectedClientId}
                />
              ))}
            </ul>
          )}

          <div className="flex justify-end pt-1">
            <OmmButton type="button" variant="secondary" size="sm" onClick={onClose}>
              {t("closeButton")}
            </OmmButton>
          </div>
        </div>
      </AdminSheetPortal>
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        useOverlayPortalRoot
      />
    </>
  );
}
