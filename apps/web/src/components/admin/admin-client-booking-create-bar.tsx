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
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import { pickDefaultBookingPackageId } from "@/lib/booking-package-selection";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminClientBookingCreateBarProps = {
  client: ClientDetail;
  locale: string;
  onSuccess: () => void;
};

export function AdminClientBookingCreateBar({
  client,
  locale,
  onSuccess,
}: AdminClientBookingCreateBarProps) {
  const t = useTranslations("adminPages.clients");
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
      `/clients/${client.id}/bookable-sessions?${query}`,
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
  }, [client.id, t]);

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

  function resetForm(): void {
    setSessionId("");
    setPackages([]);
    setUserPackageId(ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE);
    setPackagesError(null);
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
      setToast({ message: t("bookings.createSuccess"), tone: "ok" });
      resetForm();
      onSuccess();
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : t("bookings.createError"),
        tone: "err",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-sand-200/80 bg-white/90 p-4 shadow-sm sm:p-5">
      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
        <div className="min-w-0 flex-1">
          <AdminClientBookingCreateForm
            formId={formId}
            layout="bar"
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
        <OmmButton
          type="submit"
          form={formId}
          variant="primary"
          className="w-full shrink-0 lg:w-auto"
          disabled={!canSubmit || submitting}
        >
          {submitting ? t("bookings.submitting") : t("bookings.confirm")}
        </OmmButton>
      </div>
    </section>
  );
}
