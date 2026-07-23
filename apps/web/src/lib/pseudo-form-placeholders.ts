/** Shared faint placeholder examples for identity / auth form fields. */
export const PSEUDO_FIRST_NAME = "Emma";
export const PSEUDO_LAST_NAME = "Johnson";
export const PSEUDO_EMAIL = "emma.johnson@email.com";
export const PSEUDO_PASSWORD = "••••••••";
export const PSEUDO_PHONE = "+374 99 123456";
export const PSEUDO_BIRTHDAY = "15/03/1995";

/** Age derived from {@link PSEUDO_BIRTHDAY} so placeholders stay consistent. */
function agePlaceholderFromBirthday(displayDdMmYyyy: string): string {
  const parts = displayDdMmYyyy.split("/");
  if (parts.length !== 3) {
    return "";
  }
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return "";
  }
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthIndex = month - 1;
  if (
    today.getMonth() < monthIndex ||
    (today.getMonth() === monthIndex && today.getDate() < day)
  ) {
    age -= 1;
  }
  return String(age);
}

export const PSEUDO_AGE = agePlaceholderFromBirthday(PSEUDO_BIRTHDAY);
