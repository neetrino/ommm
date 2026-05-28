"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type ScheduledBroadcast = {
  id: string;
  subject: string;
  audience: "users" | "coaches" | "staff" | "all";
  scheduleAt: string;
  status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
};

type AdminScheduledBroadcastsProps = {
  items: ScheduledBroadcast[];
};

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function AdminScheduledBroadcasts({ items }: AdminScheduledBroadcastsProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<Record<string, string>>(
    Object.fromEntries(items.map((item) => [item.id, toDateTimeLocalValue(item.scheduleAt)])),
  );

  async function cancel(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${id}`, { method: "DELETE" });
      setMessage("Scheduled broadcast cancelled.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not cancel schedule.");
    } finally {
      setBusyId(null);
    }
  }

  async function reschedule(id: string) {
    const raw = scheduleDraft[id];
    if (!raw) {
      setMessage("Choose a schedule time first.");
      return;
    }
    setBusyId(id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduleAt: new Date(raw).toISOString() }),
      });
      setMessage("Scheduled broadcast updated.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not update schedule.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-sage-900">Scheduled broadcasts</h2>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <li className="ommm-body-muted text-sm">No scheduled broadcasts.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="ommm-inset-row flex flex-wrap items-center gap-3">
              <span className="font-medium text-sage-900">{item.subject}</span>
              <span className="text-xs text-sage-500">{item.audience}</span>
              <span className="text-xs text-sage-500">{item.status}</span>
              <input
                className="ommm-input h-9 w-auto text-xs"
                type="datetime-local"
                value={scheduleDraft[item.id] ?? ""}
                onChange={(ev) =>
                  setScheduleDraft((prev) => ({ ...prev, [item.id]: ev.target.value }))
                }
                disabled={busyId !== null || item.status !== "PENDING"}
              />
              <button
                type="button"
                className="ommm-cta-ghost text-xs"
                disabled={busyId !== null || item.status !== "PENDING"}
                onClick={() => void reschedule(item.id)}
              >
                Reschedule
              </button>
              <button
                type="button"
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                disabled={busyId !== null || item.status !== "PENDING"}
                onClick={() => void cancel(item.id)}
              >
                Cancel
              </button>
            </li>
          ))
        )}
      </ul>
      {message ? <p className="mt-2 text-xs text-sage-700">{message}</p> : null}
    </section>
  );
}
