import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function GiftCardBanner() {
  const t = await getTranslations("home.gift");

  return (
    <section className="bg-paper">
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
              <span className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white/30 ring-2 ring-white/70 backdrop-blur sm:h-16 sm:w-16">
                <Image
                  src="/marketing/home/brand-mark.png"
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </span>

              <h2 className="mt-6 font-serif text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-5xl">
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
              <div className="absolute inset-0">
                <span className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-cream-50/40 blur-3xl" />
                <span className="absolute right-12 top-8 h-44 w-44 rounded-full bg-cream-50/50" />
                <span className="absolute bottom-6 right-32 h-28 w-28 rounded-full bg-peach-100/60" />
                <span className="absolute right-10 top-1/2 inline-flex h-32 w-32 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full ring-4 ring-white/50">
                  <Image
                    src="/marketing/home/brand-mark.png"
                    alt=""
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
