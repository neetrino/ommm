"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { postSessionBooking } from "@/hooks/use-session-booking-initiate";
import { apiFetch } from "@/lib/api";
import { isApiError } from "@/lib/arca-checkout";
import { formatDateForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";
import { clearPackageBookReference } from "@/lib/package-book-reference";

type PackageBookIntentStatus =
  | "none"
  | "ready"
  | "pending_payment"
  | "already_booked"
  | "full"
  | "started"
  | "closed"
  | "unavailable"
  | "not_covered";

type PackageBookIntent = {
  status: PackageBookIntentStatus;
  session: {
    id: string;
    title: string;
    coachName: string;
    startsAt: string;
    endsAt: string;
  } | null;
};

type PackageBookConfirmPanelProps = {
  reference: string;
};

function statusLead(
  t: (key: "lead" | "pendingLead" | "booked" | "alreadyBooked" | "full" | "started" | "closed" | "unavailable" | "notCovered") => string,
  status: PackageBookIntentStatus,
  booked: boolean,
): string {
  if (booked) {
    return t("booked");
  }
  if (status === "pending_payment") {
    return t("pendingLead");
  }
  if (status === "already_booked") {
    return t("alreadyBooked");
  }
  if (status === "full") {
    return t("full");
  }
  if (status === "started") {
    return t("started");
  }
  if (status === "closed") {
    return t("closed");
  }
  if (status === "unavailable") {
    return t("unavailable");
  }
  if (status === "not_covered") {
    return t("notCovered");
  }
  return t("lead");
}

export function PackageBookConfirmPanel({ reference }: PackageBookConfirmPanelProps) {
  const t = useTranslations("userPages.payments.result.bookConfirm");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [intent, setIntent] = useState<PackageBookIntent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<PackageBookIntent>(
      `/bookings/package-book-intent?${new URLSearchParams({ reference }).toString()}`,
    )
      .then((next) => {
        if (cancelled) {
          return;
        }
        if (next.status === "none" || next.session === null) {
          clearPackageBookReference();
        }
        setIntent(next);
      })
      .catch(() => {
        if (!cancelled) {
          setIntent({ status: "none", session: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (dismissed || intent === null || intent.session === null || intent.status === "none") {
    return null;
  }

  const session = intent.session;
  const message = statusLead(t, intent.status, booked);
  const durationMinutes = Math.max(
    0,
    Math.round((new Date(session.endsAt).getTime() - new Date(session.startsAt).getTime()) / 60000),
  );

  async function confirm(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await postSessionBooking(session.id);
      setBooked(true);
      clearPackageBookReference();
    } catch (err) {
      setError(isApiError(err) ? err.message : t("unavailable"));
    } finally {
      setBusy(false);
    }
  }

  function dismiss(): void {
    clearPackageBookReference();
    setDismissed(true);
  }

  return (
    <section className="mt-6 w-full rounded-2xl border border-sage-200 bg-white p-4 text-left">
      <h2 className="text-base font-semibold text-sage-950">{t("title")}</h2>
      <p className="mt-1 text-sm text-sage-600">{message}</p>
      <dl className="mt-4 space-y-2 text-sm text-sage-900">
        <div>
          <dt className="text-sage-500">{session.title}</dt>
          <dd>
            {formatDateForUi(session.startsAt)} · {formatTimeForUiFromIso(session.startsAt, locale)}
            {durationMinutes > 0
              ? ` · ${tCommon("sessionDurationMinutes", { minutes: durationMinutes })}`
              : ""}
          </dd>
        </div>
        {session.coachName.length > 0 ? (
          <div>
            <dt className="text-sage-500">{t("coachLabel")}</dt>
            <dd>{session.coachName}</dd>
          </div>
        ) : null}
      </dl>
      {error !== null ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {intent.status === "ready" && !booked ? (
          <OmmButton type="button" disabled={busy} onClick={() => void confirm()}>
            {busy ? t("confirming") : t("confirm")}
          </OmmButton>
        ) : null}
        <button type="button" className="ommm-cta-ghost" onClick={dismiss}>
          {t("dismiss")}
        </button>
      </div>
    </section>
  );
}
