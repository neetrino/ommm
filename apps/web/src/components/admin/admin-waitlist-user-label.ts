export function formatAdminWaitlistUserLabel(
  name: string | null,
  lastName: string | null,
  email: string,
): string {
  const full = [name, lastName].filter((part) => part && part.trim().length > 0).join(" ");
  return full.length > 0 ? full : email;
}
