"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!window.confirm("Cancel this booking? Policy deadlines apply.")) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void cancel()}
        className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        Cancel
      </button>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
