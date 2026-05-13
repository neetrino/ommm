import { getApiBaseUrl, joinApiPath } from "./config";
import type { HealthResponse } from "./types";

const HEALTH_PATH = "/v1/health";

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text === "") {
    return {};
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Response is not valid JSON");
  }
}

/**
 * Fetches the health status from the configured Nest API.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(joinApiPath(base, HEALTH_PATH), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const body = await parseJsonResponse(res);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    typeof (body as HealthResponse).status !== "string"
  ) {
    throw new Error("Unexpected health response shape");
  }

  return body as HealthResponse;
}
