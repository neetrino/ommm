import { redirectLegacyPaymentFail } from "@/lib/redirect-legacy-payment-result";

type LegacyPaymentFailRedirectProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

export default async function LegacyPaymentFailRedirect(
  props: LegacyPaymentFailRedirectProps,
) {
  return redirectLegacyPaymentFail(props);
}
