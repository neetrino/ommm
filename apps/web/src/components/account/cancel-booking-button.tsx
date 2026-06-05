"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  bookingId: string;
};

const CANCEL_BOOKING_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center rounded-md px-1 py-0.5 text-xs font-medium text-red-700 transition-[background-color,color,box-shadow] hover:bg-red-50 hover:text-red-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export function CancelBookingButton({ bookingId }: Props) {
  const router = useRouter();
  const t = useTranslations("forms.cancelBooking");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function cancel() {
    if (!window.confirm(t("confirm"))) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
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
        className={CANCEL_BOOKING_BUTTON_CLASSES}
      >
        {t("action")}
      </button>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
