"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClassActionsProps = {
  sessionId: string;
};

const CANCEL_SESSION_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-md border border-amber-300 bg-white/80 px-2 py-1 text-xs font-medium text-amber-800 transition-[background-color,border-color,box-shadow,color,transform] hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 hover:shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const ACTIVATE_SESSION_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-md border border-emerald-300 bg-white/80 px-2 py-1 text-xs font-medium text-emerald-700 transition-[background-color,border-color,box-shadow,color,transform] hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 hover:shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export function AdminClassActions({ sessionId }: AdminClassActionsProps) {
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
          className={CANCEL_SESSION_BUTTON_CLASSES}
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/classes/sessions/${sessionId}/status`, {
                  method: "POST",
                  body: JSON.stringify({ status: "CANCELLED" }),
                }),
              "Session cancelled",
            )
          }
        >
          Cancel
        </button>
        <button
          type="button"
          className={ACTIVATE_SESSION_BUTTON_CLASSES}
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/classes/sessions/${sessionId}/status`, {
                  method: "POST",
                  body: JSON.stringify({ status: "ACTIVE" }),
                }),
              "Session activated",
            )
          }
        >
          Activate
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
