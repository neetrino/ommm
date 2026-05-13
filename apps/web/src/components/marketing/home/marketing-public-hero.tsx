import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const HERO_PREVIEW_IMAGE = "/marketing/home/explore-featured.jpg";

export async function MarketingPublicHero({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "marketingPublic.hero",
  });

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cream-50/50 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/2 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <div className="ommm-container grid grid-cols-1 items-center gap-10 pb-16 pt-12 sm:gap-12 sm:pb-20 sm:pt-16 lg:grid-cols-12 lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="lg:col-span-7">
          <p className="ommm-eyebrow">{t("eyebrow")}</p>

          <h1 className="ommm-display mt-6 max-w-[20ch]">
            {t("titleLine1")}{" "}
            <span className="ommm-display-italic">{t("titleAccent")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-sage-500 sm:text-lg">
            {t("lead")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/user/classes" className="ommm-cta-primary">
              {t("primaryCta")}
            </Link>
            <Link href="/memberships" className="ommm-cta-ghost">
              {t("secondaryCta")}
            </Link>
          </div>

          <p className="mt-8 max-w-lg text-sm text-sage-500/90">{t("footnote")}</p>
        </div>

        <div className="lg:col-span-5">
          <Link
            href="/story"
            className="group relative block overflow-hidden rounded-[40px] shadow-[0_30px_80px_-40px_rgba(45,40,35,0.45)] ring-1 ring-white/60"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/11] lg:aspect-[4/5]">
              <Image
                src={HERO_PREVIEW_IMAGE}
                alt={t("previewAlt")}
                fill
                priority
                loading="eager"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(min-width:1024px) 40vw, 92vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-900/75 via-sage-900/20 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-50/85">
                  {t("previewEyebrow")}
                </p>
                <p className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                  {t("previewTitle")}
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white/90">
                  {t("previewCta")}
                  <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
