import { redirect } from "next/navigation";

type FakeGiftPaymentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    amountCents?: string;
    reference?: string;
    batchId?: string;
  }>;
};

/** Legacy route — redirects to unified payment checkout. */
export default async function FakeGiftPaymentPage({
  params,
  searchParams,
}: FakeGiftPaymentPageProps) {
  const { locale } = await params;
  const { amountCents, reference } = await searchParams;
  const query = new URLSearchParams({ source: "gift" });
  if (amountCents) {
    query.set("amountCents", amountCents);
  }
  if (reference) {
    query.set("reference", reference);
  }
  redirect(`/${locale}/user/payments/checkout?${query.toString()}`);
}
