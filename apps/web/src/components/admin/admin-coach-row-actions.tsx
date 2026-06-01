"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import {
  PencilGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";

const COACH_ROW_ICON_CLASS = "h-5 w-5 shrink-0";
const COACH_ROW_ICON_BUTTON_CLASS = "ommm-admin-row-icon-button-lg";
const COACH_ROW_TOGGLE_BUTTON_CLASS =
  "ommm-admin-row-icon-button-lg ommm-admin-row-icon-button-toggle";

type AdminCoachRowActionsProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
};

export function AdminCoachRowActions({
  coach,
  classTypeOptions,
  classOptions,
  locale = "en",
}: AdminCoachRowActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const isActive = pendingIsActive ?? coach.isActive;
  const toggleLabel = isActive ? t("deactivateCoach") : t("activateCoach");

  function openEditModal(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set("editCoach", coach.id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function clearCoachQueryKeys(params: URLSearchParams): void {
    if (params.get("editCoach") === coach.id) {
      params.delete("editCoach");
    }
    if (params.get("coachProfile") === coach.id) {
      params.delete("coachProfile");
    }
  }

  async function run(action: () => Promise<void>, okLabel: string): Promise<void> {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(): Promise<void> {
    if (busy) {
      return;
    }

    const nextIsActive = !isActive;
    setPendingIsActive(nextIsActive);
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/coaches/${coach.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      setTone("ok");
      setMessage(nextIsActive ? t("activateSuccess") : t("deactivateSuccess"));
      router.refresh();
    } catch (error) {
      setPendingIsActive(null);
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
      setPendingIsActive(null);
    }
  }

  async function onDelete(): Promise<void> {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }

    await run(async () => {
      await apiFetch(`/coaches/${coach.id}`, { method: "DELETE" });
      const params = new URLSearchParams(searchParams.toString());
      clearCoachQueryKeys(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, t("deleteSuccess"));
  }

  return (
    <>
      <AdminRowIconGroup size="lg">
        <AdminRowIconButton
          ariaLabel={t("editCoach")}
          title={t("editCoach")}
          className={COACH_ROW_ICON_BUTTON_CLASS}
          onClick={openEditModal}
          disabled={busy}
        >
          <PencilGlyph className={COACH_ROW_ICON_CLASS} />
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={toggleLabel}
          title={toggleLabel}
          className={COACH_ROW_TOGGLE_BUTTON_CLASS}
          onClick={() => {
            void toggleStatus();
          }}
          disabled={busy}
        >
          <AnimatedToggleSwitch checked={isActive} />
        </AdminRowIconButton>
        <AdminRowIconButton
          ariaLabel={t("deleteCoach")}
          title={t("deleteCoach")}
          variant="danger"
          className={COACH_ROW_ICON_BUTTON_CLASS}
          onClick={() => {
            void onDelete();
          }}
          disabled={busy}
        >
          <TrashGlyph className={COACH_ROW_ICON_CLASS} />
        </AdminRowIconButton>
      </AdminRowIconGroup>

      {message ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {message}
        </div>
      ) : null}

      <AdminCoachActions
        showEditTrigger={false}
        coachId={coach.id}
        locale={locale}
        initialEmail={coach.user.email}
        initialName={coach.user.name ?? ""}
        initialLastName={coach.user.lastName ?? ""}
        initialPhone={coach.user.phone ?? ""}
        initialAge={coach.age}
        initialBirthday={coach.user.dateOfBirth}
        initialPhotoUrl={coach.user.avatarUrl}
        initialBio={coach.bio ?? ""}
        initialExperienceYears={coach.experienceYears}
        initialAssignedClassTypeIds={coach.assignedClassTypeIds}
        initialSchedule={coach.schedule}
        initialSpecialization={coach.specialization ?? ""}
        initialClassType={coach.classType ?? ""}
        classTypeOptions={classTypeOptions}
        classOptions={classOptions}
      />
    </>
  );
}
