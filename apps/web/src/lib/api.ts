const API_PREFIX = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(
      extractErrorMessage(text, res.statusText),
      res.status,
    );
  }
  return (text ? JSON.parse(text) : {}) as T;
}
