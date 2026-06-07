"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";

const NOTE_MIN_LENGTH = 1;

type BookingNote = {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string | null };
};

type AdminBookingNotesSectionProps = {
  bookingId: string;
  notes: readonly BookingNote[];
  onNotesChange: (notes: BookingNote[]) => void;
  onNoteAdded?: () => void;
};

export function AdminBookingNotesSection({
  bookingId,
  notes,
  onNotesChange,
  onNoteAdded,
}: AdminBookingNotesSectionProps) {
  const t = useTranslations("adminPages.bookings");

  return (
    <section className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
        {t("bookingDetailsNotes")}
      </h3>

      <AdminBookingNoteComposer
        key={bookingId}
        bookingId={bookingId}
        onNotesChange={onNotesChange}
        onNoteAdded={onNoteAdded}
      />

      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-sage-500">{t("bookingDetailsNoNotes")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-white/60 bg-sand-50/70 px-3 py-2 text-sm text-sage-800"
            >
              <p className="text-xs text-sage-500">
                {note.author.name ?? "Staff"} · {formatDateForUi(note.createdAt)}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AdminBookingNoteComposer({
  bookingId,
  onNotesChange,
  onNoteAdded,
}: {
  bookingId: string;
  onNotesChange: (notes: BookingNote[]) => void;
  onNoteAdded?: () => void;
}) {
  const t = useTranslations("adminPages.bookings");
  const fieldId = useId();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitNote(): Promise<void> {
    const body = draft.trim();
    if (body.length < NOTE_MIN_LENGTH || busy) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/bookings/${bookingId}/notes`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      const payload = await apiFetch(`/bookings/admin/${bookingId}`);
      const nextNotes = (payload as { notes?: BookingNote[] }).notes ?? [];
      onNotesChange(nextNotes);
      setDraft("");
      onNoteAdded?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 rounded-2xl border border-white/70 bg-white/60 p-3">
      <label htmlFor={fieldId} className="sr-only">
        {t("noteComposeLabel")}
      </label>
      <textarea
        id={fieldId}
        className="ommm-input min-h-[5.5rem] w-full resize-y text-sm"
        placeholder={t("noteComposePlaceholder")}
        value={draft}
        disabled={busy}
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        {error ? (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : (
          <span className="text-xs text-sage-500">{t("noteComposeHint")}</span>
        )}
        <OmmButton
          size="sm"
          variant="primary"
          disabled={busy || draft.trim().length < NOTE_MIN_LENGTH}
          onClick={() => {
            void submitNote();
          }}
        >
          {t("noteComposeSubmit")}
        </OmmButton>
      </div>
    </div>
  );
}
