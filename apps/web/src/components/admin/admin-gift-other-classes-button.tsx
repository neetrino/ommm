"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type AdminGiftOtherClassesButtonProps = {
  cardId: string;
  allowed: boolean;
  onDone: (message: string) => void;
  onError: (message: string) => void;
};

export function AdminGiftOtherClassesButton({
  cardId,
  allowed,
  onDone,
  onError,
}: AdminGiftOtherClassesButtonProps) {
  const t = useTranslations("adminPages.giftCards.actions");
  const [busy, setBusy] = useState(false);

  return (
    <OmmButton
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (!busy) {
          void toggle(cardId, !allowed, t("cardSaved"), t("failed"), setBusy, onDone, onError);
        }
      }}
    >
      {t("allowOtherClasses")}
    </OmmButton>
  );
}

async function toggle(
  cardId: string,
  allow: boolean,
  savedLabel: string,
  failedLabel: string,
  setBusy: (value: boolean) => void,
  onDone: (message: string) => void,
  onError: (message: string) => void,
): Promise<void> {
  setBusy(true);
  try {
    await apiFetch(`/gift-cards/admin/cards/${cardId}/other-classes`, {
      method: "PATCH",
      body: JSON.stringify({ allow }),
    });
    onDone(savedLabel);
  } catch (caught) {
    onError(caught instanceof ApiError ? caught.message : failedLabel);
  } finally {
    setBusy(false);
  }
}
