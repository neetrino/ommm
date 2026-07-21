import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { SCHEDULE_UI_LOCALE } from "@/lib/schedule-ui-locale";

type ScheduleEnglishLocaleProviderProps = {
  children: ReactNode;
};

/** Forces English messages/`useLocale` for public schedule UI subtrees. */
export async function ScheduleEnglishLocaleProvider({
  children,
}: ScheduleEnglishLocaleProviderProps) {
  const messages = await getMessages({ locale: SCHEDULE_UI_LOCALE });

  return (
    <NextIntlClientProvider locale={SCHEDULE_UI_LOCALE} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
