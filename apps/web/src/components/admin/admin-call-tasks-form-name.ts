const CONTACT_NAME_MAX_LENGTH = 120;

export function splitContactName(contactName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = contactName.trim();
  if (trimmed.length === 0) {
    return { firstName: "", lastName: "" };
  }
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, space).trim(),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

export function joinContactName(firstName: string, lastName: string): string {
  const joined = [firstName.trim(), lastName.trim()].filter((part) => part.length > 0).join(" ");
  return joined.slice(0, CONTACT_NAME_MAX_LENGTH);
}
