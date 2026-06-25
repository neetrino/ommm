import { redirect } from "next/navigation";
import { PAYMENT_FAIL_PATH, PAYMENT_SUCCESS_PATH } from "@/lib/payment-result-paths";

type GiftPaymentResultPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    reference?: string;
  }>;
};

/** Legacy route — redirects to unified payment success/fail pages. */
export default async function GiftPaymentResultPage({
  params,
  searchParams,
}: GiftPaymentResultPageProps) {
  const { locale } = await params;
  const { status, reference } = await searchParams;
  const query = new URLSearchParams({ source: "gift" });
  if (reference) {
    query.set("reference", reference);
  }
  const targetPath = status === "success" ? PAYMENT_SUCCESS_PATH : PAYMENT_FAIL_PATH;
  redirect(`/${locale}${targetPath}?${query.toString()}`);
}
