import { readStoredAccessToken } from "../../auth/accessTokenStorage";
import {
  extractErrorMessage,
  fetchWithReachabilityHint,
} from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

const DEFAULT_PAGE_SIZE = 20;

export type ManagerClientListRow = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  status: string;
  activePlanName: string | null;
};

export type ManagerClientsListPayload = {
  rows: ManagerClientListRow[];
  pagination: { total: number; take: number; offset: number };
};

export type FetchManagerClientsParams = {
  search?: string;
  take?: number;
  offset?: number;
};

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseClientRow(value: unknown): ManagerClientListRow | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.email !== "string") {
    return null;
  }
  return {
    id: row.id,
    email: row.email,
    name: asStringOrNull(row.name),
    lastName: asStringOrNull(row.lastName),
    phone: asStringOrNull(row.phone),
    status: typeof row.status === "string" ? row.status : "Active",
    activePlanName: asStringOrNull(row.activePlanName),
  };
}

function parsePagination(value: unknown): ManagerClientsListPayload["pagination"] {
  if (typeof value !== "object" || value === null) {
    return { total: 0, take: DEFAULT_PAGE_SIZE, offset: 0 };
  }
  const p = value as Record<string, unknown>;
  return {
    total: typeof p.total === "number" ? p.total : 0,
    take: typeof p.take === "number" ? p.take : DEFAULT_PAGE_SIZE,
    offset: typeof p.offset === "number" ? p.offset : 0,
  };
}

function parseListPayload(body: unknown): ManagerClientsListPayload {
  if (typeof body !== "object" || body === null) {
    return { rows: [], pagination: { total: 0, take: DEFAULT_PAGE_SIZE, offset: 0 } };
  }
  const payload = body as Record<string, unknown>;
  const rawRows = Array.isArray(payload.rows) ? payload.rows : [];
  const rows = rawRows
    .map((row) => parseClientRow(row))
    .filter((row): row is ManagerClientListRow => row !== null);
  return {
    rows,
    pagination: parsePagination(payload.pagination),
  };
}

/** Manager / admin clients directory — `GET /v1/clients`. */
export async function fetchManagerClientsList(
  params: FetchManagerClientsParams = {},
): Promise<ManagerClientsListPayload> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }

  const take = params.take ?? DEFAULT_PAGE_SIZE;
  const offset = params.offset ?? 0;
  const query = new URLSearchParams({
    meta: "true",
    take: String(take),
    offset: String(offset),
  });
  const search = params.search?.trim();
  if (search !== undefined && search.length > 0) {
    query.set("search", search);
  }

  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/clients?${query.toString()}`),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(
        typeof body === "object" && body !== null ? JSON.stringify(body) : String(body),
        `Request failed (${res.status})`,
      ),
    );
  }
  return parseListPayload(body);
}

export { DEFAULT_PAGE_SIZE as MANAGER_CLIENTS_PAGE_SIZE };
