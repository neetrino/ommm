import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { VercelAnalytics } from "@/components/analytics/vercel-analytics";
import { routing } from "@/i18n/routing";
import { gtSuperDsTrial } from "@/lib/fonts/gt-super-ds-trial";
import { resolveSiteMetadataBase, siteMetadata } from "@/lib/site-metadata";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: resolveSiteMetadataBase(),
  title: {
    default: siteMetadata.siteName,
    template: `%s · ${siteMetadata.siteName}`,
  },
  description: siteMetadata.description,
  openGraph: {
    type: "website",
    siteName: siteMetadata.siteName,
    title: siteMetadata.siteName,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.siteName,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.webp", sizes: "16x16", type: "image/webp" },
      { url: "/favicon-32x32.webp", sizes: "32x32", type: "image/webp" },
      { url: "/icon-192.webp", sizes: "192x192", type: "image/webp" },
      { url: "/icon-512.webp", sizes: "512x512", type: "image/webp" },
    ],
    apple: [
      { url: "/apple-touch-icon.webp", sizes: "180x180", type: "image/webp" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${manrope.variable} ${gtSuperDsTrial.variable} h-full`}
      lang={routing.defaultLocale}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-x-clip bg-paper font-sans text-sage-900 antialiased">
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
