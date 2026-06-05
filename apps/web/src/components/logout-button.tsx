"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

/** Marketing home path; locale is preserved from the active session. */
const POST_LOGOUT_PATH = "/";

type LogoutButtonProps = {
  className?: string;
  iconClassName?: string;
};

function LogoutGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path d="M12 12h9.75m0 0-3-3m3 3-3 3" />
    </svg>
  );
}

function LogoutPendingOverlay({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paper text-sage-700"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-sage-700/25 border-t-sage-700"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

const DEFAULT_LOGOUT_ICON_CLASS =
  "inline-block h-5 w-5 shrink-0 align-middle";

export function LogoutButton({
  className,
  iconClassName,
}: LogoutButtonProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const label = t("logout");

  async function handleLogout() {
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear is best-effort; still leave protected areas.
    } finally {
      router.replace(POST_LOGOUT_PATH, { locale });
      router.refresh();
    }
  }

  return (
    <>
      {pending ? <LogoutPendingOverlay label={label} /> : null}
      <button
        type="button"
        className={[
          className ?? "",
          "transition-[transform,opacity] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          void handleLogout();
        }}
        disabled={pending}
        aria-label={label}
        title={label}
      >
        {pending ? (
          <span
            className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current align-middle opacity-80"
            aria-hidden
          />
        ) : (
          <LogoutGlyph className={iconClassName ?? DEFAULT_LOGOUT_ICON_CLASS} />
        )}
      </button>
    </>
  );
}
