import { PaymentEhdmReceiptScreen } from "@/components/payment/payment-ehdm-receipt-screen";
import { parsePaymentCheckoutSource } from "@/lib/payment-checkout-source";
import { redirect } from "@/i18n/navigation";
import { PAYMENT_SUCCESS_PATH } from "@/lib/payment-result-paths";

type PaymentReceiptPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function PaymentReceiptPage({
  params,
  searchParams,
}: PaymentReceiptPageProps) {
  const { locale } = await params;
  const { reference, source } = await searchParams;

  const trimmedReference = reference?.trim() ?? "";

  if (!trimmedReference) {
    redirect({ href: PAYMENT_SUCCESS_PATH, locale });
  }

  const checkoutSource = parsePaymentCheckoutSource(source);

  return (
    <PaymentEhdmReceiptScreen
      reference={trimmedReference}
      source={checkoutSource}
      locale={locale}
    />
  );
}
