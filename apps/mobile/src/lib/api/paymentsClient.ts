import { extractErrorMessage, fetchWithReachabilityHint } from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";

const JSON_HEADERS = {
  Accept: "application/json",
} as const;

export type UserPaymentRow = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  createdAt: string;
  statusReason: string | null;
};

export type UserPaymentsPayload = {
  items: UserPaymentRow[];
  total: number;
  take: number;
  offset: number;
};

const DEFAULT_TAKE = 50;

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizePaymentRow(value: unknown): UserPaymentRow | null {
  const row = asRecord(value);
  if (row === null) {
    return null;
  }
  const id = readString(row.id);
  const amountCents = readNumber(row.amountCents) ?? readNumber(row.amountAmd);
  const currency = readString(row.currency) ?? "AMD";
  const status = readString(row.status);
  const createdAt = readString(row.createdAt);
  if (
    id === null ||
    amountCents === null ||
    status === null ||
    createdAt === null
  ) {
    return null;
  }
  return {
    id,
    amountCents,
    currency,
    status,
    description: readString(row.description),
    paymentMethod: readString(row.paymentMethod),
    paymentReference: readString(row.paymentReference),
    createdAt,
    statusReason: readString(row.statusReason),
  };
}

export type MyPaymentsStatusFilter =
  | "SUCCEEDED"
  | "FAILED"
  | "PENDING"
  | "REFUNDED";

/** Member payment history — same as web `GET /payments/me`. */
export async function fetchMyPayments(
  accessToken: string,
  params?: {
    take?: number;
    offset?: number;
    order?: "newest" | "oldest";
    status?: MyPaymentsStatusFilter;
  },
): Promise<UserPaymentsPayload> {
  const take = params?.take ?? DEFAULT_TAKE;
  const offset = params?.offset ?? 0;
  const order = params?.order ?? "newest";
  const query = new URLSearchParams({
    take: String(take),
    offset: String(offset),
    order,
  });
  if (params?.status !== undefined) {
    query.set("status", params.status);
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/payments/me?${query.toString()}`),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Payments ${res.status}`),
    );
  }
  const record = asRecord(body);
  if (record === null || !Array.isArray(record.items)) {
    throw new Error("Unexpected payments response");
  }
  const items = record.items
    .map(normalizePaymentRow)
    .filter((row): row is UserPaymentRow => row !== null);
  return {
    items,
    total: readNumber(record.total) ?? items.length,
    take: readNumber(record.take) ?? take,
    offset: readNumber(record.offset) ?? offset,
  };
}
