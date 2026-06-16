"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  isActiveSessionRegistration,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { ApiError, apiFetch } from "@/lib/api";
import { formatPhoneDisplay } from "@/lib/phone";
import { formatDateTimeForUi } from "@/lib/date-display";
import { userDisplayName } from "@/lib/user-display-name";

const MODAL_PANEL_CLASS =
  "w-full max-w-lg rounded-[28px] border border-sand-200/80 bg-white p-6 shadow-[0_24px_48px_-28px_rgba(45,40,35,0.35)]";

type AdminSessionRegistrationsModalProps = {
  isOpen: boolean;
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  locale: string;
  booked: number;
  capacity: number;
  onClose: () => void;
};

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
}

function memberContactLine(user: SessionRegistrationRow["user"]): string {
  if (user.phone?.trim()) {
    return formatPhoneDisplay(user.phone);
  }
  return user.email.trim();
}

export function AdminSessionRegistrationsModal({
  isOpen,
  sessionId,
  sessionTitle,
  startsAt,
  locale,
  booked,
  capacity,
  onClose,
}: AdminSessionRegistrationsModalProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const titleId = useId();
  const descId = useId();
  type RegistrationsFetchResult = {
    key: string;
    rows: readonly SessionRegistrationRow[];
    error: string | null;
  };

  const [fetchResult, setFetchResult] = useState<RegistrationsFetchResult | null>(null);
  const fetchKey = isOpen ? sessionId : null;
  const loading = fetchKey !== null && (fetchResult === null || fetchResult.key !== fetchKey);
  const rows = fetchResult?.key === fetchKey ? fetchResult.rows : [];
  const error = fetchResult?.key === fetchKey ? fetchResult.error : null;

  useEffect(() => {
    if (fetchKey === null) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<SessionRegistrationRow[]>(
      `/bookings/admin?sessionId=${encodeURIComponent(sessionId)}`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setFetchResult({
          key: fetchKey,
          rows: payload.filter(isActiveSessionRegistration),
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }
        setFetchResult({
          key: fetchKey,
          rows: [],
          error: err instanceof ApiError ? err.message : t("error"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchKey, sessionId, t]);

  const subtitle = useMemo(
    () =>
      t("subtitle", {
        count: booked,
        capacity,
      }),
    [booked, capacity, t],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("backdropClose")}
      overlayClassName="ommm-modal-overlay z-[110] p-4"
      panelClassName={MODAL_PANEL_CLASS}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
            {t("title")}
          </h2>
          <p id={descId} className="text-sm leading-relaxed text-sage-700">
            {sessionTitle}
          </p>
          <p className="text-xs text-sage-500">
            {formatDateTimeForUi(startsAt, locale)}
          </p>
          <p className="text-sm font-medium text-sage-800">{subtitle}</p>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-6 text-center text-sm text-sage-600">
            {t("loading")}
          </p>
        ) : error !== null ? (
          <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900" role="alert">
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-sand-200/80 bg-sand-50/70 px-4 py-6 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          <ul className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto pr-1">
            {rows.map((row) => {
              const displayName = userDisplayName(row.user.name, null, row.user.email);
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 rounded-2xl border border-sand-200/80 bg-sand-50/60 px-4 py-3"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-100 font-serif text-sm text-sage-800"
                    aria-hidden
                  >
                    {memberInitials(displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sage-900">{displayName}</p>
                    <p className="truncate text-xs text-sage-500">{memberContactLine(row.user)}</p>
                    <p className="mt-0.5 text-[11px] text-sage-400">
                      {t("registeredAt", {
                        date: formatDateTimeForUi(row.createdAt, locale),
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end pt-1">
          <OmmButton type="button" variant="secondary" size="sm" onClick={onClose}>
            {t("closeButton")}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}
