/** HttpOnly session cookie set by the Nest API (`apps/api/src/common/constants.ts`). */
export const ACCESS_TOKEN_COOKIE = "ommm_access";

/** True when the raw Cookie header may include a session JWT. */
export function cookieHeaderHasAccessToken(cookieHeader: string): boolean {
  return cookieHeader.includes(`${ACCESS_TOKEN_COOKIE}=`);
}
