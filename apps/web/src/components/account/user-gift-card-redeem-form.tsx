"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type RedeemResponse = {
  ok: true;
  alreadyOwned: boolean;
};

/** Member enters a gift code. The balance stays on the card until this succeeds. */
export function UserGiftCardRedeemForm() {
  const t = useTranslations("userPages.giftCards.redeemForm");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length === 0 || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch<RedeemResponse>("/gift-cards/redeem", {
        method: "POST",
        body: JSON.stringify({ code: trimmed }),
      });
      setCode("");
      setSuccess(t("success"));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${memberChrome.surface} ${memberChrome.surfacePad} space-y-4`} onSubmit={(event) => void onSubmit(event)}>
      <div>
        <p className={memberChrome.cardMeta}>{t("eyebrow")}</p>
        <h2 className={`mt-2 ${memberChrome.cardTitle}`}>{t("title")}</h2>
        <p className={`mt-2 ${memberChrome.cardSub}`}>{t("lead")}</p>
      </div>
      <label className="block text-sm font-medium text-sage-800" htmlFor="gift-card-code">
        {t("codeLabel")}
        <input
          id="gift-card-code"
          name="code"
          value={code}
          autoComplete="off"
          spellCheck={false}
          placeholder={t("codePlaceholder")}
          disabled={busy}
          className="mt-2 h-12 w-full rounded-2xl border border-sand-500/30 bg-white px-4 text-base tracking-wide text-sage-950"
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      {error !== null ? <p className="text-sm text-red-700">{error}</p> : null}
      {success !== null ? <p className="text-sm text-sage-700">{success}</p> : null}
      <OmmButton type="submit" variant="primary" disabled={busy || code.trim().length === 0}>
        {busy ? t("submitting") : t("submit")}
      </OmmButton>
    </form>
  );
}
