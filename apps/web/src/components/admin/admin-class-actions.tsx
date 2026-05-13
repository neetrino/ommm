"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClassActionsProps = {
  sessionId: string;
};

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
          className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-800 hover:bg-amber-50 disabled:opacity-50"
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
          className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
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
