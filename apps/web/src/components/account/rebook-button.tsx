"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { useSessionBooking } from "@/hooks/use-session-booking";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

type RebookButtonProps = {
  sessionId: string;
};

export function RebookButton({ sessionId }: RebookButtonProps) {
  const t = useTranslations("forms.rebook");
  const locale = useLocale();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const { busy, initiateBooking, packageModal } = useSessionBooking({
    sessionId,
    locale,
    onBooked: () => {
      dispatchNotificationsRefresh();
      router.refresh();
    },
    onError: (message) => setMessage(message),
  });

  return (
    <div className="flex flex-col items-start gap-1">
      <OmmButton
        type="button"
        variant="primary"
        size="sm"
        onClick={() => void initiateBooking()}
        disabled={busy}
      >
        {busy ? t("working") : t("action")}
      </OmmButton>
      {message ? <p className="text-xs text-amber-800">{message}</p> : null}
      {packageModal}
    </div>
  );
}
