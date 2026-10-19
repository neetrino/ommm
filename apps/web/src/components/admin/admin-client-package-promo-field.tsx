"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { PromoPreview } from "@/lib/preview-promo-code";

type AdminClientPackagePromoFieldProps = {
  clientId: string;
  planId: string;
  locale: string;
  disabled?: boolean;
  applied: PromoPreview | null;
  onChange: (preview: PromoPreview | null) => void;
};

export function AdminClientPackagePromoField({
  clientId,
  planId,
  locale,
  disabled = false,
  applied,
  onChange,
}: AdminClientPackagePromoFieldProps) {
  const t = useTranslations("promoCode");
  const [code, setCode] = useState(applied?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function apply(): Promise<void> {
    setBusy(true);
    setError(null);
    const result = await requestPackagePromo(clientId, planId, code);
    onChange(result.preview);
    setError(result.ok ? null : result.message ?? t("invalid"));
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="ommm-label text-xs uppercase tracking-wide" htmlFor="admin-package-promo">
        {t("label")}
      </label>
      <PromoCodeInput
        label={t("apply")}
        placeholder={t("placeholder")}
        code={code}
        disabled={disabled || busy}
        onCodeChange={(next) => {
          setCode(next);
          onChange(null);
          setError(null);
        }}
        onApply={() => void apply()}
      />
      {applied ? <AppliedNote applied={applied} locale={locale} /> : null}
      {error ? <p className="text-xs text-red-800" role="alert">{error}</p> : null}
    </div>
  );
}

async function requestPackagePromo(
  clientId: string,
  planId: string,
  code: string,
): Promise<{ ok: boolean; preview: PromoPreview | null; message?: string }> {
  try {
    const preview = await apiFetch<PromoPreview>(`/clients/${clientId}/packages/coupon-preview`, {
      method: "POST",
      body: JSON.stringify({ planId, code }),
    });
    return { ok: true, preview };
  } catch (err) {
    return {
      ok: false,
      preview: null,
      message: err instanceof ApiError ? err.message : undefined,
    };
  }
}

function PromoCodeInput({
  label,
  placeholder,
  code,
  disabled,
  onCodeChange,
  onApply,
}: {
  label: string;
  placeholder: string;
  code: string;
  disabled: boolean;
  onCodeChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        id="admin-package-promo"
        value={code}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        className="ommm-input min-w-0 flex-1 uppercase tracking-wide"
        onChange={(event) => onCodeChange(event.target.value)}
      />
      <OmmButton size="sm" disabled={disabled || code.trim().length === 0} onClick={onApply}>
        {label}
      </OmmButton>
    </div>
  );
}

function AppliedNote({ applied, locale }: { applied: PromoPreview; locale: string }) {
  const t = useTranslations("promoCode");
  const discount = formatAmdFromCents(applied.discountAmountCents, locale);
  const remainder =
    applied.remainderGiftCents > 0
      ? ` ${t("remainder", { amount: formatAmdFromCents(applied.remainderGiftCents, locale) })}`
      : "";
  return (
    <p className="rounded-2xl bg-mint-50 px-3 py-2 text-xs text-sage-800">
      {t("applied", { amount: discount })}
      {remainder}
    </p>
  );
}
