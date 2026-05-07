import Image from "next/image";
import { Link } from "@/i18n/navigation";

const DEFAULT_IMAGE = "/marketing/home/next-class.jpg";

type NextClassCardEmpty = {
  variant: "empty";
  href: string;
  eyebrow: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
};

type NextClassCardFilled = {
  variant: "filled";
  href: string;
  eyebrow: string;
  openLabel: string;
  imageSrc?: string;
  imageAlt: string;
  title: string;
  whenLine: string;
  coachLine?: string | null;
  statusLabel?: string;
  durationLabel?: string | null;
  spotsLabel?: string | null;
  priorityImage?: boolean;
};

export type NextClassCardViewProps = NextClassCardEmpty | NextClassCardFilled;

export function NextClassCardView(props: NextClassCardViewProps) {
  if (props.variant === "empty") {
    const { href, eyebrow, emptyTitle, emptyBody, emptyCta } = props;
    return (
      <article className="relative isolate w-full">
        <div className="absolute inset-x-6 top-3 -z-10 h-[88%] rotate-2 rounded-[44px] bg-sand-100/55 sm:inset-x-10" />
        <div className="relative flex min-h-[320px] flex-col justify-between gap-6 overflow-hidden rounded-[40px] bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(45,40,35,0.45)] ring-1 ring-white/60 backdrop-blur-md sm:p-10">
          <div>
            <span className="ommm-chip-warm">{eyebrow}</span>
            <h3 className="ommm-h3 mt-6 max-w-[20ch] text-sage-800">{emptyTitle}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-sage-500">
              {emptyBody}
            </p>
          </div>
          <Link href={href} className="ommm-cta-primary w-full text-center sm:w-auto">
            {emptyCta}
          </Link>
        </div>
      </article>
    );
  }

  const {
    href,
    eyebrow,
    openLabel,
    imageSrc = DEFAULT_IMAGE,
    imageAlt,
    title,
    whenLine,
    coachLine,
    statusLabel,
    durationLabel,
    spotsLabel,
    priorityImage = false,
  } = props;

  return (
    <article className="relative isolate w-full">
      <div className="absolute inset-x-6 top-3 -z-10 h-[88%] rotate-2 rounded-[44px] bg-sand-100/55 sm:inset-x-10" />

      <div className="relative overflow-hidden rounded-[40px] bg-white/70 shadow-[0_30px_80px_-40px_rgba(45,40,35,0.45)] ring-1 ring-white/60 backdrop-blur-md">
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width:1024px) 38vw, (min-width:640px) 70vw, 92vw"
            className="object-cover"
            priority={priorityImage}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sage-900/65 via-sage-900/15 to-transparent" />

          <div className="absolute inset-x-6 top-6 flex items-start justify-between gap-3 sm:inset-x-8 sm:top-8">
            <span className="ommm-chip-warm">{eyebrow}</span>
            <Link
              href={href}
              aria-label={openLabel}
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
            {title}
          </h3>
        </div>

        <div className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-sage-700">{whenLine}</p>
              {coachLine ? (
                <p className="ommm-body-muted">{coachLine}</p>
              ) : null}
            </div>
            {statusLabel ? (
              <span className="rounded-full bg-gradient-to-r from-cream-100 to-blue-100 px-4 py-1.5 text-xs font-medium text-sage-900">
                {statusLabel}
              </span>
            ) : null}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-sage-700/10 to-transparent" />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-sage-500">
            {durationLabel ? <span>{durationLabel}</span> : <span aria-hidden />}
            {spotsLabel ? (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-sage-700"
                />
                {spotsLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
