"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { CUSTOM_GIFT_CARD_MIN_AMD } from "@/lib/custom-gift-card.constants";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftCardPolicy = {
  minAmountAmd: number;
  denominationsAmd: number[];
};

type GiftAmountChoice = {
  amountAmd: number;
  label: string;
};

type GiftAmountPolicy = {
  minAmd: number;
  choices: GiftAmountChoice[];
};

/** Loads studio gift denominations. Falls back to the coded minimum. */
export function useGiftAmountPolicy(locale: string): GiftAmountPolicy {
  const [policy, setPolicy] = useState<GiftCardPolicy | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<GiftCardPolicy>("/gift-cards/policy")
      .then((next) => {
        if (!cancelled) {
          setPolicy(next);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const minAmd = Math.max(
    policy?.minAmountAmd ?? CUSTOM_GIFT_CARD_MIN_AMD,
    CUSTOM_GIFT_CARD_MIN_AMD,
  );
  const choices = (policy?.denominationsAmd ?? [])
    .filter((amountAmd) => amountAmd >= minAmd)
    .map((amountAmd) => ({
      amountAmd,
      label: formatAmdFromCents(amountAmd, locale),
    }));
  return { minAmd, choices };
}
