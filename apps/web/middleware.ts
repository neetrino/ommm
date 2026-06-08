import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { OMMM_PATHNAME_HEADER } from "./src/lib/ui-locale-constants";

const intlMiddleware = createMiddleware(routing);

/** Ensures RSC can resolve locale when middleware locale forwarding is missing. */
const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";

function isRoutingLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

function buildIntlRequest(request: NextRequest): NextRequest {
  const pathname = request.nextUrl.pathname;
  const headers = new Headers(request.headers);
  headers.set(OMMM_PATHNAME_HEADER, pathname);

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isRoutingLocale(first) && request.headers.get(HEADER_LOCALE) !== first) {
    headers.set(HEADER_LOCALE, first);
  }
  return new NextRequest(request.url, { headers });
}

export default function middleware(request: NextRequest) {
  return intlMiddleware(buildIntlRequest(request));
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
