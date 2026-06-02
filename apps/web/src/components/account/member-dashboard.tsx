import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { MemberNextClassCard } from "@/components/account/member-next-class-card";
import { MemberWaitlistSection } from "@/components/account/member-waitlist-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatDateForUi } from "@/lib/date-display";
import { formatSessionRange } from "@/lib/format-session-time";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { userDisplayInitials } from "@/lib/user-display-initials";

type NextBooking = {
  id: string;
  className: string;
  startsAt: string;
  endsAt: string;
};

type WaitlistRow = {
  id: string;
  status: string;
  session: { startsAt: string; classType: { name: string } };
};

type AchievementRow = { title: string; unlockedAt: string };

export type MemberDashboardProps = {
  locale: string;
  displayName: string;
  name: string | null;
  lastName: string | null;
  email: string;
  homeImageSrc?: string | null;
  nextBooking: NextBooking | null;
  waitlistOk: boolean;
  waitlistRows: WaitlistRow[];
  achievements: AchievementRow[];
  coachProfileId: string | null;
};

function shortFirstName(display: string): string {
  const trimmed = display.trim();
  const part = trimmed.split(/\s+/)[0];
  return part ?? trimmed;
}

function minutesBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.round(ms / 60_000));
}

function formatDateTimeLabel(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${formatDateForUi(date)} ${time}`;
}

export async function MemberDashboard({
  locale,
  displayName,
  name,
  lastName,
  email,
  homeImageSrc,
  nextBooking,
  waitlistOk,
  waitlistRows,
  achievements,
  coachProfileId,
}: MemberDashboardProps) {
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  const shortName = shortFirstName(displayName);
  const initial = userDisplayInitials(name, lastName, email);

  const nextHref = "/user/classes";
  const nextImage = "/marketing/home/next-class.jpg";

  const waitlistItems = waitlistOk
    ? waitlistRows.map((w, index) => ({
        id: w.id,
        spotLabel: t("waitlist.badge", {
          index: index + 1,
          status: w.status,
        }),
        title: w.session.classType.name,
        timeLine: formatDateTimeLabel(w.session.startsAt, locale),
      }))
    : [];

  const waitlistEmptyMessage = waitlistOk
    ? t("waitlist.empty")
    : t("waitlist.error");

  return (
    <MemberContentFrame>
      <div className="space-y-10 pb-4 sm:space-y-12">
        <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className={memberChrome.avatar}>
                {homeImageSrc ? (
                  <Image
                    src={homeImageSrc}
                    alt=""
                    width={56}
                    height={56}
                    sizes="56px"
                    className="h-full w-full object-cover"
                    {...belowFoldImageProps()}
                  />
                ) : (
                  initial
                )}
              </span>
              <p className={memberChrome.greeting}>
                <span className="block text-base sm:text-lg">{t("greeting")}</span>
                <span className={`${memberChrome.greetingName} text-base sm:text-lg`}>
                  {shortName || displayName}
                </span>
              </p>
            </div>

            <h1 className={`${memberChrome.heroTitle} mt-8`}>
              {t("titleStart")}{" "}
              <span className="font-serif italic text-[#97907c]">
                {t("titleAccent")}
              </span>
            </h1>

            <p className={memberChrome.heroLead}>{t("lead")}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/user/classes" className="ommm-admin-add-button">
                {t("primaryCta")}
              </Link>
              <Link
                href="/user/packages"
                className="ommm-admin-pill-tab shrink-0 px-5 py-2.5 normal-case tracking-normal"
              >
                {t("secondaryCta")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            {nextBooking ? (
              <MemberNextClassCard
                variant="filled"
                href={nextHref}
                eyebrow={t("nextClass.eyebrow")}
                openLabel={t("nextClass.openLabel")}
                imageSrc={nextImage}
                imageAlt={nextBooking.className}
                title={nextBooking.className}
                whenLine={formatSessionRange(
                  locale,
                  nextBooking.startsAt,
                  nextBooking.endsAt,
                )}
                coachLine={null}
                statusLabel={t("nextClass.statusBooked")}
                durationLabel={t("nextClass.durationMinutes", {
                  minutes: String(
                    minutesBetween(nextBooking.startsAt, nextBooking.endsAt),
                  ),
                })}
                spotsLabel={null}
                priorityImage
              />
            ) : (
              <MemberNextClassCard
                variant="empty"
                href={nextHref}
                eyebrow={t("nextClass.eyebrow")}
                emptyTitle={t("nextClass.emptyTitle")}
                emptyBody={t("nextClass.emptyBody")}
                emptyCta={t("nextClass.emptyCta")}
              />
            )}
          </div>
        </div>

        <MemberWaitlistSection
          title={t("waitlist.title")}
          lead={t("waitlist.lead")}
          emptyMessage={waitlistEmptyMessage}
          items={waitlistItems}
        />

        <section className="w-full">
          <h2 className={memberChrome.sectionTitle}>{t("achievements.title")}</h2>
          {achievements.length === 0 ? (
            <p className={`${memberChrome.ledeTight} mt-4`}>
              {t("achievements.empty")}
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <li key={`${a.title}-${a.unlockedAt}`} className={memberChrome.panel}>
                  <p className="font-medium text-sage-900">{a.title}</p>
                  <p className={`${memberChrome.metaText} mt-2`}>
                    {formatDateForUi(a.unlockedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="w-full">
          <div
            className={`${memberChrome.panel} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}
          >
            <div>
              <h2 className={memberChrome.panelHeading}>{t("explore.title")}</h2>
              <p className={`${memberChrome.ledeTight} mt-2`}>{t("explore.body")}</p>
            </div>
            <Link
              href="/explore"
              className="ommm-admin-pill-tab shrink-0 px-5 py-2.5 normal-case tracking-normal"
            >
              {t("explore.cta")}
            </Link>
          </div>

          {coachProfileId ? (
            <div className={memberChrome.coachNotice}>
              <h2 className={memberChrome.panelHeading}>{t("coach.title")}</h2>
              <Link
                href="/coach/home"
                className="ommm-link-sage mt-3 inline-block text-sm font-semibold"
              >
                {t("coach.cta")}
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </MemberContentFrame>
  );
}
