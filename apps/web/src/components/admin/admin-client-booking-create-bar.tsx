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
  sessionOptionLabel,
  sessionRequiresPackage,
  type AdminClientBookingUpcomingSession,
} from "@/components/admin/admin-client-booking-create.helpers";
import type { EligibleBookingPackage } from "@/components/account/booking-package-select-modal";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { buildDuplicatePlanNameSuffixes } from "@/lib/booking-package-labels";
import { pickDefaultBookingPackageId } from "@/lib/booking-package-selection";

type AdminClientBookingCreateBarProps = {
  client: ClientDetail;
  locale: string;
  onSuccess: () => void;
};

type SessionsFetchResult = {
  key: string;
  sessions: AdminClientBookingUpcomingSession[];
  error: string | null;
};

type PackagesFetchResult = {
  key: string;
  packages: EligibleBookingPackage[];
  userPackageId: string;
  error: string | null;
};

export function AdminClientBookingCreateBar({
  client,
  locale,
  onSuccess,
}: AdminClientBookingCreateBarProps) {
  const t = useTranslations("adminPages.clients");
  const formId = useId();
  const [sessionsResult, setSessionsResult] = useState<SessionsFetchResult | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [packagesResult, setPackagesResult] = useState<PackagesFetchResult | null>(null);
  const [userPackageIdOverride, setUserPackageIdOverride] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

  const sessionsFetchKey = client.id;
  const sessionsLoading =
    sessionsResult === null || sessionsResult.key !== sessionsFetchKey;
  const sessions =
    sessionsResult?.key === sessionsFetchKey ? sessionsResult.sessions : [];
  const sessionsError =
    sessionsResult?.key === sessionsFetchKey ? sessionsResult.error : null;

  const packagesFetchKey = sessionId === "" ? null : `${client.id}:${sessionId}`;
  const packagesLoading =
    packagesFetchKey !== null &&
    (packagesResult === null || packagesResult.key !== packagesFetchKey);
  const packages = useMemo(
    () =>
      packagesFetchKey !== null && packagesResult?.key === packagesFetchKey
        ? packagesResult.packages
        : [],
    [packagesFetchKey, packagesResult],
  );
  const packagesError =
    packagesFetchKey !== null && packagesResult?.key === packagesFetchKey
      ? packagesResult.error
      : null;
  const fetchedUserPackageId =
    packagesFetchKey !== null && packagesResult?.key === packagesFetchKey
      ? packagesResult.userPackageId
      : ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE;
  const userPackageId = userPackageIdOverride ?? fetchedUserPackageId;

  useEffect(() => {
    let cancelled = false;
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + ADMIN_CLIENT_BOOKING_SESSION_LOOKAHEAD_DAYS);
    const query = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
    void apiFetch<AdminClientBookingUpcomingSession[]>(
      `/clients/${client.id}/bookable-sessions?${query}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setSessionsResult({
          key: sessionsFetchKey,
          sessions: filterUpcomingBookableSessions(payload),
          error: null,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setSessionsResult({
            key: sessionsFetchKey,
            sessions: [],
            error:
              err instanceof ApiError ? err.message : t("bookings.sessionsLoadError"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client.id, sessionsFetchKey, t]);

  useEffect(() => {
    if (packagesFetchKey === null) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<EligibleBookingPackage[]>(
      `/clients/${client.id}/sessions/${sessionId}/eligible-packages`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setPackagesResult({
          key: packagesFetchKey,
          packages: payload,
          userPackageId: pickDefaultBookingPackageId(payload),
          error: null,
        });
        setUserPackageIdOverride(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setPackagesResult({
            key: packagesFetchKey,
            packages: [],
            userPackageId: ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE,
            error:
              err instanceof ApiError ? err.message : t("bookings.packagesLoadError"),
          });
          setUserPackageIdOverride(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client.id, packagesFetchKey, sessionId, t]);

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
    label: sessionOptionLabel(row, locale),
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

  function handleSessionChange(nextSessionId: string): void {
    setSessionId(nextSessionId);
    setUserPackageIdOverride(null);
  }

  function resetForm(): void {
    setSessionId("");
    setPackagesResult(null);
    setUserPackageIdOverride(null);
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
    <section className="rounded-[22px] border border-sand-200/70 bg-gradient-to-br from-sand-50/90 via-white to-white p-3.5 shadow-[0_10px_28px_-22px_rgba(45,40,35,0.35)] sm:p-4">
      {toast ? (
        <AdminCenterToast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      ) : null}

      <AdminClientBookingCreateForm
        formId={formId}
        layout="bar"
        sessionsLoading={sessionsLoading}
        sessionsError={sessionsError}
        sessionOptions={sessionOptions}
        sessionId={sessionId}
        onSessionChange={handleSessionChange}
        packagesLoading={packagesLoading}
        packagesError={packagesError}
        packageOptions={packageOptions}
        userPackageId={userPackageId}
        onPackageChange={setUserPackageIdOverride}
        packageRequired={packageRequired}
        noPackageValue={ADMIN_CLIENT_BOOKING_NO_PACKAGE_VALUE}
        bookablePackageCount={bookablePackages.length}
        disabled={submitting}
        onSubmit={() => void handleSubmit()}
        submitSlot={
          <OmmButton
            type="submit"
            form={formId}
            variant="primary"
            className="h-11 min-h-11 w-full whitespace-nowrap px-5 lg:w-auto"
            disabled={!canSubmit || submitting}
          >
            {submitting ? t("bookings.submitting") : t("bookings.confirm")}
          </OmmButton>
        }
      />
    </section>
  );
}
