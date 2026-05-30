"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminFinanceNotifyModal } from "@/components/admin/admin-finance-notify-modal";
import type { ClientRow } from "@/components/admin/admin-clients-types";

type Props = {
  row: ClientRow;
  onEdit: () => void;
  onChanged: () => void;
};

export function AdminFinanceUserActions({ row, onEdit, onChanged }: Props) {
  const t = useTranslations("adminPages.finance.actions");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lockRef = useRef(false);

  const membershipId = row.activeMembership?.id ?? null;
  const recipientName =
    [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;

  async function updateMembershipStatus(status: "ACTIVE" | "PAUSED" | "CANCELLED") {
    if (!membershipId || busy || lockRef.current) {
      return;
    }
    lockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/memberships/admin/${membershipId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(t("membershipUpdated"));
      onChanged();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(false);
      lockRef.current = false;
      setMenuOpen(false);
    }
  }

  return (
    <div className="relative flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-lg border border-sage-200 p-2 text-sage-700 hover:bg-sage-50 disabled:opacity-50"
          aria-label={t("openMenu")}
          disabled={busy}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuGlyph className="h-4 w-4" />
        </button>
      </div>
      {menuOpen ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] rounded-xl border border-sage-200 bg-white p-1 shadow-lg">
          <MenuItem label={t("edit")} onClick={() => { setMenuOpen(false); onEdit(); }} />
          {membershipId ? (
            <MenuItem
              label={t("pauseMembership")}
              disabled={busy}
              onClick={() => void updateMembershipStatus("PAUSED")}
            />
          ) : null}
          <MenuItem
            label={t("sendNotification")}
            onClick={() => {
              setMenuOpen(false);
              setNotifyOpen(true);
            }}
          />
          <p className="px-3 py-2 text-[11px] text-sage-500">{t("refundUnsupported")}</p>
        </div>
      ) : null}
      {message ? <p className="text-[11px] text-sage-600">{message}</p> : null}
      {notifyOpen ? (
        <AdminFinanceNotifyModal
          recipientEmail={row.email}
          recipientName={recipientName}
          onClose={() => setNotifyOpen(false)}
        />
      ) : null}
    </div>
  );
}

function MenuItem(props: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="block w-full rounded-lg px-3 py-2 text-left text-xs text-sage-800 hover:bg-sage-50 disabled:opacity-50"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.label}
    </button>
  );
}

function MenuGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}
