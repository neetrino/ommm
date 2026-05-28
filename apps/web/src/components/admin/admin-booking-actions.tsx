"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminBookingActionsProps = {
  bookingId: string;
  defaultSessionId: string;
  locale?: string;
};

function getBookingActionLabels(locale: string) {
  if (locale === "hy") {
    return {
      actionFailed: "Գործողությունը չհաջողվեց",
      bookingCancelled: "Ամրագրումը չեղարկվեց",
      attendanceUpdated: "Ներկայությունը թարմացվեց",
      bookingMoved: "Ամրագրումը տեղափոխվեց",
      noteAdded: "Նշումը ավելացվեց",
      cancel: "Չեղարկել",
      attended: "Մասնակցել է",
      missed: "Բացակայել է",
      move: "Տեղափոխել",
      addNote: "Ավելացնել նշում",
      targetSessionId: "Թիրախ սեսիայի ID",
      internalNote: "Ներքին նշում",
    };
  }
  if (locale === "ru") {
    return {
      actionFailed: "Действие не выполнено",
      bookingCancelled: "Бронирование отменено",
      attendanceUpdated: "Посещаемость обновлена",
      bookingMoved: "Бронирование перенесено",
      noteAdded: "Заметка добавлена",
      cancel: "Отменить",
      attended: "Посетил",
      missed: "Пропустил",
      move: "Перенести",
      addNote: "Добавить заметку",
      targetSessionId: "ID целевой сессии",
      internalNote: "Внутренняя заметка",
    };
  }
  return {
    actionFailed: "Action failed",
    bookingCancelled: "Booking cancelled",
    attendanceUpdated: "Attendance updated",
    bookingMoved: "Booking moved",
    noteAdded: "Note added",
    cancel: "Cancel",
    attended: "Attended",
    missed: "Missed",
    move: "Move",
    addNote: "Add note",
    targetSessionId: "Target session ID",
    internalNote: "Internal note",
  };
}

export function AdminBookingActions({
  bookingId,
  defaultSessionId,
  locale = "en",
}: AdminBookingActionsProps) {
  const labels = getBookingActionLabels(locale);
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
      setMessage(error instanceof ApiError ? error.message : labels.actionFailed);
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
              labels.bookingCancelled,
            )
          }
        >
          {labels.cancel}
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
              labels.attendanceUpdated,
            )
          }
        >
          {labels.attended}
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
              labels.attendanceUpdated,
            )
          }
        >
          {labels.missed}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder={labels.targetSessionId}
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
              labels.bookingMoved,
            )
          }
        >
          {labels.move}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder={labels.internalNote}
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
              labels.noteAdded,
            )
          }
        >
          {labels.addNote}
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
