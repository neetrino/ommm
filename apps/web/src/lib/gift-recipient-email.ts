const GIFT_RECIPIENT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GIFT_PHONE_MIN_DIGITS = 8;
const GIFT_PHONE_MAX_DIGITS = 15;

/** True when the buyer typed an address we can email the gift code to. */
export function isGiftRecipientEmail(value: string): boolean {
  return GIFT_RECIPIENT_EMAIL_PATTERN.test(value.trim());
}

/** True when the buyer typed a phone we can message on WhatsApp. */
export function isGiftRecipientPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= GIFT_PHONE_MIN_DIGITS && digits.length <= GIFT_PHONE_MAX_DIGITS;
}

/** Which destination is missing for the chosen delivery. Print needs none. */
export function giftDestinationIssue(
  delivery: "EMAIL" | "WHATSAPP" | "PRINT",
  email: string,
  phone: string,
): "email" | "phone" | null {
  if (delivery === "PRINT") {
    return null;
  }
  if (delivery === "WHATSAPP") {
    return isGiftRecipientPhone(phone) ? null : "phone";
  }
  return isGiftRecipientEmail(email) ? null : "email";
}

/** Contact fields sent with checkout for the chosen delivery. */
export function giftDestinationPayload(
  delivery: "EMAIL" | "WHATSAPP" | "PRINT",
  email: string,
  phone: string,
): { recipientEmail?: string; recipientPhone?: string } {
  if (delivery === "WHATSAPP") {
    return { recipientPhone: phone.trim() };
  }
  if (delivery === "EMAIL") {
    return { recipientEmail: email.trim() };
  }
  return {};
}
