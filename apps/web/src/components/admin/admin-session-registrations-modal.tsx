"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminSessionAddRegistration } from "@/components/admin/admin-session-add-registration";
import { AdminSessionRegistrationRow } from "@/components/admin/admin-session-registration-row";
import {
  isOccupiedSessionRegistration,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import {
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminSessionRegistrationsModalProps = {
  isOpen: boolean;
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  locale: string;
  booked: number;
  capacity: number;
  canAdd?: boolean;
  onClose: () => void;
};

type RegistrationsFetchResult = {
  key: string;
  rows: readonly SessionRegistrationRow[];
  error: string | null;
};

export function AdminSessionRegistrationsModal({
  isOpen,
  sessionId,
  sessionTitle,
  startsAt,
  locale,
  booked,
  capacity,
  canAdd = false,
  onClose,
}: AdminSessionRegistrationsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AdminSessionRegistrationsSheet
      sessionId={sessionId}
      sessionTitle={sessionTitle}
      startsAt={startsAt}
      locale={locale}
      booked={booked}
      capacity={capacity}
      canAdd={canAdd}
      onClose={onClose}
    />
  );
}

function AdminSessionRegistrationsSheet({
  sessionId,
  sessionTitle,
  startsAt,
  locale,
  booked,
  capacity,
  canAdd,
  onClose,
}: Omit<AdminSessionRegistrationsModalProps, "isOpen"> & { canAdd: boolean }) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const titleId = useId();
  const descId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const [fetchResult, setFetchResult] = useState<RegistrationsFetchResult | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const fetchKey = `${sessionId}:${refreshNonce}`;
  const loading = fetchResult === null || fetchResult.key !== fetchKey;
  const rows = useMemo(
    () => (fetchResult?.key === fetchKey ? fetchResult.rows : []),
    [fetchKey, fetchResult],
  );
  const error = fetchResult?.key === fetchKey ? fetchResult.error : null;
  const rosterCount = fetchResult?.key === fetchKey ? fetchResult.rows.length : booked;
  const clientDrawerOpen = selectedClientId !== null;
  const registeredUserIds = useMemo(
    () => new Set(rows.map((row) => row.user.id)),
    [rows],
  );

  useEffect(() => {
    let cancelled = false;
    void apiFetch<SessionRegistrationRow[]>(
      `/bookings/admin?sessionId=${encodeURIComponent(sessionId)}`,
    )
      .then((payload) => {
        if (!cancelled) {
          setFetchResult({
            key: fetchKey,
            rows: payload.filter(isOccupiedSessionRegistration),
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchResult({
            key: fetchKey,
            rows: [],
            error: err instanceof ApiError ? err.message : t("error"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fetchKey, sessionId, t]);

  return (
    <>
      <AdminSheetPortal
        presentation="drawer"
        isOpen={sheetOpen}
        onClose={requestClose}
        onAfterClose={onAfterClose}
        dialogRole="dialog"
        ariaLabelledBy={titleId}
        ariaDescribedBy={descId}
        backdropAriaLabel={t("backdropClose")}
        drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
        closeOnEscape={!clientDrawerOpen}
        lockBodyScroll={!clientDrawerOpen}
      >
        <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
                {t("title")}
              </h2>
              <p id={descId} className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>
                {sessionTitle}
              </p>
              <p className="text-xs text-sage-500">
                {formatDateTimeForUi(startsAt, locale)}
              </p>
              <p className="text-sm font-medium text-sage-800">
                {t("subtitle", { count: rosterCount, capacity })}
              </p>
            </div>
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("closeButton")}
              onClick={requestClose}
            >
              <CloseGlyph />
            </button>
          </div>
        </header>
        <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 space-y-4`}>
          {canAdd ? (
            <AdminSessionAddRegistration
              sessionId={sessionId}
              startsAt={startsAt}
              booked={rosterCount}
              capacity={capacity}
              registeredUserIds={registeredUserIds}
              onAdded={() => setRefreshNonce((value) => value + 1)}
            />
          ) : null}
          <RosterBody
            loading={loading}
            error={error}
            rows={rows}
            locale={locale}
            onMemberClick={setSelectedClientId}
          />
        </div>
        <div className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
          <div className="flex justify-end">
            <OmmButton type="button" variant="secondary" size="sm" onClick={requestClose}>
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

function RosterBody({
  loading,
  error,
  rows,
  locale,
  onMemberClick,
}: {
  loading: boolean;
  error: string | null;
  rows: readonly SessionRegistrationRow[];
  locale: string;
  onMemberClick: (userId: string) => void;
}) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  if (loading) {
    return <p className="py-8 text-center text-sm text-sage-600">{t("loading")}</p>;
  }
  if (error !== null) {
    return (
      <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
        {error}
      </p>
    );
  }
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-sage-600">{t("empty")}</p>;
  }
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <AdminSessionRegistrationRow
          key={row.id}
          row={row}
          locale={locale}
          variant="card"
          onMemberClick={onMemberClick}
        />
      ))}
    </ul>
  );
}

function CloseGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
