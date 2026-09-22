import { readClientInviteRef } from "@/lib/client-invite-ref";

/** Same-origin OAuth start so state + session cookies stay on the web app domain (Vercel proxy → Nest). */
export function buildGoogleAuthStartUrl(inviteCode?: string | null): string {
  const code = readClientInviteRef(inviteCode);
  if (!code) {
    return "/api/v1/auth/google";
  }
  return `/api/v1/auth/google?ref=${encodeURIComponent(code)}`;
}
