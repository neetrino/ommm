type CoachContactFields = {
  email: string;
  phone: string | null;
  whatsappPhone: string | null;
};

type CoachClientPage<T extends CoachContactFields> = {
  rows: T[];
};

/** Drops phone, WhatsApp, and email before a coach directory response. */
export function redactCoachClientContact<T extends CoachContactFields>(
  row: T,
): T {
  return { ...row, email: '', phone: null, whatsappPhone: null };
}

/** Supports both the paged directory and the plain row list. */
export function redactCoachClientDirectory<T extends CoachContactFields>(
  page: T[] | CoachClientPage<T>,
): T[] | CoachClientPage<T> {
  if (Array.isArray(page)) {
    return page.map(redactCoachClientContact);
  }
  return { ...page, rows: page.rows.map(redactCoachClientContact) };
}
