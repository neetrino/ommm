import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "hy", "ru"],
  defaultLocale: "en",
  localePrefix: "always",
  /** Always open in English unless the URL already has a locale segment. */
  localeDetection: false,
});
