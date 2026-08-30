"use client";

import { useTranslations } from "next-intl";
import { canOfferSessionAdd } from "@/components/admin/admin-session-add-registration.helpers";
import {
  clientListPackageBadgeClassName,
  resolveClientListPackageDisplay,
  type ClientListPackageTone,
} from "@/components/admin/admin-client-list-package-badge";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { formatPhoneDisplay } from "@/lib/phone";
import { userDisplayName } from "@/lib/user-display-name";

const RESULT_CARD_CLASS =
  "flex items-center gap-3 rounded-2xl border border-sand-200/80 bg-white px-3.5 py-3";

const ADD_BUTTON_CLASS = [
  "inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-200",
  "bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-800",
  "transition-colors hover:bg-emerald-100",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
  "disabled:pointer-events-none disabled:opacity-45",
].join(" ");

type AdminSessionAddRegistrationResultsProps = {
  rows: readonly ClientRow[];
  registeredUserIds: ReadonlySet<string>;
  busyId: string | null;
  onSelect: (client: ClientRow) => void;
};

function clientContactLine(row: ClientRow): string {
  if (row.phone?.trim()) {
    return formatPhoneDisplay(row.phone);
  }
  return row.email.trim();
}

function packageStatusLabel(
  tone: ClientListPackageTone,
  labels: Record<ClientListPackageTone, string>,
): string {
  return labels[tone];
}

export function AdminSessionAddRegistrationResults({
  rows,
  registeredUserIds,
  busyId,
  onSelect,
}: AdminSessionAddRegistrationResultsProps) {
  const t = useTranslations("adminPages.classes.registrationsModal");
  const tClients = useTranslations("adminPages.clients");
  const statusLabels: Record<ClientListPackageTone, string> = {
    none: tClients("packageNoneBadge"),
    active: tClients("packageActiveBadge"),
    paused: tClients("packagePausedBadge"),
    pending: tClients("packagePendingBadge"),
    expired: tClients("packageExpiredBadge"),
  };

  return (
    <ul className="space-y-2">
      {rows.map((row) => {
        const displayName = userDisplayName(row.name, row.lastName, row.email);
        const alreadyIn = registeredUserIds.has(row.id);
        const display = resolveClientListPackageDisplay(row);
        const showAdd = canOfferSessionAdd({
          packageTone: display.tone,
          alreadyRegistered: alreadyIn,
          blocked: row.isBlocked,
        });

        return (
          <li key={row.id} className={RESULT_CARD_CLASS}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sage-900">{displayName}</p>
              <p className="truncate text-xs text-sage-500">{clientContactLine(row)}</p>
              {alreadyIn ? (
                <p className="mt-1 text-[11px] font-medium text-sage-600">
                  {t("addAlreadyRegistered")}
                </p>
              ) : null}
              {row.isBlocked && !alreadyIn ? (
                <p className="mt-1 text-[11px] font-medium text-rose-700">
                  {t("addClientBlocked")}
                </p>
              ) : null}
            </div>
            {showAdd ? (
              <button
                type="button"
                className={ADD_BUTTON_CLASS}
                disabled={busyId !== null}
                aria-label={t("addSelectAria", { name: displayName })}
                onClick={() => onSelect(row)}
              >
                {t("addButton")}
              </button>
            ) : (
              <span className={clientListPackageBadgeClassName(display.tone)}>
                {packageStatusLabel(display.tone, statusLabels)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
