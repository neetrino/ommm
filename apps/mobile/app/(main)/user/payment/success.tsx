import { useLocalSearchParams } from "expo-router";
import { PaymentOutcomeScreen } from "../../../../src/features/payments/screens/PaymentOutcomeScreen";
import {
  parsePaymentCheckoutSource,
  parsePaymentReference,
} from "../../../../src/lib/payments/paymentCheckoutSource";

export default function UserPaymentSuccessRoute() {
  const params = useLocalSearchParams<{
    reference?: string;
    source?: string;
  }>();

  return (
    <PaymentOutcomeScreen
      outcome="success"
      source={parsePaymentCheckoutSource(params.source)}
      reference={parsePaymentReference(params.reference)}
    />
  );
}
