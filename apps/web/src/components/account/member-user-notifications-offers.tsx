"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { formatTimeForUi } from "@/lib/format-time-display";

type BookSessionResponse = {
  id: string;
};

function formatSessionWhen(locale: string, startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const time = formatTimeForUi(start, locale);
  const endTime = formatTimeForUi(end, locale);
  return `${date} · ${time} – ${endTime}`;
}

/** In-app waitlist spot-open notifications (GET /waitlist/me OFFERED rows). */
export function MemberUserNotificationsOffers() {
  const locale = useLocale();
  const tHeader = useTranslations("headerNotifications");
  const t = useTranslations("userPages.notifications");
  const router = useRouter();
  const { offeredRows, loading, error, refetch } = useMemberWaitlistData(true);
  const [bookError, setBookError] = useState<string | null>(null);

  async function bookSession(sessionId: string): Promise<void> {
    setBookError(null);
    try {
      await apiFetch<BookSessionResponse>(`/bookings/sessions/${sessionId}`, {
        method: "POST",
      });
      dispatchNotificationsRefresh();
      router.refresh();
      await refetch({ silent: true });
    } catch (bookErr) {
      setBookError(bookErr instanceof ApiError ? bookErr.message : tHeader("bookFailed"));
    }
  }

  return (
    <section className="rounded-[20px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_-24px_rgba(45,40,35,0.2)]">
      <h2 className="text-base font-semibold text-sage-900">{t("offersHeading")}</h2>
      <p className="mt-1 text-sm text-sage-600">{t("offersDescription")}</p>
      {loading ? (
        <p className="mt-4 text-sm text-sage-500">{tHeader("loading")}</p>
      ) : error ? (
        <p className="mt-4 text-sm text-amber-900">{tHeader("loadError")}</p>
      ) : offeredRows.length === 0 ? (
        <p className="mt-4 text-sm text-sage-500">{tHeader("empty")}</p>
      ) : (
        <ul className="mt-4 list-none space-y-3 p-0">
          {offeredRows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-white/60 bg-white/90 px-4 py-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                {tHeader("spotOpenedBadge")}
              </p>
              <p className="mt-1 text-sm font-semibold text-sage-900">
                {row.session.classType.name}
              </p>
              <p className="mt-0.5 text-xs text-sage-600">
                {formatSessionWhen(locale, row.session.startsAt, row.session.endsAt)}
              </p>
              <div className="mt-2">
                <OmmButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    void bookSession(row.session.id);
                  }}
                >
                  {tHeader("bookNow")}
                </OmmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
      {bookError ? <p className="mt-3 text-xs text-amber-900">{bookError}</p> : null}
    </section>
  );
}
