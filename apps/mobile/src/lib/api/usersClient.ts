import { readStoredAccessToken } from "../../auth/accessTokenStorage";
import type { AuthUserSummary } from "./authClient";
import {
  extractErrorMessage,
  fetchWithReachabilityHint,
} from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";

export type UploadPickResult = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

export async function patchPassword(params: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}): Promise<{ message: string }> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me/password"),
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
        confirmNewPassword: params.confirmNewPassword,
      }),
    },
    base,
  );
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
  const parsed: unknown = raw.trim() === "" ? {} : JSON.parse(raw);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { message?: unknown }).message !== "string"
  ) {
    throw new Error("Unexpected response from server");
  }
  return { message: (parsed as { message: string }).message };
}

export async function uploadHomeImage(
  pick: UploadPickResult,
): Promise<{ user: AuthUserSummary; message: string }> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const form = new FormData();
  const mime = pick.mimeType ?? "image/jpeg";
  const name = pick.fileName ?? "home-image.jpg";
  form.append("file", {
    uri: pick.uri,
    name,
    type: mime,
  } as unknown as Blob);

  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me/home-image"),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
    base,
  );
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
  let parsed: unknown;
  try {
    parsed = raw.trim() === "" ? {} : JSON.parse(raw);
  } catch {
    throw new Error("Unexpected response from server");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Unexpected response from server");
  }
  const o = parsed as {
    user?: unknown;
    message?: unknown;
  };
  if (
    typeof o.message !== "string" ||
    typeof o.user !== "object" ||
    o.user === null
  ) {
    throw new Error("Unexpected response from server");
  }
  const u = o.user as Record<string, unknown>;
  if (typeof u.role !== "string" || typeof u.email !== "string") {
    throw new Error("Unexpected response from server");
  }
  const user: AuthUserSummary = {
    role: u.role,
    email: u.email,
    name: typeof u.name === "string" ? u.name : null,
    homeImageUrl: typeof u.homeImageUrl === "string" ? u.homeImageUrl : null,
  };
  return { user, message: o.message };
}
