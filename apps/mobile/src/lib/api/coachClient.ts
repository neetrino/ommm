import { readStoredAccessToken } from "../../auth/accessTokenStorage";
import {
  extractErrorMessage,
  fetchWithReachabilityHint,
} from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";
import type {
  CoachAccountMe,
  CoachAnalyticsPayload,
  CoachNotificationPrefs,
  CoachPanelBookingRow,
  CoachPanelSessionRow,
  CoachSalarySummary,
} from "../../features/coach/types/coachPanel";
import { COACH_SESSION_RANGE_DAYS } from "../../features/coach/lib/constants";
import {
  parseAnalytics,
  parseBookingRow,
  parseCoachAccountMe,
  parseSalary,
  parseSessionRow,
} from "./coachClientParsers";

export { parseCoachAccountMe } from "./coachClientParsers";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

function throwApiError(body: unknown, status: number, fallback: string): never {
  throw new Error(
    extractErrorMessage(
      typeof body === "object" && body !== null ? JSON.stringify(body) : String(body),
      fallback || `Request failed (${status})`,
    ),
  );
}

async function authGet(path: string): Promise<unknown> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, path),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throwApiError(body, res.status, `Request failed (${res.status})`);
  }
  return body;
}

async function authPatch(path: string, payload: unknown): Promise<unknown> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, path),
    {
      method: "PATCH",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throwApiError(body, res.status, `Request failed (${res.status})`);
  }
  return body;
}

export function buildCoachSessionRangeQuery(coachId: string): string {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + COACH_SESSION_RANGE_DAYS);
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&coachId=${encodeURIComponent(coachId)}`;
}

export async function fetchCoachAccountMe(): Promise<CoachAccountMe> {
  const body = await authGet("/v1/users/me");
  return parseCoachAccountMe(body);
}

export async function fetchCoachSessions(
  coachId: string,
): Promise<CoachPanelSessionRow[]> {
  const q = buildCoachSessionRangeQuery(coachId);
  const body = await authGet(`/v1/classes/sessions?${q}`);
  if (!Array.isArray(body)) {
    throw new Error("Unexpected sessions response");
  }
  return body
    .map(parseSessionRow)
    .filter((row): row is CoachPanelSessionRow => row !== null);
}

export async function fetchCoachRoster(
  coachId: string,
): Promise<CoachPanelBookingRow[]> {
  const q = buildCoachSessionRangeQuery(coachId);
  const body = await authGet(`/v1/bookings/admin?${q}`);
  if (!Array.isArray(body)) {
    throw new Error("Unexpected roster response");
  }
  return body
    .map(parseBookingRow)
    .filter((row): row is CoachPanelBookingRow => row !== null)
    .filter((row) => row.session.coachId === coachId && row.status === "BOOKED");
}

export async function patchBookingAttendance(
  bookingId: string,
  attended: boolean,
): Promise<void> {
  await authPatch(`/v1/bookings/admin/${encodeURIComponent(bookingId)}/attendance`, {
    attended,
  });
}

export async function fetchCoachSalary(): Promise<CoachSalarySummary | null> {
  const body = await authGet("/v1/coaches/panel/salary");
  if (body === null) {
    return null;
  }
  return parseSalary(body);
}

export async function fetchCoachAnalytics(
  days: number,
): Promise<CoachAnalyticsPayload> {
  const body = await authGet(
    `/v1/reports/coach/analytics?days=${encodeURIComponent(String(days))}`,
  );
  return parseAnalytics(body);
}

export type PatchCoachAccountFields = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
};

export async function patchCoachAccountFields(
  fields: PatchCoachAccountFields,
): Promise<void> {
  await authPatch("/v1/users/me", fields);
}

export async function patchCoachBio(
  coachProfileId: string,
  bio: string | null,
): Promise<void> {
  await authPatch(`/v1/coaches/${encodeURIComponent(coachProfileId)}`, { bio });
}

export async function patchNotificationPrefs(
  prefs: CoachNotificationPrefs,
): Promise<void> {
  await authPatch("/v1/users/me/notifications", prefs);
}
