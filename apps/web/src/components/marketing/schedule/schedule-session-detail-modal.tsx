"use client";

import Image from "next/image";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import {
  SCHEDULE_BOOKED_BTN_COMPACT,
} from "@/components/marketing/schedule/schedule-public-design";
import { coachCardInitials } from "@/components/coaches/coach-card-display";
import {
  SCHEDULE_SESSION_DETAIL_AVATAR_CLASS,
  SCHEDULE_SESSION_DETAIL_BANNER_IMAGE,
  SCHEDULE_SESSION_DETAIL_MOTION_EXIT_MS,
  formatScheduleSessionDetailDate,
  resolveScheduleSessionDetailDescription,
  splitScheduleSessionDetailDescriptionLines,
} from "@/components/marketing/schedule/schedule-session-detail-helpers";
import {
  ScheduleSessionDetailCalendarIcon,
  ScheduleSessionDetailClockIcon,
  ScheduleSessionDetailPinIcon,
} from "@/components/marketing/schedule/schedule-session-detail-icons";
import styles from "@/components/marketing/schedule/schedule-session-detail-modal.module.css";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { useOverlayEnterExitMotion } from "@/hooks/use-overlay-enter-exit-motion";
import { formatScheduleTimeHHmm } from "@/lib/format-time-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type ScheduleSessionDetailModalProps = {
  session: MarketingScheduleItem | null;
  locale: string;
  audience: PublicPackageCategoryCardsAudience;
  studioAddress: string | null;
  mapEmbedHtml: string;
  cancellationHoursNotice: number;
  loginReturnPath: string;
  bookLabel: string;
  userBookingId?: string;
  userBookingCreatedAt?: string;
  bookingStateReady?: boolean;
  isOnWaitlist?: boolean;
  onClose: () => void;
  onBooked?: (sessionId: string, bookingId: string) => void;
  onCancelled?: (sessionId: string) => void;
  onWaitlisted?: (sessionId: string) => void;
  onWaitlistLeft?: (sessionId: string) => void;
};

function formatTimeRange(locale: string, session: MarketingScheduleItem): string {
  const start = formatScheduleTimeHHmm(locale, session.startTime);
  if (session.endTime === null) {
    return start;
  }
  return `${start} – ${formatScheduleTimeHHmm(locale, session.endTime)}`;
}

type SessionDetailBannerProps = {
  titleId: string;
  className: string;
  dateLabel: string | null;
  timeLabel: string;
  studioAddress: string | null;
  level: string;
  dateAria: string;
  timeAria: string;
  locationAria: string;
};

function SessionDetailBanner({
  titleId,
  className,
  dateLabel,
  timeLabel,
  studioAddress,
  level,
  dateAria,
  timeAria,
  locationAria,
}: SessionDetailBannerProps) {
  return (
    <header className={styles.banner}>
      <Image
        src={SCHEDULE_SESSION_DETAIL_BANNER_IMAGE}
        alt=""
        fill
        priority
        sizes="(max-width: 640px) 100vw, 40rem"
        className={styles.bannerImage}
      />
      <div className={styles.bannerScrim} aria-hidden />
      <div className={styles.bannerContent}>
        <h2 id={titleId} className={styles.title}>
          {className}
        </h2>
        <ul className={styles.metaList}>
          {dateLabel !== null ? (
            <li className={styles.metaItem}>
              <ScheduleSessionDetailCalendarIcon className={styles.metaIcon} />
              <span>
                <span className="sr-only">{dateAria}: </span>
                {dateLabel}
              </span>
            </li>
          ) : null}
          <li className={styles.metaItem}>
            <ScheduleSessionDetailClockIcon className={styles.metaIcon} />
            <span>
              <span className="sr-only">{timeAria}: </span>
              {timeLabel}
            </span>
          </li>
          {studioAddress !== null && studioAddress.trim().length > 0 ? (
            <li className={styles.metaItem}>
              <ScheduleSessionDetailPinIcon className={styles.metaIcon} />
              <span>
                <span className="sr-only">{locationAria}: </span>
                {studioAddress}
              </span>
            </li>
          ) : null}
        </ul>
        {level.length > 0 ? <span className={styles.level}>{level}</span> : null}
      </div>
    </header>
  );
}

