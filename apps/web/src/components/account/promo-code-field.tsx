"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  previewPromoCode,
  type PromoPreview,
  type PromoPurchaseLine,
} from "@/lib/preview-promo-code";

type PromoCodeFieldProps = {
  locale: string;
  subtotalCents: number;
  lines: readonly PromoPurchaseLine[];
  useGiftCredits?: boolean;
  giftCardIds?: readonly string[];
  disabled?: boolean;
  onChange: (preview: PromoPreview | null) => void;
};

export function PromoCodeField({
  locale,
  subtotalCents,
  lines,
  useGiftCredits = false,
  giftCardIds,
  disabled = false,
  onChange,
}: PromoCodeFieldProps) {
  const t = useTranslations("promoCode");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<PromoPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lineKey = lines.map((line) => `${line.kind}:${line.packagePlanId ?? ""}`).join("|");
  const cardKey = (giftCardIds ?? []).join(",");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setApplied(null);
    setError(null);
    onChangeRef.current(null);
  }, [subtotalCents, lineKey, useGiftCredits, cardKey]);

  async function apply() {
    setBusy(true);
    setError(null);
    try {
      const preview = await previewPromoCode({
        code,
        subtotalCents,
        lines,
        useGiftCredits,
        giftCardIds,
      });
      setApplied(preview);
      onChangeRef.current(preview);
    } catch (err) {
      setApplied(null);
      onChangeRef.current(null);
      setError(err instanceof ApiError ? err.message : t("invalid"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="ommm-label text-xs uppercase tracking-wide" htmlFor="promo-code">
        {t("label")}
      </label>
      <div className="flex gap-2">
        <input
          id="promo-code"
          value={code}
          disabled={disabled || busy}
          placeholder={t("placeholder")}
          autoCapitalize="characters"
          className="ommm-input min-w-0 flex-1 uppercase tracking-wide"
          onChange={(event) => {
            setCode(event.target.value);
            setApplied(null);
            setError(null);
            onChangeRef.current(null);
          }}
        />
        <OmmButton
          size="sm"
          disabled={disabled || busy || subtotalCents <= 0 || code.trim().length === 0}
          onClick={() => void apply()}
        >
          {t("apply")}
        </OmmButton>
      </div>
      {applied ? (
        <p className="rounded-2xl bg-mint-50 px-3 py-2 text-xs text-sage-800">
          {t("applied", { amount: formatAmdFromCents(applied.discountAmountCents, locale) })}
          {applied.remainderGiftCents > 0
            ? ` ${t("remainder", { amount: formatAmdFromCents(applied.remainderGiftCents, locale) })}`
            : ""}
        </p>
      ) : null}
      {error ? <p className="text-xs text-red-800" role="alert">{error}</p> : null}
    </div>
  );
}
