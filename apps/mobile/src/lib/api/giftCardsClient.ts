import { extractErrorMessage, fetchWithReachabilityHint } from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";

const JSON_HEADERS = {
  Accept: "application/json",
} as const;

const AUTH_JSON_HEADERS = {
  ...JSON_HEADERS,
  "Content-Type": "application/json",
} as const;

export type GiftMarketCard = {
  id: string;
  amountCents: number;
  imageUrl: string | null;
  availableQuantity: number;
  totalQuantity: number;
  expiresAt: string | null;
  status: string;
};

export type GiftRecipientOption = {
  id: string;
  email: string;
  name: string | null;
  lastName: string | null;
};

export type UserGiftCardRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  imageUrl: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type GiftCheckoutResponse = {
  paymentReference: string | null;
};

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

function normalizeMarketCard(value: unknown): GiftMarketCard | null {
  const row = asRecord(value);
  if (row === null) {
    return null;
  }
  const id = readString(row.id);
  const amountCents = readNumber(row.amountCents) ?? readNumber(row.amountAmd);
  const availableQuantity = readNumber(row.availableQuantity);
  const totalQuantity = readNumber(row.totalQuantity);
  if (
    id === null ||
    amountCents === null ||
    availableQuantity === null ||
    totalQuantity === null
  ) {
    return null;
  }
  return {
    id,
    amountCents,
    imageUrl: readString(row.imageUrl),
    availableQuantity,
    totalQuantity,
    expiresAt: readString(row.expiresAt),
    status: readString(row.status) ?? "ACTIVE",
  };
}

function normalizeUserGiftCard(value: unknown): UserGiftCardRow | null {
  const row = asRecord(value);
  if (row === null) {
    return null;
  }
  const id = readString(row.id);
  const code = readString(row.code);
  const amountCents = readNumber(row.amountCents) ?? readNumber(row.amountAmd);
  const balanceCents =
    readNumber(row.balanceCents) ?? readNumber(row.balanceAmd);
  const status = readString(row.status);
  const createdAt = readString(row.createdAt);
  if (
    id === null ||
    code === null ||
    amountCents === null ||
    balanceCents === null ||
    status === null ||
    createdAt === null
  ) {
    return null;
  }
  return {
    id,
    code,
    amountCents,
    balanceCents,
    status,
    imageUrl: readString(row.imageUrl),
    recipientEmail: readString(row.recipientEmail),
    recipientName: readString(row.recipientName),
    message: readString(row.message),
    expiresAt: readString(row.expiresAt),
    createdAt,
  };
}

function normalizeRecipient(value: unknown): GiftRecipientOption | null {
  const row = asRecord(value);
  if (row === null) {
    return null;
  }
  const id = readString(row.id);
  const email = readString(row.email);
  if (id === null || email === null) {
    return null;
  }
  return {
    id,
    email,
    name: readString(row.name),
    lastName: readString(row.lastName),
  };
}

/** Public shop catalog — same as web `/gift-cards/market`. */
export async function fetchGiftMarket(
  accessToken: string,
): Promise<GiftMarketCard[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/gift-cards/market"),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Gift market ${res.status}`),
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected gift market response");
  }
  return body
    .map(normalizeMarketCard)
    .filter((row): row is GiftMarketCard => row !== null);
}

export async function fetchPurchasedGiftCards(
  accessToken: string,
): Promise<UserGiftCardRow[]> {
  return fetchMyGiftCards(accessToken, "purchased");
}

export async function fetchReceivedGiftCards(
  accessToken: string,
): Promise<UserGiftCardRow[]> {
  return fetchMyGiftCards(accessToken, "received");
}

async function fetchMyGiftCards(
  accessToken: string,
  kind: "purchased" | "received",
): Promise<UserGiftCardRow[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, `/v1/gift-cards/me/${kind}`),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Gift cards ${res.status}`),
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected gift cards response");
  }
  return body
    .map(normalizeUserGiftCard)
    .filter((row): row is UserGiftCardRow => row !== null);
}

export async function searchGiftRecipients(
  accessToken: string,
  query: string,
): Promise<GiftRecipientOption[]> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(
      base,
      `/v1/gift-cards/recipients?q=${encodeURIComponent(query)}`,
    ),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Recipients ${res.status}`),
    );
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected recipients response");
  }
  return body
    .map(normalizeRecipient)
    .filter((row): row is GiftRecipientOption => row !== null);
}

export async function createGiftCheckout(
  accessToken: string,
  params: {
    batchId: string;
    amountCents: number;
    recipientId: string;
  },
): Promise<GiftCheckoutResponse> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/payments/checkout/gift"),
    {
      method: "POST",
      headers: {
        ...AUTH_JSON_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        batchId: params.batchId,
        amountCents: params.amountCents,
        recipientId: params.recipientId,
      }),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Gift checkout ${res.status}`),
    );
  }
  const row = asRecord(body);
  return {
    paymentReference:
      row !== null ? readString(row.paymentReference) : null,
  };
}

/** Dev / fallback card confirm — same as web `confirmSimulatedCardCheckout`. */
export async function confirmGiftCardPayment(
  accessToken: string,
  paymentReference: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(
      base,
      `/v1/payments/checkout/gift/${encodeURIComponent(paymentReference)}/confirm`,
    ),
    {
      method: "POST",
      headers: {
        ...AUTH_JSON_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ paymentMethod: "CARD" }),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Gift confirm ${res.status}`),
    );
  }
}

export async function redeemGiftCardCode(
  accessToken: string,
  code: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/gift-cards/redeem"),
    {
      method: "POST",
      headers: {
        ...AUTH_JSON_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ code }),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Redeem ${res.status}`),
    );
  }
}

export async function fetchGiftSpendableBalance(
  accessToken: string,
): Promise<number> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/gift-cards/me/spendable-balance"),
    {
      method: "GET",
      headers: { ...JSON_HEADERS, Authorization: `Bearer ${accessToken}` },
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(
      extractErrorMessage(JSON.stringify(body), `Balance ${res.status}`),
    );
  }
  const row = asRecord(body);
  return row !== null ? (readNumber(row.spendableCents) ?? 0) : 0;
}

export function formatGiftRecipientLabel(
  recipient: GiftRecipientOption,
): string {
  const name = [recipient.name, recipient.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
    .trim();
  return name.length > 0 ? `${name} · ${recipient.email}` : recipient.email;
}
