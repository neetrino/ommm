"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

type RebookButtonProps = {
  sessionId: string;
};

const REBOOK_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 transition-[background-color,border-color,box-shadow,color,transform] hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

export function RebookButton({ sessionId }: RebookButtonProps) {
  const t = useTranslations("forms.rebook");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/bookings/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className={REBOOK_BUTTON_CLASSES}
        onClick={() => void run()}
        disabled={busy}
      >
        {busy ? t("working") : t("action")}
      </button>
      {message ? <p className="text-xs text-red-800">{message}</p> : null}
    </div>
  );
}
