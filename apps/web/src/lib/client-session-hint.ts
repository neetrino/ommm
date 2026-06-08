const CLIENT_SESSION_HINT_KEY = "ommm_client_session_hint";

/** Marks an active browser session after login — used to recover header auth on refresh. */
export function markClientSessionHint(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.setItem(CLIENT_SESSION_HINT_KEY, "1");
}

/** Clears the session hint after logout. */
export function clearClientSessionHint(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(CLIENT_SESSION_HINT_KEY);
}

/** True when this tab recently authenticated (login/register/OAuth). */
export function hasClientSessionHint(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }
  return sessionStorage.getItem(CLIENT_SESSION_HINT_KEY) === "1";
}
