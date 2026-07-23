import { getTranslations } from "next-intl/server";
import { PendingPaymentCheckoutForm } from "@/components/account/pending-payment-checkout-form";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { parsePaymentCheckoutSource } from "@/lib/payment-checkout-source";

type PaymentCheckoutPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
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

export default async function PaymentCheckoutPage({
  params,
  searchParams,
}: PaymentCheckoutPageProps) {
  const { locale } = await params;
  const { reference, source, amountCents } = await searchParams;
  const t = await getTranslations({ locale, namespace: "userPages.payments.checkout" });
  const checkoutSource = parsePaymentCheckoutSource(source);
  const parsedAmount = parseAmountCents(amountCents);

  return (
    <MemberContentFrame description={t(`sources.${checkoutSource}.description`)}>
      <PendingPaymentCheckoutForm
        amountLabel={
          parsedAmount !== null
            ? formatAmdFromCents(parsedAmount, locale)
            : t("missingAmount")
        }
        paymentReference={reference ?? null}
        source={checkoutSource}
      />
    </MemberContentFrame>
  );
}
