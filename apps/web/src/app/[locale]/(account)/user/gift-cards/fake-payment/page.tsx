import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";

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
      <section className="mx-auto max-w-xl rounded-[32px] border border-white/80 bg-white/95 p-6 text-center shadow-[0_24px_70px_-38px_rgba(45,40,35,0.42)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-500">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-sage-950">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-sage-600">
          {t("lead")}
        </p>

        <div className="mt-8 rounded-[24px] border border-sage-100 bg-paper/70 p-5 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-sage-500">{t("amountLabel")}</span>
            <strong className="text-2xl text-sage-950">
              {parsedAmount !== null ? formatAmdFromCents(parsedAmount, locale) : t("missingAmount")}
            </strong>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-sage-100 pt-4">
            <span className="text-sm text-sage-500">{t("referenceLabel")}</span>
            <span className="font-mono text-sm text-sage-800">{reference ?? t("missingReference")}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="ommm-cta-primary cursor-not-allowed opacity-70" disabled>
            {t("payButton")}
          </button>
          <Link href="/user/gift-cards" className="ommm-cta-ghost inline-flex justify-center">
            {t("backButton")}
          </Link>
        </div>
      </section>
    </MemberContentFrame>
  );
}
