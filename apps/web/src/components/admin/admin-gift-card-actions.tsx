"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminGiftCardActionsProps = {
  giftCardId: string;
  allowDeactivate: boolean;
  locale?: string;
};

function getGiftCardActionLabels(locale: string) {
  if (locale === "hy") {
    return {
      actionFailed: "Գործողությունը չհաջողվեց",
      giftCardEmailResent: "Նվեր քարտի նամակը կրկին ուղարկվեց",
      giftCardDeactivated: "Նվեր քարտը ապաակտիվացվեց",
      resend: "Կրկին ուղարկել",
      deactivate: "Ապաակտիվացնել",
    };
  }
  if (locale === "ru") {
    return {
      actionFailed: "Действие не выполнено",
      giftCardEmailResent: "Письмо с подарочной картой отправлено повторно",
      giftCardDeactivated: "Подарочная карта деактивирована",
      resend: "Отправить повторно",
      deactivate: "Деактивировать",
    };
  }
  return {
    actionFailed: "Action failed",
    giftCardEmailResent: "Gift card email resent",
    giftCardDeactivated: "Gift card deactivated",
    resend: "Resend",
    deactivate: "Deactivate",
  };
}

export function AdminGiftCardActions({
  giftCardId,
  allowDeactivate,
  locale = "en",
}: AdminGiftCardActionsProps) {
  const labels = getGiftCardActionLabels(locale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : labels.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[11rem] flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/gift-cards/admin/${giftCardId}/resend`, { method: "POST" }),
              labels.giftCardEmailResent,
            )
          }
        >
          {labels.resend}
        </button>
        {allowDeactivate ? (
          <button
            type="button"
            className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
            disabled={busy}
            onClick={() =>
              void run(
                () =>
                  apiFetch(`/gift-cards/admin/${giftCardId}/deactivate`, {
                    method: "PATCH",
                  }),
                labels.giftCardDeactivated,
              )
            }
          >
            {labels.deactivate}
          </button>
        ) : null}
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
