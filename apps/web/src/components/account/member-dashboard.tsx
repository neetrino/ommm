import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { MemberNextClassCard } from "@/components/account/member-next-class-card";
import { MemberWaitlistSection } from "@/components/account/member-waitlist-section";
import homeViewportStyles from "@/components/account/member-user-home-viewports.module.css";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { CircularBackLink } from "@/components/ui/circular-back-link";
import { formatDateForUi } from "@/lib/date-display";
import { MARKETING_SCHEDULE_PATH } from "@/lib/auth-redirect";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
import { userDisplayName } from "@/lib/user-display-name";

type NextBooking = {
  id: string;
  className: string;
  startsAt: string;
  endsAt: string;
  coachName: string | null;
};

type WaitlistRow = {
  id: string;
  status: string;
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

type AchievementRow = { title: string; unlockedAt: string };

export type MemberDashboardProps = {
  locale: string;
  name: string | null;
  lastName: string | null;
  email: string;
  nextBooking: NextBooking | null;
  waitlistOk: boolean;
  waitlistRows: WaitlistRow[];
  achievements: AchievementRow[];
  coachProfileId: string | null;
  /** Mobile hub entry — frosted circle back to `/user`. */
  showBackToAccount?: boolean;
};

function resolveCoachName(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export async function MemberDashboard({
  locale,
  name,
  lastName,
  email,
  nextBooking,
  waitlistOk,
  waitlistRows,
  achievements,
  coachProfileId,
  showBackToAccount = false,
}: MemberDashboardProps) {
  const t = await getTranslations({ locale, namespace: "account.dashboard" });
  const greetingName = userDisplayName(name, lastName, email);

  const bookClassHref = MARKETING_SCHEDULE_PATH;
  const nextBookingHref = "/user/bookings";
  const nextImage = "/marketing/home/next-class.webp";

  const waitlistItems = waitlistOk
    ? waitlistRows.map((w, index) => ({
        id: w.id,
        spotLabel: t("waitlist.badge", {
          index: index + 1,
          status: w.status,
        }),
        title: w.session.classType.name,
        startsAt: w.session.startsAt,
        endsAt: w.session.endsAt,
        coachName: resolveCoachName(w.session.coach.user.name),
      }))
    : [];

  const waitlistEmptyMessage = waitlistOk
    ? t("waitlist.empty")
    : t("waitlist.error");

  return (
    <MemberContentFrame>
      {showBackToAccount ? (
        <div className={`${homeViewportStyles.mobileViewport} mb-4`}>
          <CircularBackLink
            href={USER_ACCOUNT_PATH}
            ariaLabel={t("backToAccountAria")}
          />
        </div>
      ) : null}
      <div className="space-y-10 pb-4 sm:space-y-12">
        <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <div className="space-y-2">
              <p className={`${memberChrome.greeting} text-base sm:text-lg`}>
                {t("greeting")}
              </p>
              <p className={`${memberChrome.greeting} max-w-xl text-base sm:text-lg`}>
                {t("welcomeSubtitleBefore")}
                <span className="font-medium text-sage-800">{greetingName}</span>
                {t("welcomeSubtitleAfter")}
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
              <Link href={bookClassHref} className="ommm-admin-add-button">
                {t("primaryCta")}
              </Link>
              <Link
                href={bookClassHref}
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
                href={nextBookingHref}
                locale={locale}
                eyebrow={t("nextClass.eyebrow")}
                openLabel={t("nextClass.openLabel")}
                imageSrc={nextImage}
                imageAlt={nextBooking.className}
                title={nextBooking.className}
                startsAt={nextBooking.startsAt}
                endsAt={nextBooking.endsAt}
                coachName={nextBooking.coachName}
                statusLabel={t("nextClass.statusBooked")}
                spotsLabel={null}
                priorityImage
              />
            ) : (
              <MemberNextClassCard
                variant="empty"
                href={bookClassHref}
                eyebrow={t("nextClass.eyebrow")}
                emptyTitle={t("nextClass.emptyTitle")}
                emptyBody={t("nextClass.emptyBody")}
                emptyCta={t("nextClass.emptyCta")}
              />
            )}
          </div>
        </div>

        <MemberWaitlistSection
          locale={locale}
          title={t("waitlist.title")}
          lead={t("waitlist.lead")}
          emptyMessage={waitlistEmptyMessage}
          items={waitlistItems}
        />

        <section className="w-full">
          <h2 className={memberChrome.sectionTitle}>{t("achievements.title")}</h2>
          {achievements.length === 0 ? (
            <p className={`${memberChrome.emptyState} mt-4`}>
              {t("achievements.empty")}
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((a) => (
                <li key={`${a.title}-${a.unlockedAt}`} className={memberChrome.achievementCard}>
                  <p className="font-serif text-xl leading-snug text-sage-950">{a.title}</p>
                  <p className={`${memberChrome.cardMeta} mt-3`}>
                    {formatDateForUi(a.unlockedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="w-full">
          <div className={memberChrome.explorePanel}>
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
