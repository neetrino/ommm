export const ARMENIA_COUNTRY_CODE = "+374";
export const ARMENIA_NATIONAL_DIGIT_COUNT = 8;
export const ARMENIA_PHONE_DISPLAY_PLACEHOLDER = "+374 XX XXX XXX";

const INTERNATIONAL_MIN_DIGITS = 8;
const INTERNATIONAL_MAX_DIGITS = 15;

/** Extracts digits from a phone string. */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Parses Armenian national digits (max 8) from common input variants:
 * +37441881822, 37441881822, 041881822, 41881822, +374 41 881822.
 */
export function parseArmenianNationalDigits(value: string): string {
  let digits = extractPhoneDigits(value);
  if (digits.startsWith("374")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, ARMENIA_NATIONAL_DIGIT_COUNT);
}

/** Formats national digits as +374 XX XXXXXX. */
export function formatArmenianNationalDigits(nationalDigits: string): string {
  const national = nationalDigits.slice(0, ARMENIA_NATIONAL_DIGIT_COUNT);
  if (national.length === 0) {
    return ARMENIA_COUNTRY_CODE;
  }
  if (national.length <= 2) {
    return `${ARMENIA_COUNTRY_CODE} ${national}`;
  }
  return `${ARMENIA_COUNTRY_CODE} ${national.slice(0, 2)} ${national.slice(2)}`;
}

/** Default prefix shown when the user starts entering a phone number. */
export const PHONE_INPUT_DEFAULT_PREFIX = "+";

/** Formats +374 and up to eight national digits while typing. */
function formatArmenianInputFromPlus374(compact: string): string {
  const national = extractPhoneDigits(compact.slice(4)).slice(0, ARMENIA_NATIONAL_DIGIT_COUNT);
  return formatArmenianNationalDigits(national);
}

/** Whether the value should be treated as an Armenian phone number. */
export function isArmenianPhoneCandidate(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }

  const compact = trimmed.replace(/\s+/g, "");
  if (compact.startsWith("+374") || compact.startsWith("374")) {
    return true;
  }

  const digits = extractPhoneDigits(trimmed);
  if (digits.startsWith("374")) {
    return true;
  }
  if (digits.startsWith("0") && digits.length <= ARMENIA_NATIONAL_DIGIT_COUNT + 1) {
    return true;
  }
  if (trimmed.startsWith("+") && !compact.startsWith("+374")) {
    return false;
  }
  return digits.length <= ARMENIA_NATIONAL_DIGIT_COUNT;
}

/** Formats a phone number for UI display. Armenian numbers use +374 XX XXXXXX. */
export function formatPhoneDisplay(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    const national = parseArmenianNationalDigits(trimmed);
    if (national.length > 0) {
      return formatArmenianNationalDigits(national);
    }
  }
  return trimmed.replace(/\s+/g, " ");
}

/**
 * Normalizes a phone number before sending to the API.
 * Armenian numbers are stored E.164-like: +37441881822.
 */
export function normalizePhoneForApi(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    const national = parseArmenianNationalDigits(trimmed);
    if (national.length > 0) {
      return `${ARMENIA_COUNTRY_CODE}${national}`;
    }
  }
  return trimmed.replace(/\s+/g, "");
}

/** Validates phone numbers. Armenian numbers require exactly 8 national digits. */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  if (isArmenianPhoneCandidate(trimmed)) {
    let digits = extractPhoneDigits(trimmed);
    if (digits.startsWith("374")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    return digits.length === ARMENIA_NATIONAL_DIGIT_COUNT;
  }
  const digits = extractPhoneDigits(trimmed);
  return digits.length >= INTERNATIONAL_MIN_DIGITS && digits.length <= INTERNATIONAL_MAX_DIGITS;
}

/** tel: href value — digits and leading + only, no spaces. */
export function formatPhoneTelHref(value: string | null | undefined): string {
  const normalized = normalizePhoneForApi(value);
  return normalized.length > 0 ? normalized : "";
}

/** Display phone or a fallback string such as "—". */
export function displayPhoneOrFallback(
  value: string | null | undefined,
  fallback = "—",
): string {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? formatPhoneDisplay(trimmed) : fallback;
}

/** Display formatted phone when present; otherwise fall back to email. */
export function displayPhoneOrEmail(
  phone: string | null | undefined,
  email: string,
): string {
  const trimmed = phone?.trim() ?? "";
  return trimmed.length > 0 ? formatPhoneDisplay(trimmed) : email;
}

/**
 * Formats phone input while typing.
 * Starts from "+" only; the user enters 374 manually, then national digits
 * are grouped as +374 XX XXXXXX once the full country code is present.
 */
export function formatPhoneInputValue(rawValue: string): string {
  if (rawValue.length === 0) {
    return "";
  }

  const sanitized = rawValue.replace(/[^\d+\s]/g, "");
  let compact = sanitized.replace(/\s+/g, "");

  if (!compact.startsWith("+") && extractPhoneDigits(compact).length > 0) {
    compact = `+${extractPhoneDigits(compact)}`;
  }

  if (compact === "+") {
    return PHONE_INPUT_DEFAULT_PREFIX;
  }

  if (compact === "+3" || compact === "+37") {
    return compact;
  }

  if (compact.startsWith("+374")) {
    return formatArmenianInputFromPlus374(compact);
  }

  if (compact.startsWith("+")) {
    return compact;
  }

  const digits = extractPhoneDigits(compact);
  if (digits.startsWith("374") && digits.length > 3) {
    return formatArmenianInputFromPlus374(`+${digits}`);
  }
  if (digits.startsWith("0") && digits.length > 1) {
    return formatArmenianInputFromPlus374(`+374${digits.slice(1)}`);
  }
  if (digits.length === ARMENIA_NATIONAL_DIGIT_COUNT) {
    return formatArmenianInputFromPlus374(`+374${digits}`);
  }

  return compact.length > 0 ? compact : "";
}

/** Maps cursor position after reformatting based on digit count before the cursor. */
export function mapPhoneInputCursor(
  previousValue: string,
  nextValue: string,
  previousCursor: number,
): number {
  const digitsBefore = extractPhoneDigits(previousValue.slice(0, previousCursor)).length;
  if (digitsBefore === 0) {
    return nextValue.length;
  }

  let seen = 0;
  for (let index = 0; index < nextValue.length; index += 1) {
    if (/\d/.test(nextValue[index] ?? "")) {
      seen += 1;
      if (seen >= digitsBefore) {
        return index + 1;
      }
    }
  }
  return nextValue.length;
}
