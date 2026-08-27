"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { SessionDateTimeListDateChip } from "@/components/shared/schedule/session-datetime-list-display";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import {
  ADMIN_WAITLIST_LIST_ACTIONS_AREA_CLASS,
  ADMIN_WAITLIST_LIST_ACTIONS_CELL,
  ADMIN_WAITLIST_LIST_CELL,
  ADMIN_WAITLIST_LIST_CLASS_AREA_CLASS,
  ADMIN_WAITLIST_LIST_COUNT_AREA_CLASS,
  ADMIN_WAITLIST_LIST_DATETIME_AREA_CLASS,
  ADMIN_WAITLIST_LIST_DATE_TIME_CELL,
  ADMIN_WAITLIST_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_WAITLIST_LIST_SPACER_CELL,
  ADMIN_WAITLIST_LIST_SUBTITLE_CLASS,
  ADMIN_WAITLIST_LIST_TITLE_CLASS,
  ADMIN_WAITLIST_LIST_USER_AREA_CLASS,
  ADMIN_WAITLIST_LIST_USER_CELL,
  ADMIN_WAITLIST_QUEUE_BADGE_CLASS,
} from "@/components/admin/admin-waitlist-list-layout";
import type { AdminWaitlistRow } from "@/components/admin/admin-waitlist-query";
import { displayPhoneOrFallback } from "@/lib/phone";

type WaitlistCardFieldsProps = {
  locale: string;
  row: AdminWaitlistRow;
  rowBusy: boolean;
  userLabel: string;
  onOpenUser: (userId: string) => void;
  onPromote: () => void;
  onNotify: () => void;
  onRemove: () => void;
};

export function WaitlistCardFields({
  locale,
  row,
  rowBusy,
  userLabel,
  onOpenUser,
  onPromote,
  onNotify,
  onRemove,
}: WaitlistCardFieldsProps) {
  return (
    <>
      <WaitlistUserCell row={row} userLabel={userLabel} onOpenUser={onOpenUser} />
      <div className={`${ADMIN_WAITLIST_LIST_USER_CELL} ${ADMIN_WAITLIST_LIST_CLASS_AREA_CLASS}`}>
        <SessionClassTitle variant="list" name={row.session.classType.name} />
      </div>
      <WaitlistCountCell count={row.sessionWaitlistCount} />
      <WaitlistDateTimeCell locale={locale} waitlistDate={row.waitlistDate} />
      <div className={ADMIN_WAITLIST_LIST_SPACER_CELL} aria-hidden="true" />
      <div
        className={`${ADMIN_WAITLIST_LIST_ACTIONS_CELL} ${ADMIN_WAITLIST_LIST_ACTIONS_AREA_CLASS} ${ADMIN_WAITLIST_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
      >
        <WaitlistRowActions
          rowBusy={rowBusy}
          onOpenUser={() => onOpenUser(row.user.id)}
          onPromote={onPromote}
          onNotify={onNotify}
          onRemove={onRemove}
        />
      </div>
    </>
  );
}

function WaitlistUserCell({
  row,
  userLabel,
  onOpenUser,
}: {
  row: AdminWaitlistRow;
  userLabel: string;
  onOpenUser: (userId: string) => void;
}) {
  return (
    <div className={`${ADMIN_WAITLIST_LIST_USER_CELL} ${ADMIN_WAITLIST_LIST_USER_AREA_CLASS}`}>
      <button
        type="button"
        className={ADMIN_WAITLIST_LIST_TITLE_CLASS}
        onClick={() => onOpenUser(row.user.id)}
      >
        {userLabel}
      </button>
      <p className={ADMIN_WAITLIST_LIST_SUBTITLE_CLASS}>{displayPhoneOrFallback(row.user.phone)}</p>
    </div>
  );
}

function WaitlistCountCell({ count }: { count: number }) {
  const t = useTranslations("adminPages.waitlists");

  return (
    <div className={`${ADMIN_WAITLIST_LIST_CELL} ${ADMIN_WAITLIST_LIST_COUNT_AREA_CLASS} md:text-center`}>
      <span className={ADMIN_WAITLIST_QUEUE_BADGE_CLASS}>{t("waitingBadge", { count })}</span>
    </div>
  );
}

function WaitlistDateTimeCell({
  locale,
  waitlistDate,
}: {
  locale: string;
  waitlistDate: string;
}) {
  const display = buildSessionDateTimeDisplay(locale, waitlistDate, waitlistDate);
  if (display === null) {
    return <div className={ADMIN_WAITLIST_LIST_DATETIME_AREA_CLASS} />;
  }

  return (
    <div className={`${ADMIN_WAITLIST_LIST_DATE_TIME_CELL} ${ADMIN_WAITLIST_LIST_DATETIME_AREA_CLASS}`}>
      <div className="flex min-w-0 items-center gap-3">
        <SessionDateTimeListDateChip display={display} />
        <p className="font-serif text-xl leading-none tracking-tight text-sage-950">
          {display.startTime}
        </p>
      </div>
    </div>
  );
}

function WaitlistRowActions({
  rowBusy,
  onOpenUser,
  onPromote,
  onNotify,
  onRemove,
}: {
  rowBusy: boolean;
  onOpenUser: () => void;
  onPromote: () => void;
  onNotify: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("adminPages.waitlists");

  return (
    <div className="flex items-center justify-end gap-1" role="group" aria-label={t("colActions")}>
      <IconActionButton
        ariaLabel={t("actions.userDetails")}
        title={t("actions.userDetails")}
        className="border-white/60 bg-white/70 text-sage-700 hover:bg-white"
        onClick={onOpenUser}
        disabled={rowBusy}
      >
        <UserGlyph />
      </IconActionButton>
      <IconActionButton
        ariaLabel={t("actions.promote")}
        title={t("actions.promote")}
        className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        onClick={onPromote}
        disabled={rowBusy}
      >
        <ArrowUpGlyph />
      </IconActionButton>
      <IconActionButton
        ariaLabel={t("actions.notify")}
        title={t("actions.notify")}
        className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        onClick={onNotify}
        disabled={rowBusy}
      >
        <BellGlyph />
      </IconActionButton>
      <IconActionButton
        ariaLabel={t("actions.remove")}
        title={t("actions.remove")}
        className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        onClick={onRemove}
        disabled={rowBusy}
      >
        <TrashGlyph />
      </IconActionButton>
    </div>
  );
}

function IconActionButton({
  ariaLabel,
  title,
  className,
  onClick,
  disabled,
  children,
}: {
  ariaLabel: string;
  title: string;
  className: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-50 ${className}`}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function UserGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ArrowUpGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function BellGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
