import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "ommm.auth.accessToken.v1";

function isNativeMobile(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

/**
 * Persists the JWT: SecureStore on native when the module is available (Expo Go / dev build),
 * otherwise AsyncStorage (required for Expo Web and environments without native SecureStore).
 */
export async function readStoredAccessToken(): Promise<string | null> {
  if (isNativeMobile()) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        const fromSecure = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        if (fromSecure !== null) {
          return fromSecure;
        }
      }
    } catch {
      // Fall through to AsyncStorage.
    }
  }
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function persistAccessToken(token: string): Promise<void> {
  if (isNativeMobile()) {
    try {
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        return;
      }
    } catch {
      // Native module present but failing — use AsyncStorage.
    }
  }
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearStoredAccessToken(): Promise<void> {
  if (isNativeMobile()) {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      // Key may be absent or SecureStore unavailable.
    }
  }
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Non-fatal.
  }
}
