"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { clearCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";
import { clearCachedMarketingSessionBookings } from "@/lib/marketing-session-bookings-cache";
import { clearClientSessionHint } from "@/lib/client-session-hint";
import { cn } from "@/lib/cn";

/** Marketing home path; locale is preserved from the active session. */
const POST_LOGOUT_PATH = "/";

type LogoutButtonProps = {
  className?: string;
  iconClassName?: string;
  spinnerClassName?: string;
  showLabel?: boolean;
  labelClassName?: string;
  /** Hidden icon column for account hub rows — keeps label aligned with icon rows. */
  leadingSpacerClassName?: string;
  trailing?: ReactNode;
  hideIcon?: boolean;
};

const DEFAULT_LOGOUT_SPINNER_CLASS = "h-5 w-5";

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

/** Arc-only spinner — no box, border, or background artifacts. */
function CircularSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0 animate-spin", className)}
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42 84"
      />
    </svg>
  );
}

const DEFAULT_LOGOUT_ICON_CLASS =
  "inline-block h-5 w-5 shrink-0 align-middle";

export function LogoutButton({
  className,
  iconClassName,
  spinnerClassName,
  showLabel = false,
  labelClassName,
  leadingSpacerClassName,
  trailing = null,
  hideIcon = false,
}: LogoutButtonProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const label = t("logout");
  const resolvedIconClassName = iconClassName ?? DEFAULT_LOGOUT_ICON_CLASS;
  const resolvedSpinnerClassName = spinnerClassName ?? DEFAULT_LOGOUT_SPINNER_CLASS;

  async function handleLogout() {
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
    } catch {
      // Cookie clear is best-effort; still leave protected areas.
    } finally {
      clearCachedMarketingHeaderAccount();
      clearCachedMarketingSessionBookings();
      clearClientSessionHint();
      router.replace(POST_LOGOUT_PATH, { locale });
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className={cn(
        pending ? "ommm-logout-btn-pending" : className,
        !pending && "transition-[transform,opacity] active:scale-[0.97]",
        !pending && "disabled:pointer-events-none disabled:opacity-45",
      )}
      onClick={() => {
        void handleLogout();
      }}
      disabled={pending}
      aria-busy={pending}
      aria-label={label}
      title={label}
    >
      {pending ? (
        leadingSpacerClassName !== undefined ? (
          <>
            <span className={leadingSpacerClassName}>
              <CircularSpinner className={resolvedSpinnerClassName} />
            </span>
            {showLabel ? (
              <span className={labelClassName ?? "whitespace-nowrap"}>{label}</span>
            ) : null}
            {trailing}
          </>
        ) : (
          <CircularSpinner className={resolvedSpinnerClassName} />
        )
      ) : (
        <>
          {leadingSpacerClassName !== undefined ? (
            <span className={leadingSpacerClassName}>
              {!hideIcon ? <LogoutGlyph className={resolvedIconClassName} /> : null}
            </span>
          ) : !hideIcon ? (
            <LogoutGlyph className={resolvedIconClassName} />
          ) : null}
          {showLabel ? (
            <span className={labelClassName ?? "whitespace-nowrap"}>{label}</span>
          ) : null}
          {trailing}
        </>
      )}
    </button>
  );
}
