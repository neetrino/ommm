import { extractErrorMessage, fetchWithReachabilityHint } from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "../packages/publicPackagePlan";
import {
  normalizeUserMembershipRow,
  type UserMembershipRow,
} from "../packages/userMembership";

const JSON_HEADERS = {
  Accept: "application/json",
} as const;

const AUTH_JSON_HEADERS = {
  ...JSON_HEADERS,
  "Content-Type": "application/json",
} as const;

export type SubscribePackageResponse = {
  id: string;
  paymentReference?: string | null;
  requiresArcaCheckout?: boolean;
};

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

/** Public catalog — same endpoint as web marketing `/package` page. */
export async function fetchPublicPackages(): Promise<PublicPackagePlan[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/packages/plans"),
    { method: "GET", headers: JSON_HEADERS },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(`Packages ${res.status}`);
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected packages response");
  }
  return (body as PublicPackagePlan[]).map(normalizePublicPackagePlan);
}

/** Authenticated — same endpoint as web `/user/packages`. */
export async function fetchUserMemberships(
  accessToken: string,
): Promise<UserMembershipRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/packages/me"),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(extractErrorMessage(JSON.stringify(body), `Packages ${res.status}`));
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected memberships response");
  }
  return body
    .map(normalizeUserMembershipRow)
    .filter((row): row is UserMembershipRow => row !== null);
}

/** Subscribe to a plan — same endpoint as web package purchase flow. */
export async function subscribeToPackage(
  accessToken: string,
  params: { planId: string; paymentMethod: "CARD" },
): Promise<SubscribePackageResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/packages/me/subscribe"),
    {
      method: "POST",
      headers: { ...AUTH_JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(params),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(extractErrorMessage(JSON.stringify(body), `Subscribe ${res.status}`));
  }
  if (typeof body !== "object" || body === null || !("id" in body)) {
    throw new Error("Unexpected subscribe response");
  }
  const row = body as Record<string, unknown>;
  return {
    id: typeof row.id === "string" ? row.id : "",
    paymentReference:
      typeof row.paymentReference === "string" ? row.paymentReference : null,
    requiresArcaCheckout: row.requiresArcaCheckout === true,
  };
}
