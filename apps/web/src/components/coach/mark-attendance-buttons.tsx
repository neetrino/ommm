"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  bookingId: string;
};

const ATTENDED_BUTTON_CLASS =
  "ommm-btn-lifecycle-action--success border-emerald-300! bg-emerald-100! text-emerald-800!";

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
    <div className="flex flex-col items-end gap-1">
      <OmmButton
        size="sm"
        variant="secondary"
        className={ATTENDED_BUTTON_CLASS}
        disabled={busy}
        onClick={() => void send(true)}
      >
        {t("attended")}
      </OmmButton>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
