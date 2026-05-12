import { Manrope, Newsreader } from "next/font/google";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

function htmlLangFromPathname(pathname: string | null): string {
  if (pathname === null || pathname === "") {
    return routing.defaultLocale;
  }
  const first = pathname.split("/").filter(Boolean)[0];
  if (
    first !== undefined &&
    routing.locales.includes(first as (typeof routing.locales)[number])
  ) {
    return first;
  }
  return routing.defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let pathname: string | null = null;
  try {
    pathname = (await headers()).get(OMMM_PATHNAME_HEADER);
  } catch {
    pathname = null;
  }
  const htmlLang = htmlLangFromPathname(pathname);

  return (
    <html
      className={`${manrope.variable} ${newsreader.variable} h-full`}
      lang={htmlLang}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper font-sans text-sage-900 antialiased">
        {children}
      </body>
    </html>
  );
}
