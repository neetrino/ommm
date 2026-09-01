"use client";

import { useTranslations } from "next-intl";
import { useAdminWhatsappConnect } from "@/components/admin/use-admin-whatsapp-connect";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import {
  WhatsappBrandIcon,
  WHATSAPP_BRAND_ICON_TINY_CLASS,
} from "@/components/ui/whatsapp-brand-icon";
import { isWhatsappConnected } from "@/lib/whatsapp-admin";

type AdminWhatsappConnectPanelProps = {
  canConnect: boolean;
};

export function AdminWhatsappConnectPanel({
  canConnect,
}: AdminWhatsappConnectPanelProps) {
  const t = useTranslations("adminPages.settings.whatsapp");
  const connect = useAdminWhatsappConnect(t("connectFailed"));
  const connected = isWhatsappConnected(connect.session?.status ?? null);
  const checking = connect.busy && connect.session === null;
  const qrDataUrl = connect.session?.qrDataUrl ?? null;

  return (
    <section className={`${adminChrome.panel} relative isolate z-0 flex h-full flex-col gap-5`}>
      <div>
        <div className="flex items-center gap-2">
          <WhatsappBrandIcon />
          <h2 className={adminChrome.panelHeading}>{t("connectTitle")}</h2>
        </div>
        <p className="ommm-body-muted mt-1 text-sm">{t("connectHint")}</p>
      </div>
      <WhatsappSessionBadge
        label={t("statusLabel")}
        status={
          checking
            ? t("statusChecking")
            : statusLabel(connect.session?.status ?? null, t)
        }
        connected={connected}
      />
      {qrDataUrl && !connected ? (
        <WhatsappQrImage src={qrDataUrl} alt={t("qrAlt")} />
      ) : null}
      {connect.error ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {connect.error}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2">
        <OmmButton
          type="button"
          disabled={!canConnect || connect.busy || connected}
          onClick={connect.startQr}
        >
          {connect.polling ? t("waitingScan") : t("showQr")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="secondary"
          disabled={!canConnect || connect.busy}
          onClick={connect.restart}
        >
          {t("restart")}
        </OmmButton>
        <OmmButton
          type="button"
          variant="ghost"
          disabled={!canConnect || connect.busy || !connect.session}
          onClick={connect.logout}
        >
          {t("logout")}
        </OmmButton>
      </div>
    </section>
  );
}

function WhatsappSessionBadge({
  label,
  status,
  connected,
}: {
  label: string;
  status: string;
  connected: boolean;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-sage-800">
      <span>{label}</span>
      <span
        className={
          connected
            ? "inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-2.5 py-1 text-xs font-medium text-sage-800"
            : "inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-sage-600"
        }
      >
        {connected ? <WhatsappBrandIcon className={WHATSAPP_BRAND_ICON_TINY_CLASS} /> : null}
        {status}
      </span>
    </p>
  );
}

function WhatsappQrImage({ src, alt }: { src: string; alt: string }) {
  return (
    // Gateway returns a data URL; next/image cannot optimize ephemeral QR payloads.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-56 w-56 rounded-2xl border border-white/70 bg-white p-3"
    />
  );
}

function statusLabel(
  status: string | null,
  t: (key: "statusUnknown" | "statusConnected") => string,
): string {
  if (status === null) {
    return t("statusUnknown");
  }
  if (isWhatsappConnected(status)) {
    return t("statusConnected");
  }
  return status;
}
