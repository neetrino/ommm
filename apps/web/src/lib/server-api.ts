/**
 * Server-side fetch to the BFF (`/api/v1/*` rewrites to Nest). Forwards the
 * incoming request cookie so JWT httpOnly auth works in RSC.
 */
export async function serverApiJson<T>(
  path: string,
  cookieHeader: string,
  init?: RequestInit,
): Promise<
  { ok: true; data: T } | { ok: false; status: number; body: string }
> {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const res = await fetch(`${origin}/api/v1${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie: cookieHeader,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: text };
  }
  return { ok: true, data: (text ? JSON.parse(text) : {}) as T };
}
