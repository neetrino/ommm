"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  sessionId: string;
  size?: "sm" | "md";
};

export function JoinWaitlistButton({ sessionId, size = "sm" }: Props) {
  const router = useRouter();
  const t = useTranslations("forms.joinWaitlist");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {size === "md" ? (
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          disabled={busy}
          onClick={() => void join()}
        >
          {t("action")}
        </OmmButton>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => void join()}
          className="ommm-btn-compact-warm"
        >
          {t("action")}
        </button>
      )}
      {msg ? <p className="text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
