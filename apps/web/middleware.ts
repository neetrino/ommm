import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // `"/((?!...).*)"` alone can miss the bare `/` on Next 16; include `/` so default-locale redirect runs.
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
