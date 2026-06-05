"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { SCHEDULE_BOOK_BTN } from "@/components/marketing/schedule/schedule-public-design";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { buildLoginHrefWithReturnUrl } from "@/lib/auth-redirect";

const SCHEDULE_RETURN_PATH = "/schedule";

type AuthAwareScheduleBookingActionProps = {
  sessionId: string;
  availableSpots: number;
  sessionStatus: string;
  bookLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  className?: string;
};

export function AuthAwareScheduleBookingAction({
  sessionId,
  availableSpots,
  sessionStatus,
  bookLabel,
  audience,
  className = SCHEDULE_BOOK_BTN,
}: AuthAwareScheduleBookingActionProps) {
  const router = useRouter();
  const tBook = useTranslations("forms.bookSession");
  const tWaitlist = useTranslations("forms.joinWaitlist");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isFull = sessionStatus === "FULL" || availableSpots <= 0;

  if (audience === "guest") {
    return (
      <Link href={buildLoginHrefWithReturnUrl(SCHEDULE_RETURN_PATH)} className={className}>
        {bookLabel}
      </Link>
    );
  }

  async function bookSession() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : tBook("bookFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function joinWaitlist() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : tWaitlist("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => void (isFull ? joinWaitlist() : bookSession())}
      >
        {isFull ? tWaitlist("action") : bookLabel}
      </button>
      {msg ? <p className="max-w-[12rem] text-right text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
