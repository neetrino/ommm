"use client";

import { useEffect, useState } from "react";
import {
  MarketingSiteHeader,
  type MarketingHeaderAccount,
} from "@/components/marketing/marketing-site-header";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { apiFetch } from "@/lib/api";
import { clearClientSessionHint, markClientSessionHint } from "@/lib/client-session-hint";
import { layoutAuthUserFromMe } from "@/lib/layout-auth-user";
import type { MeApiResponse } from "@/lib/me-api-types";
import {
  clearCachedMarketingHeaderAccount,
  readCachedMarketingHeaderAccount,
  writeCachedMarketingHeaderAccount,
} from "@/lib/marketing-header-account-cache";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

type MarketingSiteHeaderWithClientAccountProps = {
  navLinks: readonly { readonly href: string; readonly key: MarketingNavKey }[];
  serverAccount: MarketingHeaderAccount | null;
};

function persistAccount(account: MarketingHeaderAccount): void {
  writeCachedMarketingHeaderAccount(account);
  markClientSessionHint();
}

function clearPersistedAccount(): void {
  clearCachedMarketingHeaderAccount();
  clearClientSessionHint();
}

/**
 * Marketing header with instant avatar restore on refresh via sessionStorage cache.
 * SSR account wins when present; cache fills the gap before paint when SSR is stale.
 */
export function MarketingSiteHeaderWithClientAccount({
  navLinks,
  serverAccount,
}: MarketingSiteHeaderWithClientAccountProps) {
  const [cachedAccount, setCachedAccount] = useState<MarketingHeaderAccount | null>(
    readCachedMarketingHeaderAccount,
  );
  const account = serverAccount ?? cachedAccount;

  useEffect(() => {
    if (serverAccount !== null) {
      persistAccount(serverAccount);
    }
  }, [serverAccount]);

  useEffect(() => {
    if (serverAccount !== null) {
      return;
    }
    const cached = readCachedMarketingHeaderAccount();
    if (cached === null) {
      return;
    }

    let cancelled = false;
    void apiFetch<MeApiResponse>("/users/me")
      .then((payload) => {
        if (cancelled) {
          return;
        }
        const resolved = resolveMarketingHeaderAccount(
          layoutAuthUserFromMe(payload.user),
        );
        if (resolved !== null) {
          setCachedAccount(resolved);
          persistAccount(resolved);
          return;
        }
        setCachedAccount(null);
        clearPersistedAccount();
      })
      .catch(() => {
        if (!cancelled) {
          setCachedAccount(null);
          clearPersistedAccount();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serverAccount]);

  const showMemberNotifications = account?.href === USER_ACCOUNT_PATH;

  return (
    <MarketingSiteHeader
      navLinks={navLinks}
      account={account}
      showMemberNotifications={showMemberNotifications}
    />
  );
};
