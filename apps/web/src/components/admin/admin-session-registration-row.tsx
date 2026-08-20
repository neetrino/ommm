"use client";

import { useTranslations } from "next-intl";
import {
  sessionRegistrationOutcome,
  type SessionRegistrationRow,
} from "@/components/admin/admin-session-registrations-types";
import { BanGlyph } from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatPhoneDisplay } from "@/lib/phone";
import { userDisplayName } from "@/lib/user-display-name";

const ROW_CLASS =
  "flex items-center gap-3 border-b border-sand-200/80 py-2.5 last:border-b-0";
const AVATAR_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-100 font-serif text-xs text-sage-800";
const CANCEL_BUTTON_CLASS = "h-10 w-10 shrink-0";
const CANCEL_ICON_CLASS = "h-4 w-4 shrink-0";

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

export type AdminSessionRegistrationRowProps = {
  row: SessionRegistrationRow;
  locale: string;
  canCancel: boolean;
  busy: boolean;
  onCancel: () => void;
};

export function AdminSessionRegistrationRow({
  row,
  locale,
  canCancel,
  busy,
  onCancel,
}: AdminSessionRegistrationRowProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const displayName = userDisplayName(row.user.name, null, row.user.email);
  const registeredLabel = t("registeredAt", {
    date: formatDateTimeForUi(row.createdAt, locale),
  });
  const outcome = sessionRegistrationOutcome(row.status);

  return (
    <li className={ROW_CLASS}>
      <div className={AVATAR_CLASS} aria-hidden>
        {memberInitials(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sage-900">{displayName}</p>
        <p className="truncate text-xs text-sage-500">{memberContactLine(row.user)}</p>
        <p className="truncate text-[11px] text-sage-400">{registeredLabel}</p>
        {outcome !== null ? (
          <p className="truncate text-[11px] font-medium text-sage-600">{t(`status.${outcome}`)}</p>
        ) : null}
      </div>
      {canCancel ? (
        <AdminRowIconButton
          ariaLabel={t("cancelButton")}
          title={t("cancelButton")}
          variant="danger"
          className={CANCEL_BUTTON_CLASS}
          disabled={busy}
          onClick={onCancel}
        >
          <BanGlyph className={CANCEL_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
    </li>
  );
}
