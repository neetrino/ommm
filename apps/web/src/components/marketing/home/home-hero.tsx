import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NextClassCard } from "./next-class-card";

export async function HomeHero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="ommm-bg-wellness relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cream-50/50 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/2 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <div className="ommm-container grid grid-cols-1 items-center gap-10 pb-16 pt-12 sm:gap-12 sm:pb-20 sm:pt-16 lg:grid-cols-12 lg:gap-16 lg:pb-28 lg:pt-20">
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sand-500/30 text-sm font-medium text-sage-700 ring-1 ring-white/70 sm:h-14 sm:w-14">
              {t("avatarInitial")}
            </span>
            <p className="font-serif italic text-sage-500">
              <span className="block text-base sm:text-lg">{t("greeting")}</span>
              <span className="block text-base font-medium text-sage-700 sm:text-lg">
                {t("guestName")}
              </span>
            </p>
          </div>

          <h1 className="ommm-display mt-8 max-w-[18ch]">
            {t("titleStart")}{" "}
            <span className="ommm-display-italic">{t("titleAccent")}</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-sage-500 sm:text-lg">
            {t("lead")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/account/classes" className="ommm-cta-primary">
              {t("primaryCta")}
            </Link>
            <Link href="/memberships" className="ommm-cta-ghost">
              {t("secondaryCta")}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-5">
          <NextClassCard />
        </div>
      </div>
    </section>
  );
}
