"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminWhatsappConnectPanel } from "@/components/admin/admin-whatsapp-connect-panel";
import { AdminWhatsappLockedField } from "@/components/admin/admin-whatsapp-locked-field";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { WhatsappBrandIcon } from "@/components/ui/whatsapp-brand-icon";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import type { WhatsappAdminSettings } from "@/lib/whatsapp-admin";

type AdminWhatsappSettingsFormProps = {
  initial: WhatsappAdminSettings;
};

export function AdminWhatsappSettingsForm({
  initial,
}: AdminWhatsappSettingsFormProps) {
  const t = useTranslations("adminPages.settings.whatsapp");
  const [settings, setSettings] = useState(initial);
  const [gatewayUrl, setGatewayUrl] = useState(initial.gatewayUrl);
  const [gatewayToken, setGatewayToken] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [editingToken, setEditingToken] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  const isEditing = editingUrl || editingToken;

  async function persist(): Promise<void> {
    setBusy(true);
    setMsg(null);
    try {
      const next = await apiFetch<WhatsappAdminSettings>(
        "/whatsapp/admin/settings",
        {
          method: "PATCH",
          body: JSON.stringify({
            ...(editingUrl ? { gatewayUrl } : {}),
            ...(editingToken && gatewayToken.trim().length > 0
              ? { gatewayToken: gatewayToken.trim() }
              : {}),
          }),
        },
      );
      applySaved(next);
    } catch (caught) {
      setTone("err");
      setMsg(caught instanceof ApiError ? caught.message : t("failed"));
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  function applySaved(next: WhatsappAdminSettings): void {
    setSettings(next);
    setGatewayUrl(next.gatewayUrl);
    setGatewayToken("");
    setEditingUrl(false);
    setEditingToken(false);
    setTone("ok");
    setMsg(t("saved"));
  }

  return (
    <AdminSectionShell banner={tone === "ok" ? msg : null}>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <form
          className={`${adminChrome.panel} flex flex-col gap-5`}
          onSubmit={(event) => {
            event.preventDefault();
            if (isEditing && !busy) {
              setConfirmOpen(true);
            }
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <WhatsappBrandIcon />
              <h2 className={adminChrome.panelHeading}>{t("credentialsTitle")}</h2>
            </div>
            <p className="ommm-body-muted mt-1 text-sm">{t("credentialsHint")}</p>
          </div>
          <AdminWhatsappLockedField
            label={t("gatewayUrl")}
            displayValue={settings.gatewayUrl || t("urlEmpty")}
            editValue={gatewayUrl}
            editing={editingUrl}
            hint={t("gatewayUrlHint")}
            inputMode="url"
            editAriaLabel={t("editUrl")}
            cancelAriaLabel={t("cancelEdit")}
            onEdit={() => setEditingUrl(true)}
            onCancel={() => {
              setGatewayUrl(settings.gatewayUrl);
              setEditingUrl(false);
            }}
            onChange={setGatewayUrl}
          />
          <AdminWhatsappLockedField
            label={t("gatewayToken")}
            displayValue={settings.hasToken ? t("tokenSet") : t("tokenNotSet")}
            editValue={gatewayToken}
            editing={editingToken}
            inputType="password"
            placeholder={t("tokenPlaceholder")}
            editAriaLabel={t("editToken")}
            cancelAriaLabel={t("cancelEdit")}
            onEdit={() => setEditingToken(true)}
            onCancel={() => {
              setGatewayToken("");
              setEditingToken(false);
            }}
            onChange={setGatewayToken}
          />
          {tone === "err" && msg ? (
            <p className="text-sm font-medium text-red-700" role="alert">
              {msg}
            </p>
          ) : null}
          {isEditing ? (
            <div>
              <OmmButton type="submit" disabled={busy}>
                {busy ? t("saving") : t("save")}
              </OmmButton>
            </div>
          ) : null}
        </form>
        <AdminWhatsappConnectPanel
          canConnect={settings.gatewayUrl.length > 0 && settings.hasToken}
        />
      </div>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        confirmLabel={busy ? t("saving") : t("confirmSave")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        pending={busy}
        onConfirm={() => {
          void persist();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </AdminSectionShell>
  );
}
