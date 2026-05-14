import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import { HOME_CLASS_CARD_BACKGROUNDS, HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

const CLASS_IMAGES = [
  HOME_SECTION_ASSETS.classPractice01,
  HOME_SECTION_ASSETS.classPractice02,
  HOME_SECTION_ASSETS.classPractice03,
  HOME_SECTION_ASSETS.classPractice04,
  HOME_SECTION_ASSETS.classPractice05,
  HOME_SECTION_ASSETS.classPractice06,
] as const;

type ClassCardCopy = {
  title: string;
  body: string;
};

type MarketingPublicHomeClassesSectionProps = {
  locale: string;
};

/**
 * Figma **Classes Section** `155:132` — “Our Core Practices” grid + schedule CTA.
 */
export async function MarketingPublicHomeClassesSection({
  locale,
}: MarketingPublicHomeClassesSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cards = t.raw("classCards") as ClassCardCopy[];

  return (
    <section
      className={`${marketingMontserrat.variable} w-full px-4 py-16 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.classesGradientFrom}, ${HOME_PAGE_SURFACE.classesGradientTo})`,
      }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-7 md:gap-8">
        <header className="flex flex-col gap-4 text-center md:gap-7">
          <h2 className="font-serif text-[clamp(2.25rem,5vw,4.375rem)] font-semibold leading-[48px] text-[#fbf5d5]">
            {t("classesTitle")}
          </h2>
          <p
            className={`${marketingMontserrat.className} mx-auto max-w-[40rem] text-base font-normal leading-[25.6px] tracking-[0.16px] text-[rgba(255,255,255,0.84)]`}
          >
            {t("classesSubtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {cards.map((card, index) => (
            <article
              key={card.title}
              className="relative min-h-[20.4375rem] overflow-hidden rounded-[40px] px-4 pb-6 pt-14 sm:px-6 sm:pt-16"
              style={{
                backgroundColor: HOME_CLASS_CARD_BACKGROUNDS[index],
                borderWidth: index === 2 || index === 5 ? 1 : 0,
                borderStyle: index === 2 || index === 5 ? "solid" : undefined,
                borderColor:
                  index === 2 || index === 5 ? "rgba(232, 218, 116, 0.1)" : undefined,
              }}
            >
              <div className="relative z-20 max-w-[20rem]">
                <h3
                  className={`${marketingMontserrat.className} text-2xl font-extrabold leading-[31.2px] tracking-[0.72px] text-[#1d1c15]`}
                >
                  {card.title}
                </h3>
                <p
                  className={`${marketingMontserrat.className} mt-3 text-base font-normal leading-6 text-[#4a4738]`}
                >
                  {card.body}
                </p>
              </div>
              <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[55%] max-w-[240px] sm:w-[60%]">
                <Image
                  src={CLASS_IMAGES[index] ?? CLASS_IMAGES[0]}
                  alt=""
                  width={480}
                  height={640}
                  sizes="(max-width: 768px) 45vw, 240px"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <HomeMarketingPillLink href="/schedule" label={t("viewSchedule")} variant="silverSchedule" />
        </div>
      </div>
    </section>
  );
}
