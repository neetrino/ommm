import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { OMMM_PATHNAME_HEADER } from "./src/lib/ui-locale-constants";

const intlMiddleware = createMiddleware(routing);

/** Ensures RSC can resolve locale when middleware locale forwarding is missing. */
const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";

function isRoutingLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

function buildRequestHeaders(request: NextRequest): Headers {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(OMMM_PATHNAME_HEADER, pathname);

  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isRoutingLocale(first) && request.headers.get(HEADER_LOCALE) !== first) {
    requestHeaders.set(HEADER_LOCALE, first);
  }

  return requestHeaders;
}

function copyIntlResponseHeaders(source: NextResponse, target: NextResponse): NextResponse {
  source.headers.forEach((value, key) => {
    target.headers.set(key, value);
  });
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  return target;
}

export function middleware(request: NextRequest) {
  const requestHeaders = buildRequestHeaders(request);
  const intlResponse = intlMiddleware(
    new NextRequest(request.url, { headers: requestHeaders }),
  );

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    const location = intlResponse.headers.get("location");
    if (location && request.nextUrl.search.length > 1) {
      const redirectUrl = new URL(location, request.url);
      if (redirectUrl.search.length === 0) {
        redirectUrl.search = request.nextUrl.search;
        const redirected = NextResponse.redirect(redirectUrl, intlResponse.status);
        return copyIntlResponseHeaders(intlResponse, redirected);
      }
    }
    return intlResponse;
  }

  const rewriteTarget =
    intlResponse.headers.get("x-middleware-rewrite") ??
    intlResponse.headers.get("x-nextjs-rewrite");

  if (rewriteTarget) {
    const rewriteUrl = new URL(rewriteTarget, request.url);
    // next-intl rewrite targets are often pathname-only; keep invite/auth query params.
    if (rewriteUrl.search.length === 0 && request.nextUrl.search.length > 1) {
      rewriteUrl.search = request.nextUrl.search;
    }
    return copyIntlResponseHeaders(
      intlResponse,
      NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      }),
    );
  }

  return copyIntlResponseHeaders(
    intlResponse,
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
  );
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
