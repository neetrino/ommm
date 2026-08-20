import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PendingPaymentCheckoutForm } from "@/components/account/pending-payment-checkout-form";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  GIFT_CARD_CHECKOUT_PATH,
  parsePaymentCheckoutSource,
} from "@/lib/payment-checkout-source";

type PaymentCheckoutPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    reference?: string;
    source?: string;
    amountCents?: string;
  }>;
};

function parseAmountCents(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default async function PaymentCheckoutPage({
  params,
  searchParams,
}: PaymentCheckoutPageProps) {
  const { locale } = await params;
  const { reference, source, amountCents } = await searchParams;
  const checkoutSource = parsePaymentCheckoutSource(source);

  if (checkoutSource === "gift") {
    const query = new URLSearchParams();
    if (reference) {
      query.set("reference", reference);
    }
    if (amountCents) {
      query.set("amountCents", amountCents);
    }
    const suffix = query.toString();
    redirect(
      `/${locale}${GIFT_CARD_CHECKOUT_PATH}${suffix.length > 0 ? `?${suffix}` : ""}`,
    );
  }

  const t = await getTranslations({ locale, namespace: "userPages.payments.checkout" });
  const parsedAmount = parseAmountCents(amountCents);

  return (
    <MemberContentFrame description={t(`sources.${checkoutSource}.description`)}>
      <PendingPaymentCheckoutForm
        amountLabel={
          parsedAmount !== null
            ? formatAmdFromCents(parsedAmount, locale)
            : t("missingAmount")
        }
        paymentReference={reference ?? null}
        source={checkoutSource}
      />
    </MemberContentFrame>
  );
}
