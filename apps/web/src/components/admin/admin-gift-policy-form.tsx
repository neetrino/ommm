"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type GiftPolicy = {
  minAmountAmd: number;
  validityMonths: number;
  denominationsAmd: number[];
};

/** Studio floor, denominations, and default validity. Shop chips read the same policy. */
export function AdminGiftPolicyForm() {
  const t = useTranslations("adminPages.settings");
  const [minAmountAmd, setMinAmountAmd] = useState("");
  const [validityMonths, setValidityMonths] = useState("");
  const [denominations, setDenominations] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<GiftPolicy>("/gift-cards/policy")
      .then((policy) => {
        if (cancelled) {
          return;
        }
        setMinAmountAmd(String(policy.minAmountAmd));
        setValidityMonths(String(policy.validityMonths));
        setDenominations(policy.denominationsAmd.join(", "));
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof ApiError ? caught.message : t("giftPolicyFailed"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <form
      className="grid max-w-xl gap-4 rounded-[24px] border border-white/70 bg-white/80 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void savePolicy(
          { minAmountAmd, validityMonths, denominations },
          t("giftPolicySaved"),
          t("giftPolicyFailed"),
          setNotice,
          setError,
        );
      }}
    >
      <PolicyField label={t("giftPolicyMin")} value={minAmountAmd} onChange={setMinAmountAmd} />
      <PolicyField label={t("giftPolicyValidity")} value={validityMonths} onChange={setValidityMonths} />
      <PolicyField label={t("giftPolicyDenominations")} value={denominations} onChange={setDenominations} />
      {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
      {notice !== null ? <p className="text-sm text-sage-700">{notice}</p> : null}
      <OmmButton type="submit" variant="primary" size="md">{t("giftPolicySave")}</OmmButton>
    </form>
  );
}

function PolicyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <input className="ommm-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

async function savePolicy(
  input: { minAmountAmd: string; validityMonths: string; denominations: string },
  savedLabel: string,
  failedLabel: string,
  onDone: (message: string | null) => void,
  onError: (message: string | null) => void,
): Promise<void> {
  const minAmountAmd = Number.parseInt(input.minAmountAmd, 10);
  const validityMonths = Number.parseInt(input.validityMonths, 10);
  const denominationsAmd = input.denominations
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((amount) => Number.isInteger(amount) && amount > 0);
  if (!Number.isInteger(minAmountAmd) || !Number.isInteger(validityMonths) || denominationsAmd.length === 0) {
    onError(failedLabel);
    return;
  }
  try {
    await apiFetch("/studio/gift-policy", {
      method: "PATCH",
      body: JSON.stringify({ minAmountAmd, validityMonths, denominationsAmd }),
    });
    onDone(savedLabel);
    onError(null);
  } catch (caught) {
    onDone(null);
    onError(caught instanceof ApiError ? caught.message : failedLabel);
  }
}
