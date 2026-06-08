import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { SessionCoachLine } from "@/components/account/session-coach-line";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

const DEFAULT_IMAGE = "/marketing/home/next-class.jpg";

type MemberNextClassEmpty = {
  variant: "empty";
  href: string;
  eyebrow: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
};

type MemberNextClassFilled = {
  variant: "filled";
  href: string;
  locale: string;
  eyebrow: string;
  openLabel: string;
  imageSrc?: string;
  imageAlt: string;
  title: string;
  startsAt: string;
  endsAt: string;
  coachName?: string | null;
  statusLabel?: string;
  spotsLabel?: string | null;
  priorityImage?: boolean;
};

export type MemberNextClassCardProps = MemberNextClassEmpty | MemberNextClassFilled;

export function MemberNextClassCard(props: MemberNextClassCardProps) {
  if (props.variant === "empty") {
    const { href, eyebrow, emptyTitle, emptyBody, emptyCta } = props;
    return (
      <article className={memberChrome.nextClassShell}>
        <div className={memberChrome.nextClassEmptyMedia}>
          <span className={memberChrome.statusPill}>{eyebrow}</span>
          <h3 className="ommm-h2 max-w-[16ch] text-sage-800">{emptyTitle}</h3>
        </div>
        <div className={memberChrome.nextClassBody}>
          <p className={memberChrome.ledeTight}>{emptyBody}</p>
          <Link href={href} className="ommm-admin-add-button w-full text-center sm:w-auto">
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
    locale,
    title,
    startsAt,
    endsAt,
    coachName,
    statusLabel,
    spotsLabel,
    priorityImage = false,
  } = props;

  return (
    <article className={memberChrome.nextClassShell}>
      <div className={memberChrome.nextClassImageWrap}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width:1024px) 38vw, (min-width:640px) 70vw, 92vw"
          className="object-cover"
          {...(priorityImage ? aboveFoldImageProps() : {})}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-900/55 via-sage-900/10 to-transparent" />

        <div className="absolute inset-x-6 top-6 flex items-start justify-between gap-3 sm:inset-x-8 sm:top-8">
          <span className={memberChrome.statusPill}>{eyebrow}</span>
          <Link
            href={href}
            aria-label={openLabel}
            className="ommm-admin-icon-button"
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

      <div className={memberChrome.nextClassBody}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <SessionDateTimeHighlight
                locale={locale}
                startsAt={startsAt}
                endsAt={endsAt}
                variant="listDate"
              />
              <SessionDateTimeHighlight
                locale={locale}
                startsAt={startsAt}
                endsAt={endsAt}
                variant="listTime"
              />
            </div>
            {coachName ? (
              <SessionCoachLine coachName={coachName} variant="list" className="mt-2" />
            ) : null}
          </div>
          {statusLabel ? (
            <span className={memberChrome.statusPill}>{statusLabel}</span>
          ) : null}
        </div>

        {spotsLabel ? (
          <>
            <div className="h-px w-full bg-sand-200/70" />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className={`inline-flex items-center gap-2 ${memberChrome.cardSub}`}>
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-mint-500"
                />
                {spotsLabel}
              </span>
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}
