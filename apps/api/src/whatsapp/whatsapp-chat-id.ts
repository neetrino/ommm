import { extractPhoneDigits } from '../common/phone';
import {
  WHATSAPP_CHAT_ID_MAX_DIGITS,
  WHATSAPP_CHAT_ID_MIN_DIGITS,
  WHATSAPP_CHAT_ID_SUFFIX,
  WHATSAPP_SELF_PHONE_VISIBLE_MIN,
} from './whatsapp.constants';

/**
 * Builds a Gateway direct-chat id (`{digits}@c.us`).
 * Returns null when the phone cannot be used (Gateway never accepts `phone`).
 */
export function toWhatsappChatId(
  phone: string | null | undefined,
): string | null {
  const trimmed = phone?.trim() ?? '';
  if (trimmed.length === 0) {
    return null;
  }
  const digits = extractPhoneDigits(trimmed);
  if (
    digits.length < WHATSAPP_CHAT_ID_MIN_DIGITS ||
    digits.length > WHATSAPP_CHAT_ID_MAX_DIGITS
  ) {
    return null;
  }
  return `${digits}${WHATSAPP_CHAT_ID_SUFFIX}`;
}

/** True when the recipient looks like the paired studio WhatsApp (masked last digits). */
export function isWhatsappSelfChat(
  chatId: string,
  maskedPhone: string | null,
): boolean {
  if (maskedPhone === null) {
    return false;
  }
  const visible = extractPhoneDigits(maskedPhone);
  if (visible.length < WHATSAPP_SELF_PHONE_VISIBLE_MIN) {
    return false;
  }
  const recipient = extractPhoneDigits(
    chatId.replace(WHATSAPP_CHAT_ID_SUFFIX, ''),
  );
  return recipient.endsWith(visible);
}
