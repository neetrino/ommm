"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminClientActions } from "@/components/admin/admin-client-actions";
import { EDIT_CLIENT_QUERY_KEY } from "@/components/admin/admin-clients-query";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { PencilGlyph, TrashGlyph } from "@/components/ui/admin-action-glyphs";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";

const CLIENT_ROW_ICON_CLASS = "h-5 w-5 shrink-0";
const CLIENT_ROW_ICON_BUTTON_CLASS = "ommm-admin-row-icon-button-lg";
const CLIENT_ROW_TOGGLE_BUTTON_CLASS =
  "ommm-admin-row-icon-button-lg ommm-admin-row-icon-button-toggle";

function isoDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

type AdminClientRowActionsProps = {
  client: ClientRow;
  onChanged: () => void;
};

export function AdminClientRowActions({ client, onChanged }: AdminClientRowActionsProps) {
  const t = useTranslations("adminPages.clients");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const serverIsActive = !(client.isBlocked ?? false);
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const isActive = pendingIsActive ?? serverIsActive;
  const toggleLabel = isActive ? t("deactivateClient") : t("activateClient");

  function openEditModal(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_CLIENT_QUERY_KEY, client.id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  async function run(action: () => Promise<void>, okLabel: string): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      onChanged();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

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

  async function onDelete(): Promise<void> {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }

    await run(async () => {
      await apiFetch(`/clients/${client.id}`, { method: "DELETE" });
    }, t("deleteSuccess"));
  }

  return (
    <>
      <AdminRowIconGroup size="lg">
        <AdminRowIconButton
          ariaLabel={t("editClient")}
          title={t("editClient")}
          className={CLIENT_ROW_ICON_BUTTON_CLASS}
          onClick={openEditModal}
          disabled={busy}
        >
          <PencilGlyph className={CLIENT_ROW_ICON_CLASS} />
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={toggleLabel}
          title={toggleLabel}
          className={CLIENT_ROW_TOGGLE_BUTTON_CLASS}
          onClick={() => {
            void toggleStatus();
          }}
          disabled={busy}
        >
          <AnimatedToggleSwitch checked={isActive} />
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={t("deleteClient")}
          title={t("deleteClient")}
          variant="danger"
          className={CLIENT_ROW_ICON_BUTTON_CLASS}
          onClick={() => {
            void onDelete();
          }}
          disabled={busy}
        >
          <TrashGlyph className={CLIENT_ROW_ICON_CLASS} />
        </AdminRowIconButton>
      </AdminRowIconGroup>

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
