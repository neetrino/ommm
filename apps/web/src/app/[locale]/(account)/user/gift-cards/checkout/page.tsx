import { MemberUserRouteFrame } from "@/components/account/member-user-route-frame";
import { PendingPaymentCheckoutForm } from "@/components/account/pending-payment-checkout-form";
import { getTranslations } from "next-intl/server";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftCardCheckoutPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    amountCents?: string;
  }>;
};

function parseAmountCents(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Gift purchase checkout — kept under Gift Cards so Payments nav stays inactive. */
export default async function GiftCardCheckoutPage({
  params,
  searchParams,
}: GiftCardCheckoutPageProps) {
  const { locale } = await params;
  const { reference, amountCents } = await searchParams;
  const t = await getTranslations({ locale, namespace: "userPages.payments.checkout" });
  const parsedAmount = parseAmountCents(amountCents);

  return (
    <MemberUserRouteFrame>
      <PendingPaymentCheckoutForm
        amountLabel={
          parsedAmount !== null
            ? formatAmdFromCents(parsedAmount, locale)
            : t("missingAmount")
        }
        paymentReference={reference ?? null}
        source="gift"
      />
    </MemberUserRouteFrame>
  );
}
