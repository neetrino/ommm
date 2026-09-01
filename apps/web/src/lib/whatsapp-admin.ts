export const WHATSAPP_QR_POLL_MS = 2000;
export const WHATSAPP_CONNECTED_STATUS = "CONNECTED";
export const WHATSAPP_CONNECT_PATH = "/whatsapp/admin/connect";
export const WHATSAPP_CONNECT_QR_PATH = "/whatsapp/admin/connect?qr=1";

export type WhatsappCredentialsSource = "database" | "env" | "none";

export type WhatsappAdminSettings = {
  gatewayUrl: string;
  hasToken: boolean;
  tokenPreview: string | null;
  accountId: string | null;
  source: WhatsappCredentialsSource;
};

export type WhatsappConnectState = {
  accountId: string;
  status: string | null;
  qrDataUrl: string | null;
};

export function isWhatsappConnected(status: string | null): boolean {
  return status === WHATSAPP_CONNECTED_STATUS;
}
