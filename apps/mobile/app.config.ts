import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { ExpoConfig } from "expo/config";

const mobileRoot = __dirname;
const monorepoRoot = path.resolve(mobileRoot, "..", "..");

loadEnv({ path: path.join(monorepoRoot, ".env") });
loadEnv({ path: path.join(monorepoRoot, ".env.local"), override: true });

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",
  scheme: "ommm-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
};

export default config;
