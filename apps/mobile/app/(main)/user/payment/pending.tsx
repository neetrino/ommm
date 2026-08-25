import { useLocalSearchParams } from "expo-router";
import { PaymentOutcomeScreen } from "../../../../src/features/payments/screens/PaymentOutcomeScreen";
import {
  parsePaymentCheckoutSource,
  parsePaymentReference,
} from "../../../../src/lib/payments/paymentCheckoutSource";

export default function UserPaymentPendingRoute() {
  const params = useLocalSearchParams<{
    reference?: string;
    source?: string;
  }>();

  return (
    <PaymentOutcomeScreen
      outcome="pending"
      source={parsePaymentCheckoutSource(params.source)}
      reference={parsePaymentReference(params.reference)}
    />
  );
}
