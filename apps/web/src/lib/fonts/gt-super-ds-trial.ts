import localFont from "next/font/local";

/**
 * GT Super Ds Trial — display typography for headings and non-small copy.
 * Small UI text stays on Manrope (`--font-sans`).
 */
export const gtSuperDsTrial = localFont({
  src: [
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-regular-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-medium-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/gt-super-ds-trial/gt-super-ds-trial-bold-italic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-gt-super-ds-trial",
  display: "swap",
});
