import * as Linking from "expo-linking";
import { extractErrorMessage, fetchWithReachabilityHint } from "../api/authClient";
import { getApiBaseUrl, joinApiPath } from "../api/config";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
} as const;

type ArcaInitResponse = {
  redirectUrl: string;
};

/** True when the app should redirect to the Arca bank payment page. */
export function isArcaCheckoutEnabled(): boolean {
  return process.env.EXPO_PUBLIC_ARCA_CHECKOUT_ENABLED === "true";
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.trim() === "") {
    return {};
  }
  return JSON.parse(text) as unknown;
}

/** Starts Arca card checkout — opens the bank payment page in the system browser. */
export async function startArcaCardCheckout(
  accessToken: string,
  paymentReference: string,
  locale: string,
): Promise<void> {
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/payments/arca/init"),
    {
      method: "POST",
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ paymentReference, locale }),
    },
    base,
  );
  const body = await parseJson(res);
  if (!res.ok) {
    const message =
      typeof body === "object" && body !== null
        ? extractErrorMessage(JSON.stringify(body), `Payment ${res.status}`)
        : `Payment ${res.status}`;
    throw new Error(message);
  }
  const redirectUrl =
    typeof body === "object" &&
    body !== null &&
    "redirectUrl" in body &&
    typeof (body as ArcaInitResponse).redirectUrl === "string"
      ? (body as ArcaInitResponse).redirectUrl
      : null;
  if (redirectUrl === null) {
    throw new Error("Unexpected payment response");
  }
  await openArcaRedirectUrl(redirectUrl);
}

/** Opens an Arca bank payment URL returned from subscribe or init. */
export async function openArcaRedirectUrl(redirectUrl: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(redirectUrl);
  if (!canOpen) {
    throw new Error("Could not open payment page");
  }
  await Linking.openURL(redirectUrl);
}
