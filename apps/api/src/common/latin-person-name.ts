/**
 * Person name rule for new client registration / admin create.
 * Existing accounts may keep non-Latin names; this applies to create paths only.
 */
export const LATIN_PERSON_NAME_PATTERN = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;

export const LATIN_PERSON_NAME_MESSAGE =
  'Use Latin letters only (A–Z). Spaces, hyphens, and apostrophes are allowed.';

/** True when the trimmed value is a Latin-script person name. */
export function isLatinPersonName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return LATIN_PERSON_NAME_PATTERN.test(trimmed);
}
