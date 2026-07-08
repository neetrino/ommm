import { useMemo } from "react";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { intlLocaleTag } from "../../../i18n/locales";

const BOOKING_STATUS_KEYS = [
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
] as const;

export function useMemberBookingsCopy() {
  const locale = useLocale();
  const intlLocale = intlLocaleTag(locale);
  const tCommon = useTranslations("common");
  const tBookings = useTranslations("userPages.bookings");
  const tSubtitle = useTranslations("dashboard.subtitles.user");
  const tNext = useTranslations("account.dashboard.nextClass");
  const tSchedule = useTranslations("marketingPages.schedule");
  const tRetry = useTranslations("adminPages.classes.classTypes");
  const tMarketing = useTranslations("marketing");

  return useMemo(
    () => ({
      intlLocale,
      title: tBookings("title"),
      lead: tSubtitle("bookings"),
      loading: tCommon("loading"),
      loadErrorFallback: tBookings("loadError", { status: "" }),
      signInRequired: tBookings("signInRequired"),
      tabs: {
        aria: tBookings("tabs.aria"),
        upcoming: tBookings("tabs.perfect"),
        past: tBookings("tabs.past"),
      },
      emptyUpcomingTitle: tBookings("emptyPerfectTitle"),
      emptyUpcomingDescription: tBookings("emptyPerfectDescription"),
      emptyPastTitle: tBookings("emptyPastTitle"),
      emptyPastDescription: tBookings("emptyPastDescription"),
      browseScheduleCta: tNext("emptyCta"),
      coachFallback: tBookings("coachFallback"),
      retryLabel: tRetry("retryButton"),
      durationMinutes: (minutes: number) => tNext("durationMinutes", { minutes }),
      statusLabel: (status: string) => {
        if (
          BOOKING_STATUS_KEYS.includes(
            status as (typeof BOOKING_STATUS_KEYS)[number],
          )
        ) {
          return tBookings(
            `status.${status as (typeof BOOKING_STATUS_KEYS)[number]}`,
          );
        }
        return status.replace(/_/g, " ");
      },
      sessionTypeLabel: tSchedule("pageTitle"),
      listHeaderDate: tBookings("listHeaderDate"),
      listHeaderTime: tBookings("listHeaderTime"),
      coachHeader: tCommon("sessionCoach"),
      durationHeader: tMarketing("packagesDetailsDurationLabel"),
    }),
    [
      intlLocale,
      tBookings,
      tCommon,
      tMarketing,
      tNext,
      tRetry,
      tSchedule,
      tSubtitle,
    ],
  );
}

export type MemberBookingsCopy = ReturnType<typeof useMemberBookingsCopy>;
