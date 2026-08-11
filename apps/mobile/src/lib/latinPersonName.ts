/**
 * Person name rule for new registration (Latin script only).
 * Keep in sync with `apps/api/src/common/latin-person-name.ts`.
 */
export const LATIN_PERSON_NAME_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

/** True when the trimmed value is a Latin-script person name. */
export function isLatinPersonName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return false;
  }
  return LATIN_PERSON_NAME_PATTERN.test(trimmed);
}
