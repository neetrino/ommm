import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import {
  OMMM_PATHNAME_HEADER,
  UI_LOCALE_COOKIE_NAME,
} from "./src/lib/ui-locale-constants";

const intlMiddleware = createMiddleware(routing);

/** Ensures RSC can resolve locale when middleware locale forwarding is missing. */
const HEADER_LOCALE = "X-NEXT-INTL-LOCALE";

function isRoutingLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.includes(value as (typeof routing.locales)[number]);
}

/** Authenticated app shells resolve locale from the profile API, not this cookie. */
function isAccountShellPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  const area = parts[1];
  return (
    area === "user" ||
    area === "admin" ||
    area === "coach" ||
    area === "manager" ||
    area === "content-admin"
  );
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

function cookieLocale(request: NextRequest): string | null {
  const raw = request.cookies.get(UI_LOCALE_COOKIE_NAME)?.value;
  if (raw === undefined || raw === "") return null;
  try {
    const decoded = decodeURIComponent(raw);
    return isRoutingLocale(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * If the saved UI locale cookie differs from the URL prefix, redirect so the
 * user lands in their preferred language (same path, new locale segment).
 * Skips account dashboards so `/users/me` locale can override the cookie.
 */
function redirectIfCookieLocaleMismatch(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (isAccountShellPath(pathname)) {
    return null;
  }

  const preferred = cookieLocale(request);
  if (preferred === null) return null;

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}`;
    return NextResponse.redirect(url);
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const pathLocale = segments[0];
  if (!isRoutingLocale(pathLocale)) return null;
  if (pathLocale === preferred) return null;

  const tail = segments.slice(1);
  const nextPath =
    tail.length === 0 ? `/${preferred}` : `/${preferred}/${tail.join("/")}`;

  const url = request.nextUrl.clone();
  url.pathname = nextPath;
  return NextResponse.redirect(url);
}

export default function middleware(request: NextRequest) {
  const cookieRedirect = redirectIfCookieLocaleMismatch(request);
  if (cookieRedirect) {
    return cookieRedirect;
  }
  return intlMiddleware(buildIntlRequest(request));
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
