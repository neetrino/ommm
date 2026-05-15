import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

type MarketingPublicHomeEventsSectionProps = {
  locale: string;
};

/**
 * Figma **Events** block inside `155:107` — gradient, wide + two narrow cards.
 */
export async function MarketingPublicHomeEventsSection({
  locale,
}: MarketingPublicHomeEventsSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 py-16 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.eventsGradientTo}, ${HOME_PAGE_SURFACE.eventsGradientFrom})`,
      }}
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-center font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[48px] text-[#fbf5d5]">
          {t("eventsTitle")}
        </h2>

        <div className="mt-24 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
          <EventFeatureCard
            href="/explore"
            imageSrc={HOME_SECTION_ASSETS.eventsWide}
            title={t("eventWideTitle")}
            details={t("eventWideDetails")}
            ctaAria={t("eventCardCtaAria")}
            wide
          />
          <div className="flex flex-1 flex-col gap-6 sm:flex-row lg:flex-col">
            <EventFeatureCard
              href="/explore"
              imageSrc={HOME_SECTION_ASSETS.eventsCardA}
              title={t("eventNarrowATitle")}
              details={t("eventWideDetails")}
              ctaAria={t("eventCardCtaAria")}
            />
            <EventFeatureCard
              href="/explore"
              imageSrc={HOME_SECTION_ASSETS.eventsCardB}
              title={t("eventNarrowBTitle")}
              details={t("eventWideDetails")}
              ctaAria={t("eventCardCtaAria")}
            />
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
        </div>
      </div>
    </section>
  );
}

type EventFeatureCardProps = {
  href: string;
  imageSrc: string;
  title: string;
  details: string;
  ctaAria: string;
  wide?: boolean;
};

function EventFeatureCard({ href, imageSrc, title, details, ctaAria, wide }: EventFeatureCardProps) {
  const heightClass = wide
    ? "min-h-[320px] lg:min-h-[509px] lg:w-[58%]"
    : "min-h-[260px] flex-1 lg:min-h-[250px]";
  return (
    <Link
      href={href}
      aria-label={ctaAria}
      className={`group relative block w-full overflow-hidden rounded-[40px] ${heightClass}`}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes={wide ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 340px"}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-white/90" />
      <div className="absolute bottom-6 left-6 z-10 max-w-[16rem] rounded-2xl bg-white/80 px-4 py-3 backdrop-blur-sm">
        <p
          className="font-serif text-2xl font-extrabold italic leading-6 text-[#18191e]"
          style={{ letterSpacing: "0.18px" }}
        >
          {title}
        </p>
        <p
          className={`${marketingMontserrat.className} mt-1 text-base font-normal text-[#18191e]`}
          style={{ letterSpacing: "0.18px" }}
        >
          {details}
        </p>
      </div>
      <span className="absolute right-6 top-6 z-10 flex size-16 items-center justify-center" aria-hidden>
        <Image
          src={HOME_SECTION_ASSETS.eventFabCircle}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="pointer-events-none absolute inset-0 size-16"
        />
        <Image
          src={HOME_SECTION_ASSETS.eventFabArrow}
          alt=""
          width={18}
          height={18}
          unoptimized
          className="relative z-10"
          style={{ width: "auto", height: "auto", maxWidth: 18, maxHeight: 18 }}
        />
      </span>
    </Link>
  );
}