/** Public schedule session detail — banner + map + package description + teacher. */
export function ScheduleSessionDetailModal({
  session,
  locale,
  audience,
  studioAddress,
  mapEmbedHtml,
  cancellationHoursNotice,
  loginReturnPath,
  bookLabel,
  userBookingId,
  userBookingCreatedAt,
  bookingStateReady = true,
  isOnWaitlist = false,
  onClose,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
}: ScheduleSessionDetailModalProps) {
  const t = useTranslations("marketingPages.schedule.sessionDetail");
  const titleId = useId();
  const isOpen = session !== null;
  const { presented, motionOpen, requestClose } = useOverlayEnterExitMotion(
    isOpen,
    onClose,
    { exitMs: SCHEDULE_SESSION_DETAIL_MOTION_EXIT_MS },
  );
  const description =
    session !== null ? resolveScheduleSessionDetailDescription(session) : null;
  const descriptionLines =
    description !== null
      ? splitScheduleSessionDetailDescriptionLines(description)
      : [];
  const level = session?.level?.trim() ?? "";
  const avatarSrc =
    session?.instructorAvatarUrl != null
      ? resolveApiAssetUrl(session.instructorAvatarUrl) ?? session.instructorAvatarUrl
      : null;
  const bio = session?.instructorBio?.trim() || null;
  const dateLabel =
    session !== null
      ? formatScheduleSessionDetailDate(locale, session.sessionDate)
      : null;
  const panelClassName = [
    styles.panel,
    motionOpen ? styles.panelOpen : styles.panelClosing,
  ].join(" ");

  return (
    <OmmModalPortal
      isOpen={presented}
      onClose={requestClose}
      backdropAriaLabel={t("closeBackdrop")}
      ariaLabelledBy={titleId}
      motionState={motionOpen ? "open" : "closed"}
      overlayClassName={`${styles.overlay} ommm-modal-overlay z-[120]`}
      panelClassName={panelClassName}
    >
      {session !== null ? (
        <div className={styles.inner}>
          <div className={styles.scroll}>
            <SessionDetailBanner
              titleId={titleId}
              className={session.className}
              dateLabel={dateLabel}
              timeLabel={formatTimeRange(locale, session)}
              studioAddress={studioAddress}
              level={level}
              dateAria={t("date")}
              timeAria={t("time")}
              locationAria={t("location")}
            />

            <section className={styles.mapSection} aria-label={t("mapAria")}>
              <div
                className={styles.mapFrame}
                dangerouslySetInnerHTML={{ __html: mapEmbedHtml }}
              />
            </section>

            <div className={styles.body}>
              {descriptionLines.length > 0 ? (
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>{t("descriptionHeading")}</h3>
                  <ul className={styles.conditionsList}>
                    {descriptionLines.map((line, index) => (
                      <li key={`${index}-${line.slice(0, 24)}`}>{line}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("conditionsHeading")}</h3>
                <ul className={styles.conditionsList}>
                  <li>{t("conditionCancel", { hours: cancellationHoursNotice })}</li>
                  <li>{t("conditionLastBooking")}</li>
                </ul>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>{t("teacherHeading")}</h3>
                <div className={styles.teacherRow}>
                  <MemberProfileAvatar
                    initials={coachCardInitials({
                      name: session.instructorName,
                      email: session.instructorName,
                      avatarUrl: session.instructorAvatarUrl ?? null,
                    })}
                    imageSrc={avatarSrc}
                    className={SCHEDULE_SESSION_DETAIL_AVATAR_CLASS}
                    guestIconClassName={SCHEDULE_SESSION_DETAIL_AVATAR_CLASS}
                  />
                  <p className={styles.teacherName}>{session.instructorName}</p>
                </div>
                {bio !== null ? <p className={styles.teacherBio}>{bio}</p> : null}
              </section>
            </div>
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.footerCloseBtn}
              onClick={requestClose}
            >
              {t("close")}
            </button>
            <AuthAwareScheduleBookingAction
              sessionId={session.id}
              sessionDate={session.sessionDate}
              sessionStartTime={session.startTime}
              availableSpots={session.availableSpots}
              sessionStatus={session.status}
              bookLabel={bookLabel}
              audience={audience}
              className={styles.footerBookBtn}
              bookedClassName={SCHEDULE_BOOKED_BTN_COMPACT}
              cancelClassName={styles.footerCancelBtn}
              userBookingId={userBookingId}
              userBookingCreatedAt={userBookingCreatedAt}
              bookingStateReady={bookingStateReady}
              initialOnWaitlist={isOnWaitlist}
              loginReturnPath={loginReturnPath}
              onBooked={(bookingId) => onBooked?.(session.id, bookingId)}
              onCancelled={() => onCancelled?.(session.id)}
              onWaitlisted={() => onWaitlisted?.(session.id)}
              onWaitlistLeft={() => onWaitlistLeft?.(session.id)}
            />
          </footer>
        </div>
      ) : null}
    </OmmModalPortal>
  );
}
