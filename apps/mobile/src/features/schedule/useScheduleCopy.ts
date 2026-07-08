import { useMemo } from "react";
import { useTranslations, useLocale } from "../../i18n/I18nProvider";
import { intlLocaleTag } from "../../i18n/locales";

export function useScheduleCopy() {
  const locale = useLocale();
  const intlLocale = intlLocaleTag(locale);
  const t = useTranslations("marketingPages.schedule");
  const tCommon = useTranslations("common");

  return useMemo(
    () => ({
      pageTitle: t("pageTitle"),
      filterClassTypeAll: t("filterClassTypeAll"),
      filterInstructorAll: t("filterInstructorAll"),
      prevDatesAria: t("prevDatesAria"),
      nextDatesAria: t("nextDatesAria"),
      emptyTitle: t("emptyTitle"),
      emptyBody: t("emptyBody"),
      loading: tCommon("loading"),
      loadError: t("loadFailed"),
      spotsFull: t("spotsFull"),
      bookCta: t("bookCta"),
      bookedBadge: t("bookedBadge"),
      onWaitlistBadge: t("onWaitlistBadge"),
      coachLabel: t("coach"),
      intlLocale,
      minutesShort: (count: number) => t("minutesShort", { count }),
      spotsLeft: (count: number) => t("spotsLeft", { count }),
    }),
    [intlLocale, t, tCommon],
  );
}

export type ScheduleCopy = ReturnType<typeof useScheduleCopy>;
