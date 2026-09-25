"use client";

import { useId, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { GiftBannerSpheres } from "@/components/account/gift-banner-spheres";
import { GIFT_SOFT_FIELD_CARD_CLASS } from "@/components/account/gift-recipient-picker";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

const GIFT_CODE_MAX_LENGTH = 64;
const REDEEM_CARD_CLASS =
  "rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]";

export function GiftRedeemForm() {
  const router = useRouter();
  const t = useTranslations("userPages.giftCards.redeemForm");
  const codeId = useId();
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form className={REDEEM_CARD_CLASS} onSubmit={(event) => void submitRedeem(event, {
      code,
      busy,
      successText: t("success"),
      failedText: t("failed"),
      setCode,
      setFeedback,
      setBusy,
      refresh: () => router.refresh(),
    })}>
      <RedeemGiftFace eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      <RedeemCodeField
        id={codeId}
        label={t("codeLabel")}
        placeholder={t("codePlaceholder")}
        value={code}
        busy={busy}
        feedback={feedback}
        onChange={setCode}
      />
      <div className="flex justify-end rounded-b-[28px] border-t border-sand-500/25 px-5 py-4 sm:px-8">
        <OmmButton type="submit" variant="primary" disabled={busy} className="w-full sm:w-auto">
          {busy ? t("submitting") : t("submit")}
        </OmmButton>
      </div>
    </form>
  );
}

function RedeemGiftFace({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-br from-sand-100 via-peach-100/70 to-paper px-5 py-7 sm:px-8 sm:py-9">
      <GiftBannerSpheres />
      <p className="relative z-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-500">
        {eyebrow}
      </p>
      <h2 className="relative z-10 mt-3 font-serif text-4xl font-normal leading-tight tracking-tight text-sage-900">
        {title}
      </h2>
      <p className="relative z-10 mt-4 flex w-fit items-center gap-3">
        <span className="font-serif text-lg italic leading-relaxed text-sage-800 sm:text-xl">{lead}</span>
      </p>
    </div>
  );
}

function RedeemCodeField({
  id,
  label,
  placeholder,
  value,
  busy,
  feedback,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  busy: boolean;
  feedback: { ok: boolean; text: string } | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4 px-5 py-7 sm:px-8 sm:py-8">
      <label
        className="block font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900"
        htmlFor={id}
      >
        {label}
      </label>
      <div className={GIFT_SOFT_FIELD_CARD_CLASS}>
        <input
          id={id}
          value={value}
          disabled={busy}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="ommm-input h-14 rounded-2xl bg-white px-4 font-mono text-base tracking-wide"
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={GIFT_CODE_MAX_LENGTH}
          required
        />
      </div>
      {feedback !== null ? (
        <p className={`text-sm ${feedback.ok ? "text-sage-700" : "text-red-800"}`} role={feedback.ok ? "status" : "alert"}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}

async function submitRedeem(
  event: FormEvent,
  input: {
    code: string;
    busy: boolean;
    successText: string;
    failedText: string;
    setCode: (value: string) => void;
    setFeedback: (value: { ok: boolean; text: string } | null) => void;
    setBusy: (value: boolean) => void;
    refresh: () => void;
  },
): Promise<void> {
  event.preventDefault();
  if (input.busy) {
    return;
  }
  input.setBusy(true);
  input.setFeedback(null);
  try {
    await apiFetch("/gift-cards/redeem", {
      method: "POST",
      body: JSON.stringify({ code: input.code.trim() }),
    });
    input.setCode("");
    input.refresh();
    input.setFeedback({ ok: true, text: input.successText });
  } catch (err) {
    input.setFeedback({
      ok: false,
      text: err instanceof ApiError ? err.message : input.failedText,
    });
  } finally {
    input.setBusy(false);
  }
}
