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
  layout?: "board" | "list";
  onBooked?: (bookingId: string) => void;
};

type PendingPaymentResponse = {
  paymentReference: string | null;
  amountCents?: number;
};

export function BookSessionButton({
  sessionId,
  label,
  dropInLabel,
  priceCents,
  size = "sm",
  layout = "board",
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
      const payment = await apiFetch<PendingPaymentResponse & { amountCents: number }>(
        `/payments/checkout/dropin/${sessionId}`,
        { method: "POST" },
      );
      const params = new URLSearchParams({
        source: "dropin",
        amountCents: String(payment.amountCents ?? priceCents),
      });
      if (payment.paymentReference !== null) {
        params.set("reference", payment.paymentReference);
      }
      router.push(`/user/payments/checkout?${params.toString()}`);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("checkoutFailed"));
    } finally {
      setBusy(false);
    }
  }

  const bookButton = (
    <OmmButton
      type="button"
      variant="primary"
      size={size}
      disabled={busy}
      onClick={() => void bookFreeOrMembership()}
    >
      {bookLabel}
    </OmmButton>
  );

  const dropInButton =
    priceCents > 0 ? (
      <OmmButton
        type="button"
        variant="secondary"
        size={size}
        disabled={busy}
        onClick={() => void bookDropIn()}
      >
        {payDropInLabel}
      </OmmButton>
    ) : null;

  const buttonRowClass =
    layout === "list" ? "flex flex-wrap items-center justify-end gap-2" : "flex flex-wrap gap-2";

  return (
    <div className="flex flex-col gap-1">
      <div className={buttonRowClass}>
        {layout === "list" ? (
          <>
            {dropInButton}
            {bookButton}
          </>
        ) : (
          <>
            {bookButton}
            {dropInButton}
          </>
        )}
      </div>
      {msg ? <p className="text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
