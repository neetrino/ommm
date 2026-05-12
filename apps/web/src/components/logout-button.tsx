"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

/** Marketing home path; locale is applied by next-intl router (`/hy`). */
const POST_LOGOUT_PATH = "/";
const POST_LOGOUT_LOCALE = "hy" as const;

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear is best-effort; still leave protected areas.
    } finally {
      setPending(false);
      router.replace(POST_LOGOUT_PATH, { locale: POST_LOGOUT_LOCALE });
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
