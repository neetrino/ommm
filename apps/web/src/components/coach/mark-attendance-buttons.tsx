"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  bookingId: string;
};

export function MarkAttendanceButtons({ bookingId }: Props) {
  const router = useRouter();
  const t = useTranslations("forms.markAttendance");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(attended: boolean) {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/admin/${bookingId}/attendance`, {
        method: "PATCH",
        body: JSON.stringify({ attended }),
      });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void send(true)}
          className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45"
        >
          {t("attended")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void send(false)}
          className="inline-flex items-center justify-center rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-700 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45"
        >
          {t("noShow")}
        </button>
      </div>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
