import { useMemo } from "react";
import { useTranslations, useLocale } from "../../../i18n/I18nProvider";
import { intlLocaleTag } from "../../../i18n/locales";

export function useMemberBookingCopy() {
  const locale = useLocale();
  const intlLocale = intlLocaleTag(locale);
  const tCommon = useTranslations("common");
  const tBook = useTranslations("forms.bookSession");
  const tJoin = useTranslations("forms.joinWaitlist");
  const tSchedule = useTranslations("marketingPages.schedule");
  const tNext = useTranslations("account.dashboard.nextClass");
  const tPublic = useTranslations("marketingPublic.home");
  const tClasses = useTranslations("userPages.classes");
  const tWaitlist = useTranslations("account.dashboard.waitlist");

  return useMemo(
    () => ({
      intlLocale,
      loading: tCommon("loading"),
      loadClassesError: tSchedule("loadFailed", { status: "" }),
      emptyClasses: tClasses("noSessions"),
      bookCta: tBook("book"),
      waitlistCta: tJoin("action"),
      bookSuccessTitle: tSchedule("bookSplash.title"),
      bookSuccessBody: tSchedule("bookSplash.body"),
      waitlistSuccessTitle: tWaitlist("title"),
      waitlistSuccessBody: tJoin("success"),
      actionFailedTitle: tBook("bookFailed"),
      actionFailedFallback: tJoin("failed"),
      coachFallback: tSchedule("coach"),
      nextClassBadge: tNext("eyebrow"),
      nextClassStatusBooked: tNext("statusBooked"),
      nextClassOpenLabel: tNext("openLabel"),
      durationMinutes: (minutes: number) => tNext("durationMinutes", { minutes }),
      withCoach: (name: string) =>
        tPublic("weeklyScheduleWithInstructor", { name }),
      capacityLine: (booked: number, capacity: number) =>
        `${booked}/${capacity}`,
      spotsBookedLine: (booked: number, capacity: number) =>
        tClasses("spotsBooked", { booked, capacity }),
      spotsCapacity: (capacity: number) => tSchedule("capacity", { capacity }),
      feedLoadError: tSchedule("loadFailed", { status: "" }),
      waitlistBadge: (index: number, status: string) =>
        tWaitlist("badge", { index, status }),
    }),
    [intlLocale, tBook, tClasses, tCommon, tJoin, tNext, tPublic, tSchedule, tWaitlist],
  );
}

export type MemberBookingCopy = ReturnType<typeof useMemberBookingCopy>;
