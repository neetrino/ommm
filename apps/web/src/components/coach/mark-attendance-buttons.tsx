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
          className="rounded-lg bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {t("attended")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void send(false)}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          {t("noShow")}
        </button>
      </div>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
