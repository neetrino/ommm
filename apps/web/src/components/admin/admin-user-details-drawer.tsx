"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";

type UserDetailsPayload = {
  name: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  memberships?: Array<{
    id: string;
    status: string;
    plan: { name: string };
    sessionsRemaining: number | null;
  }>;
  bookings?: Array<{
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
  const [data, setData] = useState<UserDetailsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (userId === null) {
      return;
    }
    void apiFetch<UserDetailsPayload>(`/clients/${userId}`)
      .then((payload) => setData(payload))
      .catch(() => {
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (userId === null) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [userId]);

  if (userId === null || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-end bg-sage-950/35">
      <button
        type="button"
        className="flex-1"
        aria-label={t("drawer.close")}
        onClick={onClose}
      />
      <aside className="h-full w-full max-w-md overflow-auto border-l border-white/60 bg-white/90 p-5 shadow-[-12px_0_32px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-sage-900">{t("drawer.title")}</h3>
          <button
            type="button"
            className="rounded-full border border-white/60 bg-white/80 px-2 py-1 text-sm text-sage-700 hover:bg-white"
            onClick={onClose}
          >
            {t("drawer.close")}
          </button>
        </div>
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
                {t("drawer.memberships")}
              </p>
              <div className="space-y-1">
                {(data.memberships ?? []).length === 0 ? (
                  <p className="text-sage-500">—</p>
                ) : (
                  (data.memberships ?? []).slice(0, 6).map((membership) => (
                    <p key={membership.id} className="rounded-lg bg-sand-50 px-2 py-1 text-xs text-sage-800">
                      {membership.plan.name} · {membership.status} ·{" "}
                      {membership.sessionsRemaining ?? "∞"}
                    </p>
                  ))
                )}
              </div>
            </section>
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage-500">
                {t("drawer.bookings")}
              </p>
              <div className="space-y-1">
                {(data.bookings ?? []).length === 0 ? (
                  <p className="text-sage-500">—</p>
                ) : (
                  (data.bookings ?? []).slice(0, 8).map((booking) => (
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
      </aside>
    </div>,
    document.body,
  );
}
