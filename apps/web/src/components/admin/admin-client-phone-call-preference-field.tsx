"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { formatPhoneDisplay } from "@/lib/phone";
import {
  DETAILS_FIELD_BOX_CLASS,
  DetailsFloatingLabel,
} from "@/components/shared/details/details-card";

const TOGGLE_BUTTON_CLASS = [
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
  "border border-transparent transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  "disabled:opacity-60",
].join(" ");

type ClientPhoneCallPreferenceFieldProps = {
  phone: string | null;
  doNotCall: boolean;
  busy: boolean;
  icon: ReactNode;
  onToggle: (nextDoNotCall: boolean) => void;
};

export function ClientPhoneCallPreferenceField({
  phone,
  doNotCall,
  busy,
  icon,
  onToggle,
}: ClientPhoneCallPreferenceFieldProps) {
  const t = useTranslations("adminPages.clients");
  const hasPhone = (phone ?? "").trim().length > 0;
  const display = hasPhone ? formatPhoneDisplay(phone!) : "—";
  const badgeLabel = doNotCall
    ? t("callPreferenceDoNotCall")
    : t("callPreferenceCanCall");
  const badgeClass = doNotCall
    ? "bg-rose-100 text-rose-800"
    : "bg-mint-100 text-sage-800";
  const buttonClass = doNotCall
    ? `${TOGGLE_BUTTON_CLASS} bg-rose-100 text-rose-800 hover:bg-rose-200/80 focus-visible:ring-rose-400`
    : `${TOGGLE_BUTTON_CLASS} bg-mint-100 text-sage-800 hover:bg-mint-200/80 focus-visible:ring-mint-400`;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <DetailsFloatingLabel label={t("fieldPhone")}>
        <div className={`${DETAILS_FIELD_BOX_CLASS} gap-2.5 py-1.5`}>
          <span className="shrink-0 text-sage-500">{icon}</span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-sage-900" title={display}>
            {hasPhone ? (
              <a href={`tel:${phone}`} className="hover:underline">
                {display}
              </a>
            ) : (
              display
            )}
          </p>
          {hasPhone ? (
            <button
              type="button"
              className={buttonClass}
              disabled={busy}
              aria-pressed={doNotCall}
              aria-label={t("callPreferenceToggleAria", { status: badgeLabel })}
              title={badgeLabel}
              onClick={() => onToggle(!doNotCall)}
            >
              <PhoneHandsetIcon />
            </button>
          ) : null}
        </div>
      </DetailsFloatingLabel>
      {hasPhone ? (
        <span
          className={`ml-1 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badgeClass}`}
        >
          {badgeLabel}
        </span>
      ) : null}
    </div>
  );
}

/** Persist call preference via PATCH /clients/:id. */
export async function patchClientDoNotCall(
  clientId: string,
  doNotCall: boolean,
): Promise<void> {
  await apiFetch(`/clients/${clientId}`, {
    method: "PATCH",
    body: JSON.stringify({ doNotCall }),
  });
}

function PhoneHandsetIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
