"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

const COPY_FEEDBACK_MS = 2400;

type StaffClientInvitePanelProps = {
  code: string;
  referredCount: number;
  locale: string;
};

function invitePath(locale: string, code: string): string {
  return `/${locale}/register?ref=${encodeURIComponent(code)}`;
}

function subscribeOrigin(): () => void {
  return () => undefined;
}

function readOrigin(): string {
  return window.location.origin;
}

function readServerOrigin(): string {
  return "";
}

export function StaffClientInvitePanel({
  code,
  referredCount,
  locale,
}: StaffClientInvitePanelProps) {
  const t = useTranslations("staffProfile.clientInvite");
  const origin = useSyncExternalStore(subscribeOrigin, readOrigin, readServerOrigin);
  const href = `${origin}${invitePath(locale, code)}`;
  const [feedback, setFeedback] = useState<string | null>(null);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(href);
      setFeedback(t("copied"));
    } catch {
      setFeedback(t("copyFailed"));
    }
    window.setTimeout(() => setFeedback(null), COPY_FEEDBACK_MS);
  }

  return (
    <div className="space-y-3">
      <p className="ommm-body-muted text-sm">{t("body")}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          readOnly
          value={href}
          className="ommm-input min-w-0 flex-1"
          aria-label={t("linkLabel")}
        />
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          onClick={() => void onCopy()}
        >
          {t("copy")}
        </OmmButton>
      </div>
      {feedback ? (
        <p className="text-xs font-medium text-sage-600" role="status">
          {feedback}
        </p>
      ) : null}
      <p className="text-sm font-medium text-sage-800">
        {t("referred", { count: referredCount })}
      </p>
    </div>
  );
}
