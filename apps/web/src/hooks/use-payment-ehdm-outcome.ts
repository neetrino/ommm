import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PaymentOutcomePayload } from "@/lib/payment-outcome-types";

const RECEIPT_POLL_INTERVAL_MS = 1500;
const RECEIPT_POLL_MAX_ATTEMPTS = 8;

export type PaymentEhdmOutcomeState =
  | { kind: "loading" }
  | { kind: "ready"; payload: PaymentOutcomePayload }
  | { kind: "not_found" };

export function usePaymentEhdmOutcome(reference: string): PaymentEhdmOutcomeState {
  const [state, setState] = useState<PaymentEhdmOutcomeState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async (): Promise<void> => {
      try {
        const payload = await apiFetch<PaymentOutcomePayload>(
          `/payments/me/outcome?${new URLSearchParams({ reference }).toString()}`,
        );
        if (cancelled) {
          return;
        }
        if (payload.status !== "SUCCEEDED") {
          setState({ kind: "not_found" });
          return;
        }
        if (payload.ehdmReceipt !== null) {
          setState({ kind: "ready", payload });
          return;
        }
        attempt += 1;
        if (attempt >= RECEIPT_POLL_MAX_ATTEMPTS) {
          setState({ kind: "ready", payload });
          return;
        }
        timer = setTimeout(() => {
          void load();
        }, RECEIPT_POLL_INTERVAL_MS);
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setState({ kind: "not_found" });
          return;
        }
        setState({ kind: "not_found" });
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [reference]);

  return state;
}
