"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminBookingActionsProps = {
  bookingId: string;
  defaultSessionId: string;
};

export function AdminBookingActions({
  bookingId,
  defaultSessionId,
}: AdminBookingActionsProps) {
  const [targetSessionId, setTargetSessionId] = useState(defaultSessionId);
  const [note, setNote] = useState("");
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
    <div className="flex min-w-[18rem] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/bookings/admin/${bookingId}`, { method: "DELETE" }),
              "Booking cancelled",
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
                apiFetch(`/bookings/admin/${bookingId}/attendance`, {
                  method: "PATCH",
                  body: JSON.stringify({ attended: true }),
                }),
              "Attendance updated",
            )
          }
        >
          Attended
        </button>
        <button
          type="button"
          className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-800 hover:bg-amber-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/bookings/admin/${bookingId}/attendance`, {
                  method: "PATCH",
                  body: JSON.stringify({ attended: false }),
                }),
              "Attendance updated",
            )
          }
        >
          Missed
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Target session ID"
          value={targetSessionId}
          onChange={(event) => setTargetSessionId(event.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy || targetSessionId.trim() === ""}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/bookings/admin/${bookingId}/move`, {
                  method: "PATCH",
                  body: JSON.stringify({ targetSessionId }),
                }),
              "Booking moved",
            )
          }
        >
          Move
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Internal note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy || note.trim() === ""}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/bookings/${bookingId}/notes`, {
                  method: "POST",
                  body: JSON.stringify({ body: note.trim() }),
                }),
              "Note added",
            )
          }
        >
          Add note
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
