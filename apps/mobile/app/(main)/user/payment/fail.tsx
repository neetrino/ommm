import { useLocalSearchParams } from "expo-router";
import { PaymentOutcomeScreen } from "../../../../src/features/payments/screens/PaymentOutcomeScreen";
import {
  parsePaymentCheckoutSource,
  parsePaymentReference,
} from "../../../../src/lib/payments/paymentCheckoutSource";

export default function UserPaymentFailRoute() {
  const params = useLocalSearchParams<{
    reference?: string;
    source?: string;
  }>();

  return (
    <PaymentOutcomeScreen
      outcome="failed"
      source={parsePaymentCheckoutSource(params.source)}
      reference={parsePaymentReference(params.reference)}
    />
  );
}
