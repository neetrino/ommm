"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { normalizeUserPackageStatus } from "@/components/account/user-membership-display";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import {
  ADMIN_CLIENT_PAST_SESSION_LOOKBACK_DAYS,
  canSubmitPastSessionAttach,
  pastSessionOptionLabel,
  type AdminClientAttachablePastSession,
  type AdminClientAttachablePastSessionsResponse,
} from "@/components/admin/admin-client-package-past-session.helpers";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";

const EMPTY_SESSION_VALUE = "";
const PAST_SESSION_MENU_MIN_WIDTH_PX = 340;

type AdminClientPackagePastSessionControlsProps = {
  clientId: string;
  item: ClientSheetPackageItem;
  locale: string;
  onSuccess: (message: string) => void;
};

export function AdminClientPackagePastSessionControls({
  clientId,
  item,
  locale,
  onSuccess,
}: AdminClientPackagePastSessionControlsProps) {
  const t = useTranslations("adminPages.clients.packages");
  const status = normalizeUserPackageStatus(item.status);
  const [sessions, setSessions] = useState<AdminClientAttachablePastSession[]>([]);
  const [lookbackDays, setLookbackDays] = useState(
    ADMIN_CLIENT_PAST_SESSION_LOOKBACK_DAYS,
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [sessionId, setSessionId] = useState(EMPTY_SESSION_VALUE);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void apiFetch<AdminClientAttachablePastSessionsResponse>(
      `/clients/${clientId}/packages/${item.id}/past-sessions`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setSessions(payload.items);
        setLookbackDays(payload.lookbackDays);
        setSessionId(EMPTY_SESSION_VALUE);
      })
      .catch((err) => {
        if (!cancelled) {
          setSessions([]);
          setLoadError(
            err instanceof ApiError ? err.message : t("attachPastLoadError"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, item.id, reloadKey, t]);

  if (status !== "ACTIVE") {
    return null;
  }

  const options = sessions.map((session) => ({
    value: session.id,
    label: pastSessionOptionLabel(session, locale, t("attachPastExistingVisit")),
  }));
  const canSubmit = canSubmitPastSessionAttach({
    sessionId,
    loading,
    loadError,
    submitting,
  });

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch(`/clients/${clientId}/packages/${item.id}/past-sessions`, {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          ...(note.trim().length > 0 ? { note: note.trim() } : {}),
        }),
      });
      setNote("");
      setSessionId(EMPTY_SESSION_VALUE);
      setReloadKey((current) => current + 1);
      onSuccess(t("attachPastSuccess"));
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : t("attachPastError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/70 bg-white/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
        {t("attachPastHeading")}
      </p>
      <p className="text-sm text-sage-700">{t("attachPastLead")}</p>
      {loading ? <p className="text-sm text-sage-600">{t("attachPastLoading")}</p> : null}
      {loadError !== null ? (
        <p className="text-xs text-rose-700" role="alert">
          {loadError}
        </p>
      ) : null}
      {!loading && loadError === null && sessions.length === 0 ? (
        <p className="text-sm text-sage-600">
          {t("attachPastEmpty", { days: lookbackDays })}
        </p>
      ) : null}
      {!loading && loadError === null && sessions.length > 0 ? (
        <>
          <OmmSelectDropdown
            ariaLabel={t("attachPastSessionLabel")}
            label={t("attachPastSelectSession")}
            value={sessionId}
            options={options}
            onChange={setSessionId}
            disabled={submitting}
            searchable
            searchPlaceholder={t("attachPastSearch")}
            noResultsLabel={t("attachPastSearchEmpty")}
            menuMinWidth={PAST_SESSION_MENU_MIN_WIDTH_PX}
            triggerClassName="w-full min-w-0 justify-between rounded-2xl border-sand-200/80 bg-white px-3.5 shadow-none"
          />
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("attachPastNoteLabel")}
            </span>
            <textarea
              value={note}
              disabled={submitting}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("attachPastNotePlaceholder")}
              rows={2}
              className="ommm-input min-h-16 resize-y"
            />
          </label>
          <OmmButton
            type="button"
            variant="primary"
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            {submitting ? t("attachPastSubmitting") : t("attachPastAction")}
          </OmmButton>
        </>
      ) : null}
      {submitError !== null ? (
        <p className="text-xs text-rose-700" role="alert">
          {submitError}
        </p>
      ) : null}
    </div>
  );
}
