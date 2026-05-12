import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NextClassCardView } from "@/components/wellness/next-class-card-view";
import { WaitlistCardsSection } from "@/components/wellness/waitlist-cards-section";
import { waitlistToneAtIndex } from "@/components/wellness/waitlist-tone";
import { formatSessionRange } from "@/lib/format-session-time";

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
  /** Absolute URL for optional member-only Home hero image. */
  homeImageSrc?: string | null;
  nextBooking: NextBooking | null;
  waitlistOk: boolean;
  waitlistRows: WaitlistRow[];
  achievements: AchievementRow[];
  coachProfileId: string | null;
};

function memberInitial(display: string): string {
  const ch = display.trim()[0];
  return ch ? ch.toUpperCase() : "?";
}

function shortFirstName(display: string): string {
  const trimmed = display.trim();
  const part = trimmed.split(/\s+/)[0];
  return part ?? trimmed;
}

function minutesBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.round(ms / 60_000));
}

export async function MemberDashboard({
  locale,
  displayName,
  homeImageSrc,
  nextBooking,
  waitlistOk,
  waitlistRows,
  achievements,
  coachProfileId,
}: MemberDashboardProps) {
  const t = await getTranslations("account.dashboard");
  const shortName = shortFirstName(displayName);
  const initial = memberInitial(shortName || displayName);

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
        timeLine: new Date(w.session.startsAt).toLocaleString(locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        tone: waitlistToneAtIndex(index),
      }))
    : [];

  const waitlistEmptyMessage = waitlistOk
    ? t("waitlist.empty")
    : t("waitlist.error");

  return (
    <div className="space-y-0">
      <section className="ommm-bg-wellness relative -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
        >
          <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cream-50/50 blur-3xl" />
          <div className="absolute right-[-6rem] top-1/2 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute left-1/3 top-[42%] h-72 w-72 rounded-full bg-peach-100/45 blur-3xl" />
        </div>

        <div className="relative space-y-12 pb-[clamp(3rem,6vw,5.5rem)] sm:space-y-14 lg:space-y-16">
          {homeImageSrc ? (
            <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border border-white/70 shadow-[0_24px_80px_-40px_rgba(51,69,55,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={homeImageSrc}
                alt=""
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="grid w-full grid-cols-1 items-center gap-10 pb-2 pt-8 sm:gap-12 sm:pt-10 lg:grid-cols-12 lg:gap-14 lg:pt-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sand-500/30 text-sm font-medium text-sage-700 ring-1 ring-white/70 sm:h-14 sm:w-14">
                {initial}
              </span>
              <p className="font-serif italic text-sage-500">
                <span className="block text-base sm:text-lg">{t("greeting")}</span>
                <span className="block text-base font-medium text-sage-700 sm:text-lg">
                  {shortName || displayName}
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
              <Link href="/user/classes" className="ommm-cta-primary">
                {t("primaryCta")}
              </Link>
              <Link href="/user/memberships" className="ommm-cta-ghost">
                {t("secondaryCta")}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            {nextBooking ? (
              <NextClassCardView
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
              <NextClassCardView
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

        <WaitlistCardsSection
          embedded
          title={t("waitlist.title")}
          lead={t("waitlist.lead")}
          emptyMessage={waitlistEmptyMessage}
          items={waitlistItems}
        />

        <div className="w-full">
          <h2 className="ommm-h2">{t("achievements.title")}</h2>
          {achievements.length === 0 ? (
            <p className="mt-4 max-w-xl text-sm text-sage-500">
              {t("achievements.empty")}
            </p>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <li
                  key={`${a.title}-${a.unlockedAt}`}
                  className="rounded-[24px] border border-white/70 bg-white/70 p-5 backdrop-blur-md"
                >
                  <p className="font-medium text-sage-900">{a.title}</p>
                  <p className="mt-2 text-xs text-sage-500">
                    {new Date(a.unlockedAt).toLocaleDateString(locale)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/55 p-8 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-sage-800 sm:text-2xl">
                {t("explore.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-sage-500">{t("explore.body")}</p>
            </div>
            <Link href="/explore" className="ommm-cta-ghost shrink-0">
              {t("explore.cta")}
            </Link>
          </div>

          {coachProfileId ? (
            <div className="mt-6 rounded-[28px] border border-indigo-200/80 bg-indigo-50/90 p-6 backdrop-blur-md">
              <h2 className="font-serif text-lg font-semibold text-indigo-950">
                {t("coach.title")}
              </h2>
              <Link
                href="/coach/home"
                className="mt-3 inline-block text-sm font-semibold text-indigo-900 underline-offset-4 hover:underline"
              >
                {t("coach.cta")}
              </Link>
            </div>
          ) : null}
        </div>
        </div>
      </section>
    </div>
  );
}
