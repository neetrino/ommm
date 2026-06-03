"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import type {
  AdminAssignableUser,
  AdminGiftCardRedemptionHistory,
} from "@/components/admin/admin-gift-cards-types";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardActionsProps = {
  giftCardId: string;
  allowDeactivate: boolean;
  allowDelete: boolean;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onChanged: () => void;
};

export function AdminGiftCardActions({
  giftCardId,
  allowDeactivate,
  allowDelete,
  locale,
  assignableUsers,
  onChanged,
}: AdminGiftCardActionsProps) {
  const t = useTranslations("adminPages.giftCards.actions");
  const submitLockRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState("");
  const [history, setHistory] = useState<AdminGiftCardRedemptionHistory | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function run(
    action: () => Promise<void>,
    okLabel: string,
    shouldRefresh = true,
  ) {
    if (busy || submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      if (shouldRefresh) {
        onChanged();
      }
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      submitLockRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[11rem] flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-xl border border-white/60 bg-white/70 p-2">
        <label className="text-xs text-sage-700">{t("assignLabel")}</label>
        <select
          value={assignToUserId}
          className="ommm-input"
          onChange={(event) => setAssignToUserId(event.target.value)}
          disabled={busy}
        >
          <option value="">{t("assignPlaceholder")}</option>
          {assignableUsers.map((user) => {
            const fullName = [user.name, user.lastName].filter(Boolean).join(" ").trim();
            const label = fullName.length > 0 ? `${fullName} (${user.email})` : user.email;
            return (
              <option key={user.id} value={user.id}>
                {label}
              </option>
            );
          })}
        </select>
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy || assignToUserId.length === 0}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/gift-cards/admin/${giftCardId}/assign`, {
                  method: "PATCH",
                  body: JSON.stringify({ userId: assignToUserId }),
                }),
              t("assigned"),
            )
          }
        >
          {t("assign")}
        </OmmButton>
      </div>
      <div className="flex flex-wrap gap-2">
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() =>
            void run(
              async () => {
                const result = await apiFetch<AdminGiftCardRedemptionHistory>(
                  `/gift-cards/admin/${giftCardId}/redemptions`,
                );
                setHistory(result);
                setShowHistory(true);
              },
              t("historyLoaded"),
              false,
            )
          }
        >
          {t("history")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/gift-cards/admin/${giftCardId}/resend`, { method: "POST" }),
              t("resent"),
            )
          }
        >
          {t("resend")}
        </OmmButton>
        {allowDeactivate ? (
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-red-700 hover:bg-red-50"
            onClick={() => {
              if (!window.confirm(t("deactivateConfirm"))) {
                return;
              }
              void run(
                () =>
                  apiFetch(`/gift-cards/admin/${giftCardId}/deactivate`, {
                    method: "PATCH",
                  }),
                t("deactivated"),
              );
            }}
          >
            {t("deactivate")}
          </OmmButton>
        ) : null}
        {allowDelete ? (
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-red-700 hover:bg-red-50"
            onClick={() => {
              if (!window.confirm(t("deleteConfirm"))) {
                return;
              }
              void run(
                () =>
                  apiFetch(`/gift-cards/admin/${giftCardId}`, {
                    method: "DELETE",
                  }),
                t("deleted"),
              );
            }}
          >
            {t("delete")}
          </OmmButton>
        ) : null}
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`} role="status">
          {message}
        </p>
      ) : null}
      {showHistory && history ? (
        <div className="rounded-xl border border-white/60 bg-white/80 p-3 text-xs text-sage-700">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-medium text-sage-900">{t("historyTitle")}</p>
            <button
              type="button"
              className="rounded p-1 text-sage-500 hover:bg-sage-50"
              onClick={() => setShowHistory(false)}
              aria-label={t("historyClose")}
            >
              ×
            </button>
          </div>
          <p className="mb-2">
            {t("historySummary", {
              amount: formatAmdFromCents(history.amountCents, locale),
              balance: formatAmdFromCents(history.balanceCents, locale),
            })}
          </p>
          <ul className="space-y-1">
            {history.events.map((event) => (
              <li key={`${event.type}-${event.at}`}>
                {formatDateForUi(event.at)} - {event.description}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sage-500">{history.note}</p>
        </div>
      ) : null}
    </div>
  );
}
