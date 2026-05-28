import {
  extractErrorMessage,
  fetchWithReachabilityHint,
} from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

export type BookingMineRow = {
  id: string;
  status: string;
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

export type WaitlistMineRow = {
  id: string;
  position: number;
  status: string;
  session: {
    id: string;
    startsAt: string;
    classType: { name: string };
    coach: { user: { name: string | null } };
  };
};

export type ContentPostRow = {
  id: string;
  type: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
};

export type ClassSessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceCents: number;
  status: string;
  classType: { id: string; name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

export async function fetchMemberBookings(
  accessToken: string,
): Promise<BookingMineRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/bookings/me"),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null && "message" in body
          ? JSON.stringify(body)
          : String(body),
        `Bookings ${res.status}`,
      ),
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected bookings response");
  }
  return body as BookingMineRow[];
}

export async function fetchMemberWaitlist(
  accessToken: string,
): Promise<WaitlistMineRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/waitlist/me"),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null && "message" in body
          ? JSON.stringify(body)
          : String(body),
        `Waitlist ${res.status}`,
      ),
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected waitlist response");
  }
  return body as WaitlistMineRow[];
}

export async function fetchPublishedPosts(): Promise<ContentPostRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/content/posts"),
    { method: "GET", headers: { ...JSON_HEADERS } },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(`Content ${res.status}`);
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected content response");
  }
  return body as ContentPostRow[];
}

export async function fetchClassSessionsRange(params: {
  from: Date;
  to: Date;
}): Promise<ClassSessionRow[]> {
  const base = getApiBaseUrl();
  const q = `from=${encodeURIComponent(params.from.toISOString())}&to=${encodeURIComponent(params.to.toISOString())}`;
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/classes/sessions?${q}`),
    { method: "GET", headers: { ...JSON_HEADERS } },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(`Sessions ${res.status}`);
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected sessions response");
  }
  return body as ClassSessionRow[];
}

export async function bookSession(
  accessToken: string,
  sessionId: string,
): Promise<unknown> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/bookings/sessions/${sessionId}`),
    {
      method: "POST",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ channel: "APP" }),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null
          ? JSON.stringify(body)
          : String(body),
        `Book ${res.status}`,
      ),
    );
  }
  return body;
}

export async function joinWaitlistSession(
  accessToken: string,
  sessionId: string,
): Promise<unknown> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/waitlist/sessions/${sessionId}`),
    {
      method: "POST",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null
          ? JSON.stringify(body)
          : String(body),
        `Waitlist ${res.status}`,
      ),
    );
  }
  return body;
}

export type MemberMePayload = {
  achievements: {
    id: string;
    title: string;
    description: string;
    unlockedAt: string;
  }[];
};

function isMemberMePayload(value: unknown): value is MemberMePayload {
  if (typeof value !== "object" || value === null || !("achievements" in value)) {
    return false;
  }
  const a = (value as { achievements: unknown }).achievements;
  if (!Array.isArray(a)) {
    return false;
  }
  return a.every(
    (row) =>
      typeof row === "object" &&
      row !== null &&
      "id" in row &&
      "title" in row &&
      "description" in row &&
      "unlockedAt" in row,
  );
}

export async function fetchMemberMe(
  accessToken: string,
): Promise<MemberMePayload> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null
          ? JSON.stringify(body)
          : String(body),
        `Me ${res.status}`,
      ),
    );
  }
  if (!isMemberMePayload(body)) {
    throw new Error("Unexpected /users/me response");
  }
  return body;
}

export async function registerPushDevice(
  accessToken: string,
  params: { token: string; platform: "ios" | "android" | "web" },
): Promise<{ ok: boolean }> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me/push-token"),
    {
      method: "POST",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(params),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null
          ? JSON.stringify(body)
          : String(body),
        `Push token ${res.status}`,
      ),
    );
  }
  return body as { ok: boolean };
}
