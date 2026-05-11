import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * Default Nest HTTP port (matches `apps/api` and root `.env.example` `PORT`).
 * Dev fallbacks use this when the env URL does not specify a port.
 */
export const DEFAULT_DEV_API_PORT = 4000;

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const LOOPBACK_HOST = "localhost";

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Joins a normalized API base URL with an API path. Avoids double slashes.
 *
 * @param baseUrl - Origin only, e.g. `http://localhost:4000` (no trailing `/`).
 * @param path - Must start with `/`, e.g. `/v1/health`.
 */
export function joinApiPath(baseUrl: string, path: string): string {
  const base = stripTrailingSlashes(baseUrl.trim());
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function parseHttpUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

function withHostname(url: string, hostname: string): string {
  const u = parseHttpUrl(url);
  if (u === null) {
    return stripTrailingSlashes(url);
  }
  u.hostname = hostname;
  return stripTrailingSlashes(u.toString());
}

function hostIsAndroidEmulatorBridge(hostname: string): boolean {
  return hostname === ANDROID_EMULATOR_HOST;
}

/**
 * Resolves the public API base URL (no path suffix) for the current runtime.
 *
 * **Precedence**
 * 1. `EXPO_PUBLIC_API_URL` when set (after dev-time host corrections below).
 * 2. Development fallbacks by platform: Web / iOS Simulator → `http://localhost:${port}`;
 *    Android Emulator → `http://10.0.2.2:${port}`.
 *
 * **`10.0.2.2` rule:** That host only works from the **Android emulator**. In `__DEV__`, if the
 * env URL points at `10.0.2.2` but the app runs on Web or iOS Simulator, it is rewritten to
 * `localhost` so copying root `.env.example` does not break those targets. On a **physical
 * Android or iPhone**, `10.0.2.2` is invalid — set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP
 * (e.g. `http://192.168.1.10:4000`) or use `adb reverse tcp:4000 tcp:4000` and `http://127.0.0.1:4000`.
 *
 * **Production:** `EXPO_PUBLIC_API_URL` must be set explicitly (no magic localhost).
 *
 * Loaded via root `.env` in `app.config.ts` (see `MOBILE_SETUP.md`).
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";

  if (fromEnv !== "") {
    return normalizeConfiguredBaseUrl(fromEnv);
  }

  if (!__DEV__) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Set it in the repo root `.env` for production builds.",
    );
  }

  return resolveDevFallbackBaseUrl();
}

function normalizeConfiguredBaseUrl(configured: string): string {
  const parsed = parseHttpUrl(configured);
  if (parsed === null) {
    throw new Error(
      `EXPO_PUBLIC_API_URL is not a valid URL: "${configured.slice(0, 80)}${configured.length > 80 ? "…" : ""}"`,
    );
  }

  let result = stripTrailingSlashes(parsed.toString());

  if (!__DEV__) {
    return result;
  }

  if (hostIsAndroidEmulatorBridge(parsed.hostname)) {
    if (Platform.OS === "web") {
      // Browser on the dev machine cannot reach the emulator-only alias.
      result = withHostname(result, LOOPBACK_HOST);
      return result;
    }
    if (Platform.OS === "ios" && !Device.isDevice) {
      result = withHostname(result, LOOPBACK_HOST);
      return result;
    }
    if (Platform.OS === "ios" && Device.isDevice) {
      throw new Error(
        "EXPO_PUBLIC_API_URL uses 10.0.2.2, which does not work on a physical iPhone. Use your Mac/PC LAN IP, e.g. http://192.168.x.x:4000 (same Wi‑Fi as the phone).",
      );
    }
    if (Platform.OS === "android" && Device.isDevice) {
      throw new Error(
        "EXPO_PUBLIC_API_URL uses 10.0.2.2, which only works on the Android emulator. On a real phone use your PC's LAN IP, e.g. http://192.168.x.x:4000, or run: adb reverse tcp:4000 tcp:4000 and set the URL to http://127.0.0.1:4000.",
      );
    }
  }

  return result;
}

function resolveDevFallbackBaseUrl(): string {
  const port = DEFAULT_DEV_API_PORT;
  if (Platform.OS === "web") {
    return `http://${LOOPBACK_HOST}:${port}`;
  }
  if (Platform.OS === "ios") {
    if (Device.isDevice) {
      throw new Error(
        "EXPO_PUBLIC_API_URL is not set. On a physical iPhone, set it in the repo root `.env` to http://<your-dev-machine-LAN-IP>:4000 (same network).",
      );
    }
    return `http://${LOOPBACK_HOST}:${port}`;
  }
  if (Platform.OS === "android") {
    if (Device.isDevice) {
      throw new Error(
        "EXPO_PUBLIC_API_URL is not set. On a physical Android device, set it in the repo root `.env` to http://<your-PC-LAN-IP>:4000, or use adb reverse tcp:4000 tcp:4000 with http://127.0.0.1:4000.",
      );
    }
    return `http://${ANDROID_EMULATOR_HOST}:${port}`;
  }
  return `http://${LOOPBACK_HOST}:${port}`;
}
