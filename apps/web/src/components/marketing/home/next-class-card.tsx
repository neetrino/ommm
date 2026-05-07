import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const NEXT_CLASS_IMAGE = "/marketing/home/next-class.jpg";

export async function NextClassCard() {
  const t = await getTranslations("home.nextClass");

  return (
    <article className="relative isolate w-full">
      <div className="absolute inset-x-6 top-3 -z-10 h-[88%] rotate-2 rounded-[44px] bg-sand-100/55 sm:inset-x-10" />

      <div className="relative overflow-hidden rounded-[40px] bg-white/70 shadow-[0_30px_80px_-40px_rgba(45,40,35,0.45)] ring-1 ring-white/60 backdrop-blur-md">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={NEXT_CLASS_IMAGE}
            alt={t("imageAlt")}
            fill
            sizes="(min-width:1024px) 38vw, (min-width:640px) 70vw, 92vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/65 via-sage-900/15 to-transparent" />

          <div className="absolute inset-x-6 top-6 flex items-start justify-between gap-3 sm:inset-x-8 sm:top-8">
            <span className="ommm-chip-warm">{t("eyebrow")}</span>
            <Link
              href="/account/classes"
              aria-label={t("openLabel")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-sage-900 shadow-md transition-transform hover:-translate-y-0.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden
              >
                <path
                  d="M7 17 17 7M9 7h8v8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          <h3 className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8 ommm-h2 text-white">
            {t("title")}
          </h3>
        </div>

        <div className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-sage-700">{t("when")}</p>
              <p className="ommm-body-muted">{t("coach")}</p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-cream-100 to-blue-100 px-4 py-1.5 text-xs font-medium text-sage-900">
              {t("status")}
            </span>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-sage-700/10 to-transparent" />

          <div className="flex items-center justify-between text-xs text-sage-500">
            <span>{t("duration")}</span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-sage-700"
              />
              {t("spots")}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
