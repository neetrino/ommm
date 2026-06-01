"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type MembershipPlanSwitchButtonProps = {
  membershipId: string;
  planId: string;
};

export function MembershipPlanSwitchButton({
  membershipId,
  planId,
}: MembershipPlanSwitchButtonProps) {
  const t = useTranslations("forms.membershipLifecycle");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSwitch() {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/memberships/me/${membershipId}/change-plan`, {
        method: "PATCH",
        body: JSON.stringify({ planId }),
      });
      setMessage(t("planChangedSuccess"));
      router.refresh();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t("planChangeFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <OmmButton
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => void onSwitch()}
        disabled={busy}
      >
        {t("switchPlan")}
      </OmmButton>
      {message ? <p className="text-xs text-sage-600">{message}</p> : null}
    </div>
  );
}
