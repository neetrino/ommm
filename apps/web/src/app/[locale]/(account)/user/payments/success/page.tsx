import { redirectLegacyPaymentSuccess } from "@/lib/redirect-legacy-payment-result";

type LegacyPaymentSuccessRedirectProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function LegacyPaymentSuccessRedirect(
  props: LegacyPaymentSuccessRedirectProps,
) {
  return redirectLegacyPaymentSuccess(props);
}
