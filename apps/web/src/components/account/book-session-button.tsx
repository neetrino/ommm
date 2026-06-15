"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useSessionBooking } from "@/hooks/use-session-booking";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

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
  const locale = useLocale();
  const t = useTranslations("forms.bookSession");
  const bookLabel = label ?? t("book");
  const payDropInLabel = dropInLabel ?? t("dropIn");
  const [msg, setMsg] = useState<string | null>(null);
  const [dropInBusy, setDropInBusy] = useState(false);
  const { busy: bookingBusy, initiateBooking, packageModal } = useSessionBooking({
    sessionId,
    locale,
    onBooked: (bookingId) => {
      onBooked?.(bookingId);
      dispatchNotificationsRefresh();
      router.refresh();
    },
    onError: (message) => setMsg(message),
  });

  const busy = bookingBusy || dropInBusy;

  async function bookDropIn() {
    setDropInBusy(true);
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
      setDropInBusy(false);
    }
  }

  const bookButton = (
    <OmmButton
      type="button"
      variant="primary"
      size={size}
      disabled={busy}
      onClick={() => void initiateBooking()}
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
      {packageModal}
    </div>
  );
}
