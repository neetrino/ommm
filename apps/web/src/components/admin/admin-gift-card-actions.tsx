"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

type AdminGiftCardActionsProps = {
  giftCardId: string;
  allowDeactivate: boolean;
  locale?: string;
  onChanged?: () => void;
};

export function AdminGiftCardActions({
  giftCardId,
  allowDeactivate,
  onChanged,
}: AdminGiftCardActionsProps) {
  const t = useTranslations("adminPages.giftCards.actions");
  const submitLockRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy || submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      if (onChanged) {
        onChanged();
      } else {
        window.location.reload();
      }
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("failed"));
      submitLockRef.current = false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[11rem] flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <OmmButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/gift-cards/admin/${giftCardId}/resend`, { method: "POST" }),
              t("resent"),
            )
          }
        >
          {t("resend")}
        </OmmButton>
        {allowDeactivate ? (
          <OmmButton
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-red-700 hover:bg-red-50"
            onClick={() => {
              if (!window.confirm(t("deactivateConfirm"))) {
                return;
              }
              void run(
                () =>
                  apiFetch(`/gift-cards/admin/${giftCardId}/deactivate`, {
                    method: "PATCH",
                  }),
                t("deactivated"),
              );
            }}
          >
            {t("deactivate")}
          </OmmButton>
        ) : null}
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
