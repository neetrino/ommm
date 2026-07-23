"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import type {
  AdminAssignableUser,
  AdminGiftCardRedemptionHistory,
} from "@/components/admin/admin-gift-cards-types";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type PendingConfirm = "deactivate" | "delete";

type AdminGiftCardActionsProps = {
  giftCardId?: string;
  batchId?: string;
  allowDeactivate: boolean;
  allowDelete: boolean;
  hideLifecycleActions?: boolean;
  showHistoryButton?: boolean;
  hideAssign?: boolean;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onChanged: () => void;
  onRemoved?: () => void;
};

export function AdminGiftCardActions({
  giftCardId,
  batchId,
  allowDeactivate,
  allowDelete,
  hideLifecycleActions = false,
  showHistoryButton = true,
  hideAssign = false,
  locale,
  assignableUsers,
  onChanged,
  onRemoved,
}: AdminGiftCardActionsProps) {
  const targetId = batchId ?? giftCardId ?? "";
  const useBatchEndpoints = batchId !== undefined;
  const t = useTranslations("adminPages.giftCards.actions");
  const tGiftCards = useTranslations("adminPages.giftCards");
  const submitLockRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState("");
  const [history, setHistory] = useState<AdminGiftCardRedemptionHistory | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  const assignOptions = useMemo<readonly DropdownOption<string>[]>(
    () =>
      assignableUsers.map((user) => {
        const fullName = [user.name, user.lastName].filter(Boolean).join(" ").trim();
        const label = fullName.length > 0 ? `${fullName} (${user.email})` : user.email;
        return { value: user.id, label };
      }),
    [assignableUsers],
  );

  const showDeactivate = allowDeactivate && !hideLifecycleActions;
  const showDelete = allowDelete;

  async function run(action: () => Promise<void>, okLabel: string, shouldRefresh = true) {
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

  function openConfirm(kind: PendingConfirm): void {
    if (busy) {
      return;
    }
    setPendingConfirm(kind);
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  async function confirmLifecycleAction(): Promise<void> {
    if (busy || pendingConfirm === null) {
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      if (pendingConfirm === "deactivate") {
        await apiFetch(
          useBatchEndpoints
            ? `/gift-cards/admin/batches/${targetId}/deactivate`
            : `/gift-cards/admin/${targetId}/deactivate`,
          { method: "PATCH" },
        );
        setTone("ok");
        setMessage(t("deactivated"));
        onChanged();
      } else {
        await apiFetch(
          useBatchEndpoints
            ? `/gift-cards/admin/batches/${targetId}`
            : `/gift-cards/admin/${targetId}`,
          { method: "DELETE" },
        );
        setTone("ok");
        setMessage(t("deleted"));
        onRemoved?.();
        onChanged();
      }
      setPendingConfirm(null);
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "delete"
      ? {
          title: t("delete"),
          description: t("deleteConfirm"),
          confirmLabel: t("delete"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("deactivate"),
          description: t("deactivateConfirm"),
          confirmLabel: t("deactivate"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        };

  return (
    <>
      <div className="flex min-w-[11rem] flex-col gap-3">
        {hideAssign ? null : (
        <div className="flex flex-col gap-3 rounded-[20px] border border-white/60 bg-white/70 p-4">
          <label className="ommm-label text-xs uppercase tracking-wide">{t("assignLabel")}</label>
          <DropdownSelect
            className="w-full"
            label={t("assignPlaceholder")}
            ariaLabel={t("assignLabel")}
            value={assignToUserId}
            options={assignOptions}
            onChange={setAssignToUserId}
            disabled={busy}
            wrapLabel
            searchable
            searchPlaceholder={t("assignSearchPlaceholder")}
            noResultsLabel={t("assignSearchEmpty")}
          />
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            disabled={busy || assignToUserId.length === 0}
            onClick={() =>
              void run(
                () =>
                  apiFetch(
                    useBatchEndpoints
                      ? `/gift-cards/admin/batches/${targetId}/assign`
                      : `/gift-cards/admin/${targetId}/assign`,
                    {
                      method: "PATCH",
                      body: JSON.stringify({ userId: assignToUserId }),
                    },
                  ),
                t("assigned"),
              )
            }
          >
            {t("assign")}
          </OmmButton>
        </div>
        )}
        <div className="flex flex-wrap gap-2">
          {showHistoryButton ? (
            <OmmButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() =>
                void run(
                  async () => {
                    const result = await apiFetch<AdminGiftCardRedemptionHistory>(
                      useBatchEndpoints
                        ? `/gift-cards/admin/batches/${targetId}/history`
                        : `/gift-cards/admin/${targetId}/redemptions`,
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
          ) : null}
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() =>
              void run(
                () =>
                  apiFetch(
                    useBatchEndpoints
                      ? `/gift-cards/admin/batches/${targetId}/resend`
                      : `/gift-cards/admin/${targetId}/resend`,
                    { method: "POST" },
                  ),
                t("resent"),
              )
            }
          >
            {t("resend")}
          </OmmButton>
          {showDeactivate ? (
            <OmmButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              className="text-red-700 hover:bg-red-50"
              onClick={() => openConfirm("deactivate")}
            >
              {t("deactivate")}
            </OmmButton>
          ) : null}
          {showDelete ? (
            <OmmButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              className="text-red-700 hover:bg-red-50"
              onClick={() => openConfirm("delete")}
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
            {history.amountAmd !== undefined && history.balanceAmd !== undefined ? (
              <p className="mb-2">
                {t("historySummary", {
                  amount: formatAmdFromCents(history.amountAmd, locale),
                  balance: formatAmdFromCents(history.balanceAmd, locale),
                })}
              </p>
            ) : null}
            {history.totalQuantity !== undefined && history.availableQuantity !== undefined ? (
              <p className="mb-2">
                {t("historyInventorySummary", {
                  available: history.availableQuantity,
                  total: history.totalQuantity,
                  issued: history.issuedCount ?? history.totalQuantity - history.availableQuantity,
                  redeemed: history.redeemedCount ?? 0,
                })}
              </p>
            ) : null}
            <ul className="space-y-1">
              {history.events.map((event) => (
                <li key={`${event.type}-${event.at}`}>
                  {formatDateForUi(event.at)} - {event.description}
                </li>
              ))}
            </ul>
            {history.note ? <p className="mt-2 text-sage-500">{history.note}</p> : null}
          </div>
        ) : null}
      </div>

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? tGiftCards("savingButton") : confirmCopy.confirmLabel}
        cancelLabel={tGiftCards("cancelButton")}
        backdropAriaLabel={tGiftCards("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={() => {
          void confirmLifecycleAction();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
