import { apiFetch } from "@/lib/api";
import { markClientSessionHint } from "@/lib/client-session-hint";
import { layoutAuthUserFromMe } from "@/lib/layout-auth-user";
import type { MeApiResponse } from "@/lib/me-api-types";
import { writeCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";

/** Loads `/users/me` and caches header avatar — call after login/register. */
export async function prefetchMarketingHeaderAccount(): Promise<void> {
  try {
    const payload = await apiFetch<MeApiResponse>("/users/me");
    const account = resolveMarketingHeaderAccount(
      layoutAuthUserFromMe(payload.user),
    );
    if (account === null) {
      return;
    }
    writeCachedMarketingHeaderAccount(account);
    markClientSessionHint();
  } catch {
    markClientSessionHint();
  }
}
