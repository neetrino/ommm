import localFont from "next/font/local";

/**
 * Manrope — UI sans. Files are vendored so production builds do not call Google Fonts.
 * Small UI text uses `--font-sans`.
 */
export const manrope = localFont({
  src: [
    {
      path: "../../assets/fonts/manrope/manrope-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/manrope/manrope-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/manrope/manrope-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/fonts/manrope/manrope-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
  display: "swap",
});
