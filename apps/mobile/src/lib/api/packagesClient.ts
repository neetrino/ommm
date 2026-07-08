import { fetchWithReachabilityHint } from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "../packages/publicPackagePlan";

const JSON_HEADERS = {
  Accept: "application/json",
} as const;

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
