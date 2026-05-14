import { Montserrat } from "next/font/google";

/**
 * Montserrat — matches Figma hero subcopy and CTA typography (nodes 161:302, 161:364).
 */
export const marketingMontserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-montserrat-marketing",
  display: "swap",
});
