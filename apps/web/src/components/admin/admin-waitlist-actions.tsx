"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminWaitlistActionsProps = {
  entryId: string;
  sessionId: string;
};

export function AdminWaitlistActions({
  entryId,
  sessionId,
}: AdminWaitlistActionsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [notifyMessage, setNotifyMessage] = useState("");

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
    <div className="flex min-w-[16rem] flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/waitlist/entries/${entryId}/promote`, {
                  method: "POST",
                  body: JSON.stringify({ targetSessionId: sessionId }),
                }),
              "Entry promoted",
            )
          }
        >
          Promote
        </button>
        <button
          type="button"
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/waitlist/entries/${entryId}`, { method: "DELETE" }),
              "Entry removed",
            )
          }
        >
          Remove
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Optional notification message"
          value={notifyMessage}
          onChange={(event) => setNotifyMessage(event.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/waitlist/entries/${entryId}/notify`, {
                  method: "POST",
                  body: JSON.stringify({
                    message: notifyMessage.trim() || undefined,
                  }),
                }),
              "Notification sent",
            )
          }
        >
          Notify
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
