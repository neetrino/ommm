"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

const GIFT_POLICY_PATH = "/gift-cards/policy";

/** Prefills a new gift card with the studio validity, which defaults to 12 months. */
export function useDefaultGiftExpiry(
  mode: string,
  initialExpiresAt: string | undefined,
  setExpiresAt: (value: string) => void,
): void {
  useEffect(() => {
    if (mode !== "create" || hasDate(initialExpiresAt)) {
      return;
    }
    void loadDefaultExpiryDate().then((value) => {
      if (value !== null) {
        setExpiresAt(value);
      }
    });
  }, [mode, initialExpiresAt, setExpiresAt]);
}

function hasDate(value: string | undefined): boolean {
  return value !== undefined && value.trim().length > 0;
}

async function loadDefaultExpiryDate(): Promise<string | null> {
  try {
    const policy = await apiFetch<{ validityMonths: number }>(GIFT_POLICY_PATH);
    return formatUtcDate(addUtcMonths(new Date(), policy.validityMonths));
  } catch {
    return null;
  }
}

function addUtcMonths(from: Date, months: number): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function formatUtcDate(value: Date): string {
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${value.getUTCFullYear()}-${month}-${day}`;
}
