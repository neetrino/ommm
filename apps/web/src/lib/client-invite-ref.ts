const CLIENT_INVITE_REF_PATTERN = /^[A-Za-z0-9_-]{8,24}$/;

/** Public `?ref=` code from a staff invite link. Invalid values are dropped. */
export function readClientInviteRef(
  value: string | null | undefined,
): string | null {
  const code = value?.trim() ?? "";
  return CLIENT_INVITE_REF_PATTERN.test(code) ? code : null;
}
