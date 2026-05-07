"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

const DEFAULT_LOGOUT_REDIRECT = "/login";

type LogoutButtonProps = {
  className?: string;
  /** App path after logout (locale prefix added by router). */
  redirectTo?: string;
};

export function LogoutButton({
  className,
  redirectTo = DEFAULT_LOGOUT_REDIRECT,
}: LogoutButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear is best-effort; still send user to login.
    } finally {
      setPending(false);
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={pending}
    >
      {t("logout")}
    </button>
  );
}
