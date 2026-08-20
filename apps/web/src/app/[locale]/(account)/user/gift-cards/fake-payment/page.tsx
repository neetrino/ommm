import { redirect } from "next/navigation";
import { GIFT_CARD_CHECKOUT_PATH } from "@/lib/payment-checkout-source";

type FakeGiftPaymentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    amountCents?: string;
    reference?: string;
    batchId?: string;
  }>;
};

/** Legacy route — redirects to gift card checkout under Gift Cards. */
export default async function FakeGiftPaymentPage({
  params,
  searchParams,
}: FakeGiftPaymentPageProps) {
  const { locale } = await params;
  const { amountCents, reference } = await searchParams;
  const query = new URLSearchParams();
  if (amountCents) {
    query.set("amountCents", amountCents);
  }
  if (reference) {
    query.set("reference", reference);
  }
  const suffix = query.toString();
  redirect(
    `/${locale}${GIFT_CARD_CHECKOUT_PATH}${suffix.length > 0 ? `?${suffix}` : ""}`,
  );
}
