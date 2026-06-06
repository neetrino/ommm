"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

const COPY_FEEDBACK_MS = 2400;

type UserGiftCardCopyCodeButtonProps = {
  code: string;
  /** Stops the click from opening the card detail sheet. */
  stopClickPropagation?: boolean;
  className?: string;
};

export function UserGiftCardCopyCodeButton({
  code,
  stopClickPropagation = false,
  className = "",
}: UserGiftCardCopyCodeButtonProps) {
  const t = useTranslations("userPages.giftCards");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const onCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyFeedback(t("copyCodeSuccess"));
      window.setTimeout(() => setCopyFeedback(null), COPY_FEEDBACK_MS);
    } catch {
      setCopyFeedback(t("copyCodeFailed"));
      window.setTimeout(() => setCopyFeedback(null), COPY_FEEDBACK_MS);
    }
  }, [code, t]);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (stopClickPropagation) {
      event.stopPropagation();
    }
    void onCopyCode();
  }

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`.trim()}>
      <OmmButton type="button" variant="secondary" size="sm" onClick={handleClick}>
        {t("copyCode")}
      </OmmButton>
      {copyFeedback ? (
        <p className="max-w-[12rem] text-right text-xs text-sage-600" role="status">
          {copyFeedback}
        </p>
      ) : null}
    </div>
  );
}
