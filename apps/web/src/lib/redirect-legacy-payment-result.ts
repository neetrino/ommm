import { redirect } from "next/navigation";
import { PAYMENT_FAIL_PATH, PAYMENT_SUCCESS_PATH } from "@/lib/payment-result-paths";

type LegacyPaymentResultRedirectProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
  }>;
};

function buildLegacyPaymentResultTarget(
  locale: string,
  targetPath: string,
  searchParams: { reference?: string; source?: string },
): string {
  const query = new URLSearchParams();
  if (searchParams.reference) {
    query.set("reference", searchParams.reference);
  }
  if (searchParams.source) {
    query.set("source", searchParams.source);
  }
  const qs = query.toString();
  return qs.length > 0 ? `/${locale}${targetPath}?${qs}` : `/${locale}${targetPath}`;
}

export async function redirectLegacyPaymentResultPage(
  params: Promise<{ locale: string }>,
  searchParams: Promise<{ reference?: string; source?: string }>,
  targetPath: string,
): Promise<never> {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  redirect(buildLegacyPaymentResultTarget(locale, targetPath, query));
}

export async function redirectLegacyPaymentSuccess(
  props: LegacyPaymentResultRedirectProps,
): Promise<never> {
  return redirectLegacyPaymentResultPage(props.params, props.searchParams, PAYMENT_SUCCESS_PATH);
}

export async function redirectLegacyPaymentFail(
  props: LegacyPaymentResultRedirectProps,
): Promise<never> {
  return redirectLegacyPaymentResultPage(props.params, props.searchParams, PAYMENT_FAIL_PATH);
}
