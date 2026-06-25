import { PaymentOutcomeScreen } from "@/components/payment/payment-outcome-screen";
import { parsePaymentCheckoutSource } from "@/lib/payment-checkout-source";

type PaymentSuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  await params;
  const { reference, source } = await searchParams;
  const checkoutSource = parsePaymentCheckoutSource(source);

  return (
    <PaymentOutcomeScreen
      outcome="success"
      source={checkoutSource}
      reference={reference ?? null}
    />
  );
}
