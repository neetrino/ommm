"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

type UserDetailsPayload = {
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
};

type UserBookingsPreview = {
  items: Array<{
    id: string;
    status: string;
    session: { startsAt: string; classType: { name: string } };
  }>;
};

type AdminUserDetailsDrawerProps = {
  locale: string;
  userId: string | null;
  onClose: () => void;
};

function fullName(name: string | null, lastName: string | null): string {
  const value = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return value.length > 0 ? value : "—";
}

export function AdminUserDetailsDrawer({
  locale,
  userId,
  onClose,
}: AdminUserDetailsDrawerProps) {
  const t = useTranslations("adminPages.waitlists");
  const titleId = useId();
  const [data, setData] = useState<UserDetailsPayload | null>(null);
  const [bookings, setBookings] = useState<UserBookingsPreview["items"]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (userId === null) {
      return;
    }
    setLoading(true);
    setLoadFailed(false);
    void Promise.all([
      apiFetch<UserDetailsPayload>(`/clients/${userId}`),
      apiFetch<UserBookingsPreview>(`/clients/${userId}/bookings?take=8&offset=0`),
    ])
      .then(([profile, bookingsPayload]) => {
        setData(profile);
        setBookings(bookingsPayload.items);
      })
      .catch(() => {
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <OmmDrawerPortal
      isOpen={userId !== null}
      onClose={onClose}
      backdropAriaLabel={t("drawer.close")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
            {t("drawer.title")}
          </h2>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={t("drawer.close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {loading ? (
          <p className="text-sm text-sage-600">{t("drawer.loading")}</p>
        ) : loadFailed ? (
          <p className="text-sm text-red-800">{t("drawer.error")}</p>
        ) : data === null ? (
          <p className="text-sm text-sage-600">{t("drawer.empty")}</p>
        ) : (
          <div className="space-y-4 text-sm">
            <section className="rounded-xl border border-white/60 bg-white/80 p-3">
              <p className="font-medium text-sage-900">{fullName(data.name, data.lastName)}</p>
              <p className="text-sage-700">{data.phone ?? "—"}</p>
              <p className="text-sage-600">{data.email}</p>
            </section>
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-500">
                {t("drawer.bookings")}
              </p>
              <div className="space-y-1">
                {bookings.length === 0 ? (
                  <p className="text-sage-500">—</p>
                ) : (
                  bookings.map((booking) => (
                    <p key={booking.id} className="rounded-lg bg-white px-2 py-1 text-xs text-sage-800">
                      {formatDateTimeForUi(booking.session.startsAt, locale)} ·{" "}
                      {booking.session.classType.name} · {booking.status}
                    </p>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </OmmDrawerPortal>
  );
}
