"use client";

import { type MouseEvent, type ReactNode, useCallback, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import { hasClientSessionHint } from "@/lib/client-session-hint";
import { layoutAuthUserFromMe } from "@/lib/layout-auth-user";
import type { MeApiResponse } from "@/lib/me-api-types";
import { readCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";

type MarketingHeaderLoginLinkProps = {
  className?: string;
  ariaLabel: string;
  onNavigate?: () => void;
  children: ReactNode;
};

/**
 * Public header login affordance — routes guests to `/login` and authenticated
 * visitors to their role home without showing the sign-in form again.
 */
export function MarketingHeaderLoginLink({
  className,
  ariaLabel,
  onNavigate,
  children,
}: MarketingHeaderLoginLinkProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLAnchorElement>) => {
      onNavigate?.();

      const cachedHomeHref = readCachedMarketingHeaderAccount()?.href ?? null;
      if (cachedHomeHref !== null) {
        event.preventDefault();
        router.push(cachedHomeHref);
        return;
      }

      if (!hasClientSessionHint()) {
        return;
      }

      event.preventDefault();
      if (pendingRef.current) {
        return;
      }

      pendingRef.current = true;
      setPending(true);
      try {
        const payload = await apiFetch<MeApiResponse>("/users/me");
        const account = resolveMarketingHeaderAccount(
          layoutAuthUserFromMe(payload.user),
        );
        router.push(account?.href ?? "/login");
      } catch {
        router.push("/login");
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    },
    [onNavigate, router],
  );

  return (
    <Link
      href="/login"
      className={className}
      aria-label={ariaLabel}
      aria-busy={pending}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
