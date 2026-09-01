"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import {
  ADMIN_PACKAGE_SESSION_ADJUST_MAX,
  ADMIN_PACKAGE_SESSION_ADJUST_MIN,
  canAdjustClientPackageSessions,
  limitedPackageTypeBalances,
} from "@/components/admin/admin-client-package-sessions-adjuster.helpers";
import { AdminPackageActionDisclosure } from "@/components/admin/admin-package-action-disclosure";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";

type AdminClientPackageSessionsAdjusterProps = {
  item: ClientSheetPackageItem;
  onSuccess: (message: string) => void;
};

type AdjustSessionsResponse = {
  sessionsAdded: number;
  addedBy?: string;
};

function parseSessionCount(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  if (
    !Number.isInteger(parsed) ||
    parsed < ADMIN_PACKAGE_SESSION_ADJUST_MIN ||
    parsed > ADMIN_PACKAGE_SESSION_ADJUST_MAX
  ) {
    return null;
  }
  return parsed;
}

export function AdminClientPackageSessionsAdjuster({
  item,
  onSuccess,
}: AdminClientPackageSessionsAdjusterProps) {
  const t = useTranslations("adminPages.clients.packages");
  const typeBalances = limitedPackageTypeBalances(item);
  const last = item.lastSessionAdjustment ?? null;
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState("1");
  const [reason, setReason] = useState("");
  const [balanceId, setBalanceId] = useState(typeBalances[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canAdjustClientPackageSessions(item)) {
    return null;
  }

  async function handleSubmit(): Promise<void> {
    const count = parseSessionCount(sessions);
    const trimmedReason = reason.trim();
    if (count === null) {
      setError(t("addSessionsCountInvalid"));
      return;
    }
    if (trimmedReason.length < 2) {
      setError(t("addSessionsReasonRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiFetch<AdjustSessionsResponse>(
        `/packages/admin/user-packages/${item.id}/sessions`,
        {
          method: "PATCH",
          body: JSON.stringify({
            sessions: count,
            reason: trimmedReason,
            ...(typeBalances.length > 1 && balanceId !== ""
              ? { userPackageBalanceId: balanceId }
              : {}),
          }),
        },
      );
      setReason("");
      setSessions("1");
      setOpen(false);
      onSuccess(t("addSessionsSuccess", { count: result.sessionsAdded }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("addSessionsError"));
    } finally {
      setSubmitting(false);
    }
  }

  const lastSummary =
    last === null
      ? null
      : t("addSessionsLast", {
          name: last.actorName,
          count: last.sessionsAdded,
          date: formatDateForUi(last.at),
        });

  return (
    <AdminPackageActionDisclosure
      title={t("addSessionsHeading")}
      open={open}
      onOpenChange={setOpen}
      summary={lastSummary}
    >
      <p className="text-sm text-sage-700">{t("addSessionsLead")}</p>
      {last !== null ? (
        <p className="text-sm text-sage-600" title={last.reason}>
          {lastSummary}
        </p>
      ) : null}
      {typeBalances.length > 1 ? (
        <OmmSelectDropdown
          ariaLabel={t("addSessionsTypeLabel")}
          label={t("addSessionsTypeLabel")}
          value={balanceId}
          options={typeBalances.map((balance) => ({
            value: balance.id,
            label: balance.classTypeName,
          }))}
          onChange={setBalanceId}
          disabled={submitting}
        />
      ) : null}
      <label className="flex min-w-[7rem] max-w-[8rem] flex-col gap-1.5">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("addSessionsCountLabel")}
        </span>
        <input
          type="number"
          min={ADMIN_PACKAGE_SESSION_ADJUST_MIN}
          max={ADMIN_PACKAGE_SESSION_ADJUST_MAX}
          step={1}
          inputMode="numeric"
          value={sessions}
          disabled={submitting}
          onChange={(event) => setSessions(event.target.value)}
          className="ommm-input [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("addSessionsReasonLabel")}
        </span>
        <textarea
          value={reason}
          disabled={submitting}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("addSessionsReasonPlaceholder")}
          rows={2}
          className="ommm-input min-h-16 resize-y"
        />
      </label>
      <OmmButton
        type="button"
        variant="secondary"
        disabled={submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? t("addSessionsSubmitting") : t("addSessionsAction")}
      </OmmButton>
      {error !== null ? (
        <p className="text-xs text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </AdminPackageActionDisclosure>
  );
}
