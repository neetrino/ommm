"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type BookSessionResponse = {
  id: string;
};

type Props = {
  sessionId: string;
  label?: string;
  dropInLabel?: string;
  priceCents: number;
  size?: "sm" | "md";
  onBooked?: (bookingId: string) => void;
};

type PendingPaymentResponse = {
  paymentReference: string | null;
};

export function BookSessionButton({
  sessionId,
  label,
  dropInLabel,
  priceCents,
  size = "sm",
  onBooked,
}: Props) {
  const router = useRouter();
  const t = useTranslations("forms.bookSession");
  const bookLabel = label ?? t("book");
  const payDropInLabel = dropInLabel ?? t("dropIn");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function bookFreeOrMembership() {
    setBusy(true);
    setMsg(null);
    try {
      const booking = await apiFetch<BookSessionResponse>(
        `/bookings/sessions/${sessionId}`,
        { method: "POST" },
      );
      onBooked?.(booking.id);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("bookFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function bookDropIn() {
    setBusy(true);
    setMsg(null);
    try {
      const payment = await apiFetch<PendingPaymentResponse>(
        `/payments/checkout/dropin/${sessionId}`,
        { method: "POST" },
      );
      setMsg(
        payment.paymentReference
          ? t("paymentPendingWithReference", { reference: payment.paymentReference })
          : t("paymentPending"),
      );
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("checkoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <OmmButton
          type="button"
          variant="primary"
          size={size}
          disabled={busy}
          onClick={() => void bookFreeOrMembership()}
        >
          {bookLabel}
        </OmmButton>
        {priceCents > 0 ? (
          <OmmButton
            type="button"
            variant="secondary"
            size={size}
            disabled={busy}
            onClick={() => void bookDropIn()}
          >
            {payDropInLabel}
          </OmmButton>
        ) : null}
      </div>
      {msg ? <p className="text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
