/**
 * Server-side fetch to Nest (`/v1/*`). Public marketing reads use ISR-style
 * revalidation; authenticated routes forward cookies and bypass cache.
 */
const SERVER_FETCH_TIMEOUT_MS = 10_000;
const PUBLIC_REVALIDATE_SEC = 60;

type ServerApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; body: string };

function resolveServerApiBase(): string {
  const raw =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000";
  return raw.replace(/\/$/, "");
}

type NextServerFetchInit = RequestInit & {
  next?: { revalidate?: number | false };
};

async function fetchServerApi(
  path: string,
  init: NextServerFetchInit = {},
): Promise<Response> {
  const url = `${resolveServerApiBase()}/v1${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return new Response("Upstream API timeout", { status: 504 });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function parseServerApiResponse<T>(
  res: Response,
): Promise<ServerApiResult<T>> {
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: text };
  }
  return { ok: true, data: (text ? JSON.parse(text) : {}) as T };
}

/** Cached public read — no auth cookie; safe for marketing pages. */
export async function serverApiJsonPublic<T>(
  path: string,
  init?: NextServerFetchInit,
): Promise<ServerApiResult<T>> {
  const res = await fetchServerApi(path, {
    ...init,
    next: { revalidate: PUBLIC_REVALIDATE_SEC },
  });
  return parseServerApiResponse<T>(res);
}

/** Authenticated server fetch — forwards cookie, never cached. */
export async function serverApiJson<T>(
  path: string,
  cookieHeader: string,
  init?: NextServerFetchInit,
): Promise<ServerApiResult<T>> {
  const res = await fetchServerApi(path, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie: cookieHeader,
    },
  });
  return parseServerApiResponse<T>(res);
}
