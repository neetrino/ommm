"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientBookingCreateForm } from "@/components/admin/admin-client-booking-create-form";
import type { ClientDetail } from "@/components/admin/admin-clients-types";
import {
  ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE,
  ADMIN_CLIENT_BOOKING_SESSION_LOOKAHEAD_DAYS,
  canSubmitAdminClientBooking,
  filterUpcomingBookableSessions,
  packageOptionLabel,
  sessionRequiresPackage,
  type AdminClientBookingUpcomingSession,
} from "@/components/admin/admin-client-booking-create.helpers";
import {
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS,
  ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal, OMM_DRAWER_NESTED_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import { pickDefaultBookingPackageId } from "@/lib/booking-package-selection";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminClientBookingCreateSheetProps = {
  client: ClientDetail;
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function AdminClientBookingCreateSheet({
  client,
  locale,
  onClose,
  onSuccess,
}: AdminClientBookingCreateSheetProps) {
  const t = useTranslations("adminPages.clients");
  const titleId = useId();
  const formId = useId();
  const [sessions, setSessions] = useState<AdminClientBookingUpcomingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [packages, setPackages] = useState<EligibleBookingPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  const [userPackageId, setUserPackageId] = useState(ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + ADMIN_CLIENT_BOOKING_SESSION_LOOKAHEAD_DAYS);
    const query = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
    setSessionsLoading(true);
    void apiFetch<AdminClientBookingUpcomingSession[]>(
      `/classes/admin/sessions?${query}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setSessions(filterUpcomingBookableSessions(payload));
        setSessionsError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setSessions([]);
          setSessionsError(
            err instanceof ApiError ? err.message : t("bookings.sessionsLoadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSessionsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (sessionId === "") {
      setPackages([]);
      setPackagesError(null);
      setPackagesLoading(false);
      setUserPackageId(ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE);
      return undefined;
    }
    let cancelled = false;
    setPackagesLoading(true);
    setPackagesError(null);
    setUserPackageId(ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE);
    void apiFetch<EligibleBookingPackage[]>(
      `/clients/${client.id}/sessions/${sessionId}/eligible-packages`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setPackages(payload);
        setUserPackageId(pickDefaultBookingPackageId(payload));
        setPackagesError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setPackages([]);
          setPackagesError(
            err instanceof ApiError ? err.message : t("bookings.packagesLoadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPackagesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client.id, sessionId, t]);

  const selectedSession = sessions.find((row) => row.id === sessionId) ?? null;
  const bookablePackages = useMemo(
    () => packages.filter((pkg) => pkg.canBook),
    [packages],
  );
  const duplicateSuffixes = useMemo(
    () => buildDuplicatePlanNameSuffixes(packages),
    [packages],
  );
  const packageRequired =
    selectedSession !== null && sessionRequiresPackage(selectedSession);
  const canSubmit = canSubmitAdminClientBooking({
    sessionId,
    sessionsLoading,
    packagesLoading,
    packagesError,
    packageRequired,
    userPackageId,
    bookablePackageCount: bookablePackages.length,
  });

  const sessionOptions = sessions.map((row) => ({
    value: row.id,
    label: `${formatDateTimeForUi(row.startsAt, locale)} · ${row.classType.name} · ${row.coach.user.name ?? "—"}`,
  }));

  const packageOptions = bookablePackages.map((pkg) => ({
    value: pkg.userPackageId,
    label: packageOptionLabel(
      pkg,
      locale,
      duplicateSuffixes,
      t("bookings.unlimited"),
      (count) => t("bookings.remainingSessions", { count }),
    ),
  }));

  function handleClose(): void {
    if (submitting) {
      return;
    }
    onClose();
  }

  async function handleSubmit(): Promise<void> {
    if (!canSubmit || submitting) {
      return;
    }
    setSubmitting(true);
    setToast(null);
    try {
      const body: { sessionId: string; userPackageId?: string } = { sessionId };
      if (userPackageId !== ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE) {
        body.userPackageId = userPackageId;
      }
      await apiFetch(`/clients/${client.id}/bookings`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      onSuccess();
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : t("bookings.createError"),
        tone: "err",
      });
      setSubmitting(false);
    }
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={submitting}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS}
      panelClassName={ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS}
      backdropClassName={OMM_DRAWER_NESTED_BACKDROP_CLASS}
      lockBodyScroll={false}
      useOverlayPortalRoot
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {t("bookings.addBooking")}
          </h2>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            disabled={submitting}
            onClick={handleClose}
          >
            ×
          </button>
        </div>
      </header>

      <div className={`${ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        {toast ? (
          <AdminCenterToast
            message={toast.message}
            tone={toast.tone}
            onDismiss={() => setToast(null)}
          />
        ) : null}

        <AdminClientBookingCreateForm
          formId={formId}
          sessionsLoading={sessionsLoading}
          sessionsError={sessionsError}
          sessionOptions={sessionOptions}
          sessionId={sessionId}
          onSessionChange={setSessionId}
          packagesLoading={packagesLoading}
          packagesError={packagesError}
          packageOptions={packageOptions}
          userPackageId={userPackageId}
          onPackageChange={setUserPackageId}
          packageRequired={packageRequired}
          noPackageValue={ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE}
          bookablePackageCount={bookablePackages.length}
          disabled={submitting}
          onSubmit={() => void handleSubmit()}
        />
      </div>

      <footer
        className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-wrap items-center justify-end gap-2`}
      >
        <OmmButton
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={handleClose}
        >
          {t("cancelButton")}
        </OmmButton>
        <OmmButton
          type="submit"
          form={formId}
          variant="primary"
          disabled={!canSubmit || submitting}
        >
          {submitting ? t("bookings.submitting") : t("bookings.confirm")}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
  );
}
