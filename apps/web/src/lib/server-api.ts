import { ensureMonorepoEnvLoaded } from "@/lib/load-monorepo-env";

/**
 * Server-side fetch to Nest (`/v1/*`). Public marketing reads use ISR-style
 * revalidation; authenticated routes forward cookies and bypass cache.
 */
const SERVER_FETCH_TIMEOUT_MS = 10_000;
const PUBLIC_REVALIDATE_SEC = 60;
const DEV_API_RETRY_ATTEMPTS = 5;
const DEV_API_RETRY_DELAY_MS = 800;

const UPSTREAM_UNAVAILABLE_STATUSES = new Set([503, 504]);

const UPSTREAM_CONNECTION_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

type ServerApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; body: string };

function resolveServerApiBase(): string {
  ensureMonorepoEnvLoaded();
  const raw =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000";
  return raw.replace(/\/$/, "");
}

type NextServerFetchInit = RequestInit & {
  next?: { revalidate?: number | false };
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isUpstreamConnectionError(error: unknown): boolean {
  let current: unknown = error;
  while (current instanceof Error) {
    if ("code" in current) {
      const code = (current as NodeJS.ErrnoException).code;
      if (code !== undefined && UPSTREAM_CONNECTION_ERROR_CODES.has(code)) {
        return true;
      }
    }
    if (current.message === "fetch failed") {
      return true;
    }
    current = current.cause;
  }
  return false;
}

function isUpstreamUnavailableResponse(res: Response): boolean {
  return UPSTREAM_UNAVAILABLE_STATUSES.has(res.status);
}

async function fetchServerApiOnce(
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
    if (isUpstreamConnectionError(error)) {
      return new Response("Upstream API unavailable", { status: 503 });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchServerApi(
  path: string,
  init: NextServerFetchInit = {},
): Promise<Response> {
  const maxAttempts =
    process.env.NODE_ENV === "development" ? DEV_API_RETRY_ATTEMPTS : 1;
  let lastResponse: Response | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetchServerApiOnce(path, init);
    if (!isUpstreamUnavailableResponse(response)) {
      return response;
    }
    lastResponse = response;
    if (attempt < maxAttempts) {
      await sleep(DEV_API_RETRY_DELAY_MS * attempt);
    }
  }

  return lastResponse ?? new Response("Upstream API unavailable", { status: 503 });
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
