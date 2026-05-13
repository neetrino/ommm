"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminGiftCardActionsProps = {
  giftCardId: string;
  allowDeactivate: boolean;
};

export function AdminGiftCardActions({
  giftCardId,
  allowDeactivate,
}: AdminGiftCardActionsProps) {
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
      setMessage(error instanceof ApiError ? error.message : "Action failed");
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
              "Gift card email resent",
            )
          }
        >
          Resend
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
                "Gift card deactivated",
              )
            }
          >
            Deactivate
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
