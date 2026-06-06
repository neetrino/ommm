"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";

const CLIENT_STATUS_TOGGLE_CLASS = [
  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5",
  "text-[11px] font-medium uppercase tracking-[0.08em]",
  "transition-[border-color,background-color,box-shadow,transform] duration-200",
  "hover:shadow-[0_4px_12px_-8px_rgba(45,40,35,0.16)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

function clientStatusTone(isActive: boolean): string {
  return isActive
    ? "border-mint-200/80 bg-mint-50/90 text-sage-800"
    : "border-sand-300/70 bg-sand-50/90 text-sage-600";
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
      <button
        type="button"
        className={`${CLIENT_STATUS_TOGGLE_CLASS} ${clientStatusTone(isActive)}`}
        aria-label={toggleLabel}
        title={toggleLabel}
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          void toggleStatus();
        }}
      >
        <AnimatedToggleSwitch checked={isActive} />
        <span>{statusLabel}</span>
      </button>

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
