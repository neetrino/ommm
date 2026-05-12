import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Bare `/` has no `[locale]` segment; send users to the default locale.
 * (Middleware should also handle this; this avoids 404 if middleware does not run.)
 */
export default function RootPathRedirect() {
  redirect(`/${routing.defaultLocale}`);
}
