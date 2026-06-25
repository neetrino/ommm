import { PaymentOutcomeScreen } from "@/components/payment/payment-outcome-screen";
import { parsePaymentCheckoutSource } from "@/lib/payment-checkout-source";

type PaymentFailPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function PaymentFailPage({
  params,
  searchParams,
}: PaymentFailPageProps) {
  await params;
  const { reference, source } = await searchParams;
  const checkoutSource = parsePaymentCheckoutSource(source);

  return (
    <PaymentOutcomeScreen
      outcome="failed"
      source={checkoutSource}
      reference={reference ?? null}
    />
  );
}
