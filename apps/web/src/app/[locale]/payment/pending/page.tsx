import { PaymentOutcomeScreen } from "@/components/payment/payment-outcome-screen";
import { parsePaymentCheckoutSource } from "@/lib/payment-checkout-source";

type PaymentPendingPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function PaymentPendingPage({
  params,
  searchParams,
}: PaymentPendingPageProps) {
  await params;
  const { reference, source } = await searchParams;
  const checkoutSource = parsePaymentCheckoutSource(source);

  return (
    <PaymentOutcomeScreen
      outcome="pending"
      source={checkoutSource}
      reference={reference ?? null}
    />
  );
}
