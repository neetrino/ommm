"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

const CLIENT_ROW_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

const CLIENT_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

function clientStatusBadgeTone(isActive: boolean): string {
  return isActive ? "bg-mint-100 text-sage-800" : "bg-sand-100 text-sage-600";
}

function isoDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

type AdminClientRowActionsProps = {
  client: ClientRow;
  onChanged: () => void;
};

export function AdminClientRowActions({ client, onChanged }: AdminClientRowActionsProps) {
  const t = useTranslations("adminPages.clients");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const serverIsActive = !(client.isBlocked ?? false);
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const isActive = pendingIsActive ?? serverIsActive;
  const toggleLabel = isActive ? t("deactivateClient") : t("activateClient");
  const statusLabel = isActive ? t("packageActiveBadge") : t("statusInactive");

  async function toggleStatus(): Promise<void> {
    if (busy) {
      return;
    }

    const nextIsActive = !isActive;
    setPendingIsActive(nextIsActive);
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/clients/${client.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: !nextIsActive }),
      });
      setTone("ok");
      setMessage(nextIsActive ? t("activateSuccess") : t("deactivateSuccess"));
      onChanged();
    } catch (error) {
      setPendingIsActive(null);
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
      setPendingIsActive(null);
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-end gap-2"
        role="group"
        aria-label={t("colActions")}
      >
        <span className={`${CLIENT_STATUS_BADGE_CLASS} ${clientStatusBadgeTone(isActive)}`}>
          {statusLabel}
        </span>
        <AdminRowIconButton
          ariaLabel={toggleLabel}
          title={toggleLabel}
          className={CLIENT_ROW_TOGGLE_BUTTON_CLASS}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            void toggleStatus();
          }}
        >
          <AnimatedToggleSwitch checked={isActive} />
        </AdminRowIconButton>
      </div>

      {message ? (
        <AdminCenterToast
          message={message}
          tone={tone}
          onDismiss={() => setMessage(null)}
        />
      ) : null}

      <AdminClientActions
        showEditTrigger={false}
        clientId={client.id}
        initialEmail={client.email}
        initialName={client.name ?? ""}
        initialLastName={client.lastName ?? ""}
        initialPhone={client.phone ?? ""}
        initialDateOfBirth={isoDate(client.dateOfBirth)}
        onChanged={onChanged}
      />
    </>
  );
}
