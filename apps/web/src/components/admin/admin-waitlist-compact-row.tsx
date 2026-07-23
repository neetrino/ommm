"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_WAITLIST_LIST_ACTIONS_CELL,
  ADMIN_WAITLIST_LIST_CELL,
  ADMIN_WAITLIST_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_WAITLIST_LIST_ROW_CLASS,
  ADMIN_WAITLIST_LIST_SPACER_CELL,
} from "@/components/admin/admin-waitlist-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import { displayPhoneOrFallback } from "@/lib/phone";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminWaitlistRow = {
  id: string;
  waitlistDate: string;
  sessionWaitlistCount: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    classType: { id: string; name: string };
  };
};

type AdminWaitlistCompactRowProps = {
  locale: string;
  row: AdminWaitlistRow;
  rowBusy: boolean;
  userLabel: string;
  onOpenUser: (userId: string) => void;
  onPromote: () => void;
  onNotify: () => void;
  onRemove: () => void;
};

export function AdminWaitlistCompactRow({
  locale,
  row,
  rowBusy,
  userLabel,
  onOpenUser,
  onPromote,
  onNotify,
  onRemove,
}: AdminWaitlistCompactRowProps) {
  const t = useTranslations("adminPages.waitlists");

  return (
    <article className={ADMIN_WAITLIST_LIST_ROW_CLASS}>
      <div className={ADMIN_WAITLIST_LIST_CELL}>
        <AdminListMobileLabel label={t("colUser")} />
        <button
          type="button"
          className={ADMIN_LIST_TITLE_LINK_CLASS}
          title={userLabel}
          onClick={() => onOpenUser(row.user.id)}
        >
          {userLabel}
        </button>
        <p className="mt-0.5 truncate text-xs text-sage-500">{displayPhoneOrFallback(row.user.phone)}</p>
      </div>

      <div className={ADMIN_WAITLIST_LIST_CELL}>
        <AdminListMobileLabel label={t("colClassType")} />
        <p className="text-sm text-sage-800">{row.session.classType.name}</p>
      </div>

      <div className={`${ADMIN_WAITLIST_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colWaitlistCount")} />
        <p className="text-sm text-sage-800">{row.sessionWaitlistCount}</p>
      </div>

      <div className={`${ADMIN_WAITLIST_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colWaitlistDate")} />
        <p className="text-sm text-sage-800">{formatDateTimeForUi(row.waitlistDate, locale)}</p>
      </div>

      <div className={ADMIN_WAITLIST_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_WAITLIST_LIST_ACTIONS_CELL} ${ADMIN_WAITLIST_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <WaitlistRowActions
          rowBusy={rowBusy}
          onOpenUser={() => onOpenUser(row.user.id)}
          onPromote={onPromote}
          onNotify={onNotify}
          onRemove={onRemove}
        />
      </div>
    </article>
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
    <div className="flex items-center justify-end gap-2">
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
