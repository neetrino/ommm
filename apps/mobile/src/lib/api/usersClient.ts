import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { readStoredAccessToken } from "../../auth/accessTokenStorage";
import type { AuthUserSummary } from "./authClient";
import {
  extractErrorMessage,
  fetchWithReachabilityHint,
} from "./authClient";
import { getApiBaseUrl, joinApiPath } from "./config";
import type { AppUiLocale } from "../../i18n/locales";

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

export async function patchUserLocale(locale: AppUiLocale): Promise<void> {
  const token = await readStoredAccessToken();
  if (token === null) {
    return;
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ locale }),
    },
    base,
  );
  if (!res.ok) {
    const raw = await res.text();
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
}

async function pickUriToBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const fileResponse = await fetch(uri);
    if (!fileResponse.ok) {
      throw new Error("Could not read the selected image.");
    }
    const blob = await fileResponse.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") {
          reject(new Error("Could not read the selected image."));
          return;
        }
        const idx = dataUrl.indexOf("base64,");
        if (idx === -1) {
          reject(new Error("Could not read the selected image."));
          return;
        }
        resolve(dataUrl.slice(idx + "base64,".length));
      };
      reader.onerror = () => {
        reject(reader.error ?? new Error("Could not read the selected image."));
      };
      reader.readAsDataURL(blob);
    });
  }

  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function uploadHomeImage(
  pick: UploadPickResult,
): Promise<{ user: AuthUserSummary; message: string }> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const url = joinApiPath(base, "/v1/users/me/home-image-json");
  const mime = pick.mimeType ?? "image/jpeg";

  const imageBase64 = await pickUriToBase64(pick.uri);

  const res = await fetchWithReachabilityHint(
    url,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageBase64,
        mimeType: mime,
      }),
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
    lastName: typeof u.lastName === "string" ? u.lastName : null,
    homeImageUrl: typeof u.homeImageUrl === "string" ? u.homeImageUrl : null,
  };
  return { user, message: o.message };
}

export async function deleteHomeImage(): Promise<{ message: string }> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me/home-image"),
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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

function isDeleteAccountResponse(value: unknown): value is { ok: true } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { ok?: unknown }).ok === true
  );
}

/** Permanently deletes the signed-in user (`DELETE /v1/users/me`). */
export async function deleteAccount(): Promise<{ ok: true }> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  if (!isDeleteAccountResponse(parsed)) {
    throw new Error("Unexpected response from server");
  }
  return parsed;
}

export type AccountProfileFields = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
};

function asStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "string" ? value : null;
}

function parseAccountProfileFields(body: unknown): AccountProfileFields {
  if (typeof body !== "object" || body === null) {
    throw new Error("Unexpected account response");
  }
  const user = (body as { user?: unknown }).user;
  if (typeof user !== "object" || user === null) {
    throw new Error("Unexpected account response");
  }
  const u = user as Record<string, unknown>;
  if (typeof u.email !== "string") {
    throw new Error("Unexpected account response");
  }
  return {
    email: u.email,
    name: asStringOrNull(u.name),
    lastName: asStringOrNull(u.lastName),
    phone: asStringOrNull(u.phone),
    dateOfBirth: asStringOrNull(u.dateOfBirth),
  };
}

/** Loads account fields from `GET /v1/users/me`. */
export async function fetchAccountProfile(): Promise<AccountProfileFields> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
  return parseAccountProfileFields(parsed);
}

export type PatchAccountProfileInput = {
  email: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
};

/** Updates account fields via `PATCH /v1/users/me`. */
export async function patchAccountProfile(
  fields: PatchAccountProfileInput,
): Promise<void> {
  const token = await readStoredAccessToken();
  if (token === null) {
    throw new Error("Not signed in");
  }
  const base = getApiBaseUrl();
  const res = await fetchWithReachabilityHint(
    joinApiPath(base, "/v1/users/me"),
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(fields),
    },
    base,
  );
  if (!res.ok) {
    const raw = await res.text();
    throw new Error(extractErrorMessage(raw, res.statusText));
  }
}
