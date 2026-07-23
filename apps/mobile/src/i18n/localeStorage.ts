import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_UI_LOCALE,
  UI_LOCALE_STORAGE_KEY,
  isAppUiLocale,
  type AppUiLocale,
} from "./locales";

export async function readStoredUiLocale(): Promise<AppUiLocale | null> {
  try {
    const raw = await AsyncStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw === null || !isAppUiLocale(raw)) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

export async function writeStoredUiLocale(locale: AppUiLocale): Promise<void> {
  try {
    await AsyncStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
  } catch {
    // Non-fatal — in-memory locale still applies for this session.
  }
}

export async function clearStoredUiLocale(): Promise<void> {
  try {
    await AsyncStorage.removeItem(UI_LOCALE_STORAGE_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}

export function pickUiLocaleForUser(
  userLocale: string | undefined,
  fallback: AppUiLocale,
): AppUiLocale {
  if (isAppUiLocale(fallback)) {
    return fallback;
  }
  if (userLocale !== undefined && isAppUiLocale(userLocale)) {
    return userLocale;
  }
  return DEFAULT_UI_LOCALE;
}
