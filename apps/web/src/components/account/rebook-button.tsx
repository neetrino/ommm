"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
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
    <div className="flex flex-col items-start gap-1">
      <OmmButton
        type="button"
        variant="primary"
        size="sm"
        onClick={() => void run()}
        disabled={busy}
      >
        {busy ? t("working") : t("action")}
      </OmmButton>
      {message ? <p className="text-xs text-amber-800">{message}</p> : null}
    </div>
  );
}
