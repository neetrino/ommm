import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

type PlanCardCopy = {
  planName: string;
  details: string;
  price: string;
  ctaAria: string;
};

type MarketingPublicHomePlansSectionProps = {
  locale: string;
};

/**
 * Figma plans strip — frosted panel `163:949`, heading `163:951`, cards `163:950`.
 */
export async function MarketingPublicHomePlansSection({
  locale,
}: MarketingPublicHomePlansSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cards = t.raw("planCards") as PlanCardCopy[];

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 py-16 sm:px-6 md:px-10 lg:px-20`}
      style={{ backgroundColor: HOME_PAGE_SURFACE.pageBackground }}
    >
      <div
        className="mx-auto max-w-[1440px] rounded-[50px] px-4 py-12 sm:px-8 sm:py-14 md:px-12 md:py-16"
        style={{ backgroundColor: HOME_PAGE_SURFACE.plansPanelBg }}
      >
        <h2
          className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[48px]"
          style={{ color: HOME_PAGE_SURFACE.plansHeading }}
        >
          {t("plansSectionTitle")}
        </h2>

        <div className="mx-auto mt-10 flex max-w-[1332px] flex-col flex-wrap items-center justify-center gap-8 lg:flex-row lg:gap-[60px]">
          {cards.map((card, index) => (
            <Link
              key={`plan-card-${index}`}
              href="/memberships"
              aria-label={card.ctaAria}
              className="group relative block h-[531px] w-full max-w-[404px] shrink-0 overflow-hidden rounded-[40px] bg-[#97907c] shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#577f91] focus-visible:ring-offset-2"
            >
              <Image
                src={HOME_SECTION_ASSETS.planBackground}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 404px"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 to-black/25" />
              <p
                className="pointer-events-none absolute left-6 top-14 z-10 font-serif text-[28px] font-extrabold italic leading-6 text-white"
                style={{ letterSpacing: "0.18px" }}
              >
                {card.planName}
              </p>
              <div
                className="absolute bottom-6 left-1/2 z-10 h-[136px] w-[min(268px,calc(100%-3rem))] -translate-x-1/2 rounded-[40px]"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              />
              <p
                className={`${marketingMontserrat.className} pointer-events-none absolute bottom-[7.25rem] left-1/2 z-10 -translate-x-1/2 text-lg font-normal leading-6 text-white`}
                style={{ letterSpacing: "0.18px" }}
              >
                {card.details}
              </p>
              <p
                className={`${marketingMontserrat.className} pointer-events-none absolute bottom-[4.25rem] left-1/2 z-10 -translate-x-1/2 text-[28px] font-extrabold leading-6 text-white`}
                style={{ letterSpacing: "0.18px" }}
              >
                {card.price}
              </p>
              <span className="sr-only">{card.ctaAria}</span>
              <span className="absolute bottom-[4.5rem] right-8 z-10 inline-flex size-16 items-center justify-center" aria-hidden>
                <Image
                  src={HOME_SECTION_ASSETS.planCtaIcon}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="size-16 transition-transform group-hover:scale-105"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
        </div>
      </div>
    </section>
  );
}
