import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GiftCardDroplets } from "@/components/marketing/home/gift-card-droplets";

export async function GiftCardBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home.gift" });

  return (
    <section className="relative">
      <div className="ommm-container pb-[clamp(3rem,6vw,5rem)]">
        <article className="relative overflow-hidden rounded-[40px] sm:rounded-[56px]">
          <div
            aria-hidden
            className="absolute inset-0 ommm-bg-gift bg-[var(--color-gift-gold)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-sage-700/15"
          />

          <div className="relative grid grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:gap-12 lg:p-16">
            <div className="lg:col-span-7">
              <h2 className="font-serif text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-5xl">
                {t("titleStart")}{" "}
                <span className="font-light italic">{t("titleAccent")}</span>
              </h2>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                {t("body")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/user/gift-cards"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-[0.16em] text-sage-700 shadow-md transition-transform hover:-translate-y-0.5"
                >
                  {t("primaryCta")}
                </Link>
                <Link
                  href="/explore"
                  className="text-sm font-medium uppercase tracking-[0.16em] text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  {t("secondaryCta")}
                </Link>
              </div>
            </div>

            <div className="relative hidden h-full min-h-[260px] lg:col-span-5 lg:block">
              <GiftCardDroplets />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
