import { extractPhoneDigits } from '../common/phone';
import {
  WHATSAPP_CHAT_ID_MAX_DIGITS,
  WHATSAPP_CHAT_ID_MIN_DIGITS,
  WHATSAPP_CHAT_ID_SUFFIX,
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
