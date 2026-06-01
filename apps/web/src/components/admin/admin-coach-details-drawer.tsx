"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminCoachStatusAction } from "@/components/admin/admin-coach-status-action";
import { OmmButton } from "@/components/ui/omm-button";
import { coachCardDisplayName, coachCardInitials } from "@/components/coaches/coach-card-display";
import { formatDateForUi } from "@/lib/date-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type CoachDrawerRow = {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  assignedClassTypeIds: string[];
  schedule: {
    id: string;
    date: string;
    time: string;
    spots: number;
  }[];
  experienceYears: number | null;
  age: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalClasses: number;
  substituteClasses: number;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
  };
};

type CoachClassOption = {
  id: string;
  name: string;
};

type AdminCoachDetailsDrawerProps = {
  coach: CoachDrawerRow | null;
  classOptions: readonly CoachClassOption[];
  onClose: () => void;
  onEdit: (coachId: string) => void;
};

function classNamesForCoach(
  classIds: readonly string[],
  classOptions: readonly CoachClassOption[],
): string[] {
  const namesById = new Map(classOptions.map((option) => [option.id, option.name]));
  return classIds.map((id) => namesById.get(id) ?? id);
}

export function AdminCoachDetailsDrawer({
  coach,
  classOptions,
  onClose,
  onEdit,
}: AdminCoachDetailsDrawerProps) {
  const t = useTranslations("adminPages.coaches");

  useEffect(() => {
    if (coach === null) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [coach]);

  if (coach === null || typeof document === "undefined") {
    return null;
  }

  const displayName = coachCardDisplayName(coach.user);
  const assignedClasses = classNamesForCoach(coach.assignedClassTypeIds, classOptions);

  return createPortal(
    <div className="ommm-drawer-overlay z-[80]">
      <button
        type="button"
        className="ommm-modal-backdrop"
        aria-label={t("drawer.close")}
        onClick={onClose}
      />
      <aside className="relative z-10 h-full w-full max-w-3xl overflow-y-auto border-l border-white/60 bg-white/95 p-5 shadow-[-12px_0_32px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sage-500">
              {t("drawer.eyebrow")}
            </p>
            <h2 className="text-xl font-semibold text-sage-900">{displayName}</h2>
            <p className="text-sm text-sage-600">
              {coach.user.phone ?? "—"} · {coach.user.email}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={t("drawer.close")}
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <CoachAvatar coach={coach} />
              <div className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
                <Field label={t("drawer.coachId")} value={coach.id} mono />
                <Field label={t("drawer.userId")} value={coach.userId} mono />
                <Field
                  label={t("drawer.status")}
                  value={
                    coach.isActive ? t("filters.statusActive") : t("filters.statusInactive")
                  }
                />
                <Field label={t("fieldSpecialization")} value={coach.specialization ?? "—"} />
                <Field label={t("fieldClassType")} value={coach.classType ?? "—"} />
                <Field
                  label={t("fieldBirthday")}
                  value={
                    coach.user.dateOfBirth !== null
                      ? formatDateForUi(coach.user.dateOfBirth)
                      : "—"
                  }
                />
                <Field
                  label={t("fieldAge")}
                  value={coach.age !== null ? String(coach.age) : "—"}
                />
                <Field
                  label={t("drawer.registrationDate")}
                  value={formatDateForUi(coach.createdAt)}
                />
              </div>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label={t("drawer.totalClasses")} value={coach.totalClasses} />
            <Metric label={t("drawer.substitutions")} value={coach.substituteClasses} />
            <Metric label={t("drawer.assignedClasses")} value={assignedClasses.length} />
            <Metric label={t("drawer.availabilitySlots")} value={coach.schedule.length} />
          </div>

          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <p className="font-medium text-sage-900">{t("drawer.profile")}</p>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <Field
                label={t("fieldExperience")}
                value={coach.experienceYears !== null ? String(coach.experienceYears) : "—"}
              />
              <Field label={t("colEmail")} value={coach.user.email} />
              <Field label={t("colPhone")} value={coach.user.phone ?? "—"} />
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-sage-700">
              {coach.bio ?? "—"}
            </p>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <p className="font-medium text-sage-900">{t("fieldAssignedClasses")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {assignedClasses.length > 0 ? (
                assignedClasses.map((name) => <Badge key={name} label={name} />)
              ) : (
                <span className="text-sm text-sage-500">—</span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <p className="font-medium text-sage-900">{t("fieldSchedule")}</p>
            <div className="mt-3 space-y-2">
              {coach.schedule.length > 0 ? (
                coach.schedule.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-sage-700"
                  >
                    {formatDateForUi(slot.date)} · {slot.time} ·{" "}
                    {t("drawer.spots", { count: slot.spots })}
                  </div>
                ))
              ) : (
                <p className="text-sm text-sage-500">—</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/60 bg-white/75 p-4">
            <p className="font-medium text-sage-900">{t("drawer.actions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <OmmButton
                type="button"
                size="sm"
                variant="primary"
                onClick={() => onEdit(coach.id)}
              >
                {t("editCoach")}
              </OmmButton>
              <AdminCoachStatusAction
                coachId={coach.id}
                isActive={coach.isActive}
                labels={{
                  activate: t("activateCoach"),
                  deactivate: t("deactivateCoach"),
                  saving: t("savingButton"),
                  confirmActivate: t("confirmActivate"),
                  confirmDeactivate: t("confirmDeactivate"),
                  activated: t("activateSuccess"),
                  deactivated: t("deactivateSuccess"),
                  failed: t("genericError"),
                }}
                onChanged={onClose}
              />
            </div>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function CoachAvatar({ coach }: { coach: CoachDrawerRow }) {
  const src =
    coach.user.avatarUrl !== null
      ? resolveApiAssetUrl(coach.user.avatarUrl) ?? coach.user.avatarUrl
      : null;
  if (src !== null) {
    return (
      <Image
        src={src}
        alt=""
        width={96}
        height={96}
        className="h-24 w-24 shrink-0 rounded-2xl object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-sand-100 text-2xl font-semibold text-sage-800">
      {coachCardInitials(coach.user)}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <p>
      <span className="block text-xs uppercase tracking-wide text-sage-500">{label}</span>
      <span className={mono ? "font-mono text-xs text-sage-800" : "text-sage-800"}>
        {value}
      </span>
    </p>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-sage-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs font-medium text-sage-800">
      {label}
    </span>
  );
}
