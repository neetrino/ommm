/** Same-origin OAuth start so state + session cookies stay on the web app domain (Vercel proxy → Nest). */
export function buildGoogleAuthStartUrl(): string {
  return "/api/v1/auth/google";
}
