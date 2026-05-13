"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";

type RebookButtonProps = {
  sessionId: string;
};

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
        className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        onClick={() => void run()}
        disabled={busy}
      >
        {busy ? t("working") : t("action")}
      </button>
      {message ? <p className="text-xs text-red-800">{message}</p> : null}
    </div>
  );
}
