"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_BOOKING_STATUS_STATIC_CLASS,
  bookingStatusTone,
  type AdminBookingListStatus,
} from "@/components/admin/admin-booking-list-badges";
import {
  DetailsCard,
  DetailsField,
  DetailsFieldRow,
  DetailsStack,
} from "@/components/shared/details/details-card";
import { CalendarGlyph, MailGlyph, PhoneGlyph } from "@/components/shared/details/details-glyphs";
import type {
  ClientSheetBookingItem,
  ClientSheetPaginatedResponse,
} from "@/components/admin/admin-clients-types";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { displayPhoneOrFallback } from "@/lib/phone";
import { userDisplayInitials } from "@/lib/user-display-initials";

type UserDetailsPayload = {
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
};

const BOOKING_STATUSES = new Set<string>([
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
  "WAITLISTED",
]);

const META_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-sage-500";

const BOOKING_CARD_CLASS = "rounded-2xl border border-sage-500/15 bg-white px-3.5 py-3";

function fullName(name: string | null, lastName: string | null): string {
  const value = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return value.length > 0 ? value : "—";
}

function resolveBookingStatus(status: string): AdminBookingListStatus {
  return BOOKING_STATUSES.has(status) ? (status as AdminBookingListStatus) : "BOOKED";
}

function bookingStatusLabel(
  t: (key: string) => string,
  status: AdminBookingListStatus,
): string {
  if (status === "BOOKED") return t("statusBooked");
  if (status === "COMPLETED") return t("statusCompleted");
  if (status === "CANCELLED") return t("statusCancelled");
  if (status === "WAITLISTED") return t("statusWaitlisted");
  return t("statusMissed");
}

/** Loaded body for the compact user-details sheet (waitlist / bookings lookup). */
export function AdminUserDetailsContent({
  locale,
  userId,
}: {
  locale: string;
  userId: string;
}) {
  const t = useTranslations("adminPages.waitlists");
  const tBookings = useTranslations("adminPages.bookings");
  const [data, setData] = useState<UserDetailsPayload | null>(null);
  const [bookings, setBookings] = useState<ClientSheetBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      apiFetch<UserDetailsPayload>(`/clients/${userId}`),
      apiFetch<ClientSheetPaginatedResponse<ClientSheetBookingItem>>(
        `/clients/${userId}/bookings?take=8&offset=0`,
      ),
    ])
      .then(([profile, bookingsPayload]) => {
        if (cancelled) {
          return;
        }
        setData(profile);
        setBookings(bookingsPayload.items);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-sage-500">{t("drawer.loading")}</p>;
  }

  if (loadFailed) {
    return <p className="text-sm text-red-800">{t("drawer.error")}</p>;
  }

  if (data === null) {
    return <p className="text-sm text-sage-500">{t("drawer.empty")}</p>;
  }

  const displayName = fullName(data.name, data.lastName);

  const phone = displayPhoneOrFallback(data.phone);

  return (
    <DetailsStack>
      <DetailsCard
        title={displayName}
        iconTone="sand"
        icon={
          <span className="text-sm font-semibold" aria-hidden>
            {userDisplayInitials(data.name, data.lastName, data.email)}
          </span>
        }
      >
        <DetailsFieldRow>
          <DetailsField label={t("drawer.phone")} icon={<PhoneGlyph />} title={phone}>
            {data.phone ? (
              <a href={`tel:${data.phone}`} className="hover:underline">
                {phone}
              </a>
            ) : (
              phone
            )}
          </DetailsField>
          <DetailsField label={t("drawer.email")} icon={<MailGlyph />} title={data.email}>
            {data.email}
          </DetailsField>
        </DetailsFieldRow>
      </DetailsCard>

      <DetailsCard title={t("drawer.bookings")} icon={<CalendarGlyph />} iconTone="blue">
        {bookings.length === 0 ? (
          <p className="text-sm text-sage-500">{t("drawer.noBookings")}</p>
        ) : (
          <ul className="space-y-2">
            {bookings.map((booking) => {
              const status = resolveBookingStatus(booking.status);
              const coachName = [booking.session.coach.user.name, booking.session.coach.user.lastName]
                .filter(Boolean)
                .join(" ")
                .trim();
              return (
                <li key={booking.id} className={BOOKING_CARD_CLASS}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 font-semibold leading-snug text-sage-900">
                      {booking.session.classType.name}
                    </p>
                    <span
                      className={`shrink-0 ${ADMIN_BOOKING_STATUS_STATIC_CLASS} ${bookingStatusTone(status)}`}
                    >
                      {bookingStatusLabel(tBookings, status)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs leading-relaxed text-sage-500">
                    <p className="flex min-w-0 items-center gap-1.5">
                      <DashboardNavIcon name="calendar" className={META_ICON_CLASS} />
                      <span className="min-w-0 truncate">
                        {formatDateTimeForUi(booking.session.startsAt, locale)}
                      </span>
                    </p>
                    {coachName.length > 0 ? (
                      <p className="flex min-w-0 items-center gap-1.5">
                        <DashboardNavIcon name="user" className={META_ICON_CLASS} />
                        <span className="min-w-0 truncate">
                          {t("drawer.coachLine", { coachName })}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DetailsCard>
    </DetailsStack>
  );
}
