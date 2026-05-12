import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushDevice } from "../lib/api/memberClient";

function resolvePlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") {
    return "ios";
  }
  if (Platform.OS === "android") {
    return "android";
  }
  return "web";
}

/**
 * Requests notification permission, reads the Expo push token, and registers it with the API.
 * No-ops on web or when permission is denied.
 */
export async function tryRegisterExpoPushToken(
  accessToken: string,
): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") {
    return false;
  }
  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
      ?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    undefined;
  const expo = await Notifications.getExpoPushTokenAsync(
    projectId !== undefined && projectId !== ""
      ? { projectId }
      : undefined,
  );
  const token = expo.data;
  if (token === "") {
    return false;
  }
  await registerPushDevice(accessToken, {
    token,
    platform: resolvePlatform(),
  });
  return true;
}
