export const WHATSAPP_GATEWAY_URL_ENV = 'WHATSAPP_GATEWAY_URL';
export const WHATSAPP_GATEWAY_TOKEN_ENV = 'WHATSAPP_GATEWAY_TOKEN';
export const WHATSAPP_INTEGRATION_SINGLETON_KEY = 'default';

/** Outbound Gateway HTTP timeout. */
export const WHATSAPP_GATEWAY_TIMEOUT_MS = 10_000;

export const WHATSAPP_CHAT_ID_MIN_DIGITS = 8;
export const WHATSAPP_CHAT_ID_MAX_DIGITS = 15;
export const WHATSAPP_CHAT_ID_SUFFIX = '@c.us';

export const MEMBERSHIP_EXPIRY_REMINDER_DAYS = 3;

export const WHATSAPP_CRON_BATCH_TAKE = 200;

export const WHATSAPP_TOKEN_PREVIEW_LENGTH = 4;
export const WHATSAPP_QR_POLL_MS = 2000;
export const WHATSAPP_CONNECTED_STATUS = 'CONNECTED';

export function isWhatsappSessionConnected(status: string | null): boolean {
  return status === WHATSAPP_CONNECTED_STATUS;
}

export const WHATSAPP_SENT_STATUS = 'sent';
export const WHATSAPP_TEXT_MESSAGE_TYPE = 'TEXT';
export const WHATSAPP_SELF_PHONE_VISIBLE_MIN = 4;
export const WHATSAPP_ADMIN_TEST_MESSAGE =
  'Ommm: test message. WhatsApp Gateway is working.';

/** Every customer WhatsApp action sends hy then en. */
export const WHATSAPP_CUSTOMER_LOCALES = ['hy', 'en'] as const;
