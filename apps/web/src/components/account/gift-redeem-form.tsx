"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

const GIFT_CODE_MAX_LENGTH = 64;

export function GiftRedeemForm() {
  const router = useRouter();
  const t = useTranslations("userPages.giftCards.redeemForm");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      await apiFetch("/gift-cards/redeem", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      });
      setCode("");
      router.refresh();
      setFeedback({ ok: true, text: t("success") });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof ApiError ? err.message : t("failed"),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`${memberChrome.surface} ${memberChrome.surfacePad}`}>
      <p className="ommm-body-muted max-w-xl text-sm">{t("lead")}</p>
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="ommm-label flex min-w-0 flex-1 flex-col gap-2">
          {t("codeLabel")}
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className="ommm-input font-mono tracking-wide"
            placeholder={t("codePlaceholder")}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={GIFT_CODE_MAX_LENGTH}
            required
          />
        </label>
        <OmmButton type="submit" variant="primary" disabled={busy} className="sm:mb-px">
          {busy ? t("submitting") : t("submit")}
        </OmmButton>
      </form>
      {feedback !== null ? (
        <p
          className={`mt-3 text-sm ${feedback.ok ? "text-sage-700" : "text-red-800"}`}
          role={feedback.ok ? "status" : "alert"}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
