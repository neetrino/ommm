import { getApiBaseUrl, joinApiPath } from "./config";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

export type AuthUserSummary = {
  role: string;
  email: string;
  name: string | null;
};

export type AuthSuccessResponse = {
  accessToken: string;
  user: AuthUserSummary;
};

function extractErrorMessage(text: string, fallback: string): string {
  if (text.trim() === "") {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || !("message" in parsed)) {
      return text;
    }
    const msg = (parsed as { message: unknown }).message;
    if (typeof msg === "string") {
      return msg;
    }
    if (Array.isArray(msg) && msg.every((item) => typeof item === "string")) {
      return msg.join("; ");
    }
  } catch {
    return text;
  }
  return text;
}

function isAuthUserSummary(value: unknown): value is AuthUserSummary {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const u = value as Record<string, unknown>;
  if (typeof u.role !== "string" || typeof u.email !== "string") {
    return false;
  }
  if (u.name === null || u.name === undefined) {
    return true;
  }
  return typeof u.name === "string";
}

function isAuthSuccessResponse(value: unknown): value is AuthSuccessResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o.accessToken === "string" &&
    typeof o.user === "object" &&
    o.user !== null &&
    isAuthUserSummary(o.user)
  );
}

function isLikelyNetworkFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("network request failed") ||
    m.includes("failed to fetch") ||
    m.includes("timeout") ||
    m.includes("timed out") ||
    m.includes("connection refused") ||
    m.includes("err_connection") ||
    m.includes("connection timed out") ||
    m.includes("internet connection appears")
  );
}

function apiUnreachableMessage(apiBase: string, originalMessage: string): string {
  const hint =
    "If you use the Android emulator and it still times out, allow inbound TCP on the API port in the Windows Firewall, or run `adb reverse tcp:4000 tcp:4000` and set EXPO_PUBLIC_API_URL=http://127.0.0.1:4000.";
  return [
    "Could not connect to the studio server. Check that the API is running and your device can reach it.",
    `Trying: ${apiBase}`,
    hint,
    `Technical detail: ${originalMessage}`,
  ].join("\n");
}

async function fetchWithReachabilityHint(
  url: string,
  init: RequestInit,
  apiBase: string,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    const originalMessage = err instanceof Error ? err.message : String(err);
    throw new Error(
      isLikelyNetworkFailure(originalMessage)
        ? apiUnreachableMessage(apiBase, originalMessage)
        : originalMessage,
    );
  }
}

async function postAuth(path: string, body: unknown): Promise<AuthSuccessResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, path),
    {
      method: "POST",
      headers: { ...JSON_HEADERS },
      body: JSON.stringify(body),
    },
    base,
  );
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
  let parsed: unknown;
  try {
    parsed = raw.trim() === "" ? {} : JSON.parse(raw);
  } catch {
    throw new Error("Unexpected response from server");
  }
  if (!isAuthSuccessResponse(parsed)) {
    throw new Error("Unexpected response from server");
  }
  const u = parsed.user;
  return {
    accessToken: parsed.accessToken,
    user: {
      role: u.role,
      email: u.email,
      name: u.name ?? null,
    },
  };
}

export async function authLogin(params: {
  email: string;
  password: string;
}): Promise<AuthSuccessResponse> {
  return postAuth("/v1/auth/login", {
    email: params.email.trim().toLowerCase(),
    password: params.password,
  });
}

export async function authRegister(params: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthSuccessResponse> {
  return postAuth("/v1/auth/register", {
    email: params.email.trim().toLowerCase(),
    password: params.password,
    ...(params.name !== undefined && params.name.trim().length > 0
      ? { name: params.name.trim() }
      : {}),
  });
}

export async function authLogout(accessToken: string): Promise<void> {
  const base = getApiBaseUrl();
  try {
    await fetchWithReachabilityHint(
      joinApiPath(base, "/v1/auth/logout"),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
      base,
    );
  } catch {
    // Same as before: ignore logout network errors.
  }
}

export async function fetchSessionUser(accessToken: string): Promise<AuthUserSummary> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
    base,
  );
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
  const parsed: unknown = raw.trim() === "" ? {} : JSON.parse(raw);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { user?: unknown }).user === "undefined"
  ) {
    throw new Error("Unexpected session response");
  }
  const u = (parsed as { user: unknown }).user;
  if (!isAuthUserSummary(u)) {
    throw new Error("Unexpected session response");
  }
  return {
    role: u.role,
    email: u.email,
    name: u.name ?? null,
  };
}
