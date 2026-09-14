"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_BOOKING_STATUS_STATIC_CLASS,
  bookingStatusTone,
  type AdminBookingListStatus,
} from "@/components/admin/admin-booking-list-badges";
import {
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
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

const PROFILE_AVATAR_CLASS =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand-700 text-sm font-semibold text-cream-50 ring-2 ring-white";

const META_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-mint-600";

const BOOKING_CARD_CLASS = [
  "rounded-2xl border border-white/70 bg-white/80 px-3.5 py-3",
  "shadow-[0_8px_24px_-20px_rgba(45,40,35,0.22)]",
].join(" ");

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
    return <p className="text-sm text-sage-600">{t("drawer.loading")}</p>;
  }

  if (loadFailed) {
    return <p className="text-sm text-red-800">{t("drawer.error")}</p>;
  }

  if (data === null) {
    return <p className="text-sm text-sage-600">{t("drawer.empty")}</p>;
  }

  const displayName = fullName(data.name, data.lastName);

  return (
    <div className="space-y-5">
      <section className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
        <div className="flex items-center gap-3">
          <span className={PROFILE_AVATAR_CLASS} aria-hidden>
            {userDisplayInitials(data.name, data.lastName, data.email)}
          </span>
          <p className="min-w-0 truncate font-semibold text-sage-900">{displayName}</p>
        </div>
        <dl className="mt-4 space-y-3 border-t border-sage-100 pt-4">
          <DetailRow
            icon="phone"
            label={t("drawer.phone")}
            value={displayPhoneOrFallback(data.phone)}
          />
          <DetailRow icon="mail" label={t("drawer.email")} value={data.email} />
        </dl>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("drawer.bookings")}
        </p>
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
      </section>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: "phone" | "mail";
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <dt className="flex items-center gap-1.5">
        <DetailIcon name={icon} />
        <span className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</span>
      </dt>
      <dd className={`min-w-0 break-words text-right ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>
        {value}
      </dd>
    </div>
  );
}

function DetailIcon({ name }: { name: "phone" | "mail" }) {
  if (name === "phone") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={META_ICON_CLASS}
        aria-hidden
      >
        <path d="M22 16.9v2.2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h2.2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.9a16 16 0 0 0 6 6l1.5-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.1z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={META_ICON_CLASS}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}
