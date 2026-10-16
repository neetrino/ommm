"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useSessionBooking } from "@/hooks/use-session-booking";
import { PromoCodeField } from "@/components/account/promo-code-field";
import { OmmButton } from "@/components/ui/omm-button";
import type { PromoPreview } from "@/lib/preview-promo-code";
import { ApiError, apiFetch } from "@/lib/api";
import { checkoutAlreadySettled } from "@/lib/arca-checkout";
import { buildPaymentSuccessPath } from "@/lib/payment-result-paths";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

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
  status?: string;
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
  const [useGiftCredits, setUseGiftCredits] = useState(false);
  const [promo, setPromo] = useState<PromoPreview | null>(null);
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
        `/payments/checkout/dropin/${sessionId}?${dropInQuery(useGiftCredits, promo?.code)}`,
        { method: "POST" },
      );
      if (payment.paymentReference !== null && checkoutAlreadySettled(payment)) {
        router.push(buildPaymentSuccessPath(payment.paymentReference, "dropin"));
        router.refresh();
        return;
      }
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
        {priceCents > 0 ? (
          <PromoCodeField
            locale={locale}
            subtotalCents={priceCents}
            lines={[{ kind: "DROPIN" }]}
            useGiftCredits={useGiftCredits}
            disabled={busy}
            onChange={setPromo}
          />
        ) : null}
        {priceCents > 0 ? (
          <label className="flex items-center gap-2 text-xs text-sage-700">
            <input
              type="checkbox"
              checked={useGiftCredits}
              onChange={(event) => setUseGiftCredits(event.target.checked)}
            />
            {t("useGiftCredits")}
          </label>
        ) : null}
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

function dropInQuery(useGiftCredits: boolean, couponCode: string | undefined): string {
  const params = new URLSearchParams();
  if (useGiftCredits) {
    params.set("useGiftCredits", "true");
  }
  if (couponCode) {
    params.set("couponCode", couponCode);
  }
  return params.toString();
}
