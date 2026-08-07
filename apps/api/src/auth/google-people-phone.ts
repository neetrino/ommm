import { isValidPhoneNumber, normalizePhoneForStorage } from '../common/phone';

export const GOOGLE_PHONE_NUMBERS_SCOPE =
  'https://www.googleapis.com/auth/user.phonenumbers.read';

const GOOGLE_PEOPLE_ME_PHONE_URL =
  'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers';

type GooglePeoplePhoneNumber = {
  value?: string;
  metadata?: { primary?: boolean };
};

type GooglePeoplePhoneResponse = {
  phoneNumbers?: GooglePeoplePhoneNumber[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parsePeoplePhoneResponse(payload: unknown): GooglePeoplePhoneResponse {
  if (!isRecord(payload)) {
    return {};
  }
  const rawList = payload.phoneNumbers;
  if (!Array.isArray(rawList)) {
    return {};
  }
  const phoneNumbers: GooglePeoplePhoneNumber[] = [];
  for (const item of rawList) {
    if (!isRecord(item)) {
      continue;
    }
    const value = typeof item.value === 'string' ? item.value : undefined;
    const metadataRaw = item.metadata;
    const metadata =
      isRecord(metadataRaw) && typeof metadataRaw.primary === 'boolean'
        ? { primary: metadataRaw.primary }
        : undefined;
    phoneNumbers.push({ value, metadata });
  }
  return { phoneNumbers };
}

/**
 * Picks the primary Google phone when present; otherwise the first value.
 * Returns a storage-normalized number only when it passes local validation.
 */
export function pickNormalizedGooglePhone(
  phoneNumbers: readonly GooglePeoplePhoneNumber[] | undefined,
): string | null {
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return null;
  }
  const primary = phoneNumbers.find(
    (entry) => entry.metadata?.primary === true,
  );
  const candidates = primary ? [primary, ...phoneNumbers] : phoneNumbers;
  for (const entry of candidates) {
    const raw = entry.value?.trim() ?? '';
    if (raw.length === 0 || !isValidPhoneNumber(raw)) {
      continue;
    }
    return normalizePhoneForStorage(raw);
  }
  return null;
}

/**
 * Reads phone numbers from Google People API.
 * Failures (missing scope, API disabled, empty profile) return null — never throw.
 */
export async function fetchGoogleAccountPhone(
  accessToken: string,
): Promise<string | null> {
  const trimmed = accessToken.trim();
  if (trimmed.length === 0) {
    return null;
  }
  try {
    const response = await fetch(GOOGLE_PEOPLE_ME_PHONE_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${trimmed}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    return pickNormalizedGooglePhone(
      parsePeoplePhoneResponse(payload).phoneNumbers,
    );
  } catch {
    return null;
  }
}
