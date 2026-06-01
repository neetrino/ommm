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
  labels: {
    heading: string;
    empty: string;
    reschedule: string;
    cancel: string;
    chooseScheduleFirst: string;
    scheduleCancelled: string;
    scheduleUpdated: string;
    cancelFailed: string;
    updateFailed: string;
  };
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

export function AdminScheduledBroadcasts({ items, labels }: AdminScheduledBroadcastsProps) {
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
      setMessage(labels.scheduleCancelled);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : labels.cancelFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function reschedule(id: string) {
    const raw = scheduleDraft[id];
    if (!raw) {
      setMessage(labels.chooseScheduleFirst);
      return;
    }
    setBusyId(id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduleAt: new Date(raw).toISOString() }),
      });
      setMessage(labels.scheduleUpdated);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : labels.updateFailed);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-sage-900">{labels.heading}</h2>
      <ul className="mt-3 space-y-2">
        {items.length === 0 ? (
          <li className="ommm-body-muted text-sm">{labels.empty}</li>
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
                {labels.reschedule}
              </button>
              <button
                type="button"
                className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                disabled={busyId !== null || item.status !== "PENDING"}
                onClick={() => void cancel(item.id)}
              >
                {labels.cancel}
              </button>
            </li>
          ))
        )}
      </ul>
      {message ? <p className="mt-2 text-xs text-sage-700">{message}</p> : null}
    </section>
  );
}
