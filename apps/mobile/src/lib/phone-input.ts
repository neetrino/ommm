/** Allowed characters while typing a phone number: digits, plus, and whitespace. */
const PHONE_INPUT_ALLOWED_PATTERN = /[^\d+\s]/g;

/** Strips characters that are not digits, "+", or whitespace from a phone input value. */
export function formatPhoneInput(rawValue: string): string {
  return rawValue.replace(PHONE_INPUT_ALLOWED_PATTERN, "");
}
