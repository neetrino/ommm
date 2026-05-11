import AsyncStorage from "@react-native-async-storage/async-storage";

export const SESSION_STORAGE_KEY = "ommm.mobile.auth.session.v1";

type PersistedShape = {
  v: 1;
  signedIn: boolean;
};

function isPersistedShape(value: unknown): value is PersistedShape {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return o.v === 1 && typeof o.signedIn === "boolean";
}

/**
 * Reads persisted sign-in flag. When nothing is stored yet, returns `true` so
 * first launch matches the previous “always in the app” dev experience.
 */
export async function readSessionSignedIn(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
  if (raw === null) {
    return true;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedShape(parsed)) {
      return true;
    }
    return parsed.signedIn;
  } catch {
    return true;
  }
}

export async function writeSessionSignedIn(signedIn: boolean): Promise<void> {
  const payload: PersistedShape = { v: 1, signedIn };
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
}
