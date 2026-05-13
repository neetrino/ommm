import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";

export default async function ScheduleMarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <MarketingPageFrame title={m("scheduleTitle")} lede={m("scheduleLead")}>
      <div className="mt-12 max-w-2xl space-y-6">
        <p className="ommm-body">{m("scheduleP1")}</p>
        <p className="ommm-body">
          <Link
            href="/register"
            className="font-semibold text-sand-800 underline decoration-sand-500/40 underline-offset-4 transition-colors hover:text-sage-900"
          >
            {tCommon("register")}
          </Link>
          {" · "}
          <Link
            href="/login"
            className="font-semibold text-sand-800 underline decoration-sand-500/40 underline-offset-4 transition-colors hover:text-sage-900"
          >
            {tCommon("login")}
          </Link>
        </p>
      </div>
    </MarketingPageFrame>
  );
}
