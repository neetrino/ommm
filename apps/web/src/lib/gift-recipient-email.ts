const GIFT_RECIPIENT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when the buyer typed an address we can email the gift code to. */
export function isGiftRecipientEmail(value: string): boolean {
  return GIFT_RECIPIENT_EMAIL_PATTERN.test(value.trim());
}
