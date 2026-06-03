import { getTranslations } from "next-intl/server";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { FakeGiftPaymentForm } from "@/components/account/fake-gift-payment-form";

type FakeGiftPaymentPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    amountCents?: string;
    reference?: string;
  }>;
};

function parseAmountCents(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function FakeGiftPaymentPage({
  params,
  searchParams,
}: FakeGiftPaymentPageProps) {
  const { locale } = await params;
  const { amountCents, reference } = await searchParams;
  const t = await getTranslations({ locale, namespace: "userPages.giftCards.fakePayment" });
  const parsedAmount = parseAmountCents(amountCents);

  return (
    <MemberContentFrame description={t("description")}>
      <FakeGiftPaymentForm
        amountLabel={
          parsedAmount !== null ? formatAmdFromCents(parsedAmount, locale) : t("missingAmount")
        }
        paymentReference={reference ?? null}
      />
    </MemberContentFrame>
  );
}
