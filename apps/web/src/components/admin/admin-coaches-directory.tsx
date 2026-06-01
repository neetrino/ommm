"use client";

import Image from "next/image";
import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCoachDetailsDrawer } from "@/components/admin/admin-coach-details-drawer";
import { AdminCoachStatusAction } from "@/components/admin/admin-coach-status-action";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import { useAdminCoachesView } from "@/components/admin/admin-coaches-view-context";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { PublicCoachCard } from "@/components/coaches/public-coach-card";
import { usePathname, useRouter } from "@/i18n/navigation";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

export type AdminCoachDirectoryRow = {
  id: string;
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
  userId: string;
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

type AdminCoachesDirectoryProps = {
  coaches: readonly AdminCoachDirectoryRow[];
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
};

function CoachActionsCell({
  coach,
  classTypeOptions,
  classOptions,
  locale = "en",
}: {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
}) {
  return (
    <AdminCoachActions
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
  );
}

function CoachStatusActionCell({ coach }: { coach: AdminCoachDirectoryRow }) {
  const t = useTranslations("adminPages.coaches");

  return (
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
    />
  );
}

function CoachAvatar({ coach }: { coach: AdminCoachDirectoryRow }) {
  const src =
    coach.user.avatarUrl !== null
      ? resolveApiAssetUrl(coach.user.avatarUrl) ?? coach.user.avatarUrl
      : null;
  if (src !== null) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-sm font-semibold text-sage-800">
      {coachCardDisplayName(coach.user).slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("adminPages.coaches");
  const className = isActive
    ? "border-mint-200 bg-mint-50 text-sage-900"
    : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${className}`}>
      {isActive ? t("filters.statusActive") : t("filters.statusInactive")}
    </span>
  );
}

function AdminCoachesListView({
  coaches,
  classTypeOptions,
  classOptions,
  locale = "en",
  onSelect,
}: AdminCoachesDirectoryProps & { onSelect: (coach: AdminCoachDirectoryRow) => void }) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className={adminChrome.tableWrap}>
      <table className={`${adminChrome.table} table-fixed min-w-[58rem]`}>
        <colgroup>
          <col className="w-[27%]" />
          <col className="w-[20%]" />
          <col className="w-[15%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{t("colName")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colPhone")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colSpecialization")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colWorkload")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colStatus")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map((coach) => (
            <tr key={coach.id} className={adminChrome.tr}>
              <td className={adminChrome.tdStrong}>
                <div className="flex items-center gap-3">
                  <CoachAvatar coach={coach} />
                  <div className="min-w-0">
                    <button
                      type="button"
                      className="break-words text-left underline decoration-sage-300 underline-offset-4"
                      onClick={() => onSelect(coach)}
                    >
                      {coachCardDisplayName(coach.user)}
                    </button>
                    <div className="break-words text-xs font-normal text-sage-500">
                      {coach.user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className={`${adminChrome.td} text-center`}>{coach.user.phone ?? "—"}</td>
              <td className={`${adminChrome.td} text-center`}>
                {coach.specialization ?? "—"}
              </td>
              <td className={`${adminChrome.td} text-center`}>
                {t("workloadSummary", {
                  classes: coach.totalClasses,
                  slots: coach.schedule.length,
                })}
              </td>
              <td className={`${adminChrome.td} text-center`}>
                <StatusBadge isActive={coach.isActive} />
              </td>
              <td className={`${adminChrome.td} text-center`}>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-sand-500/30 px-3 py-2 text-xs text-sage-700 transition-colors hover:bg-sand-50/70"
                    onClick={() => onSelect(coach)}
                  >
                    {t("viewCoach")}
                  </button>
                  <CoachActionsCell
                    coach={coach}
                    classTypeOptions={classTypeOptions}
                    classOptions={classOptions}
                    locale={locale}
                  />
                  <CoachStatusActionCell coach={coach} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminCoachesBoardView({
  coaches,
  classTypeOptions,
  classOptions,
  locale = "en",
  onSelect,
}: AdminCoachesDirectoryProps & { onSelect: (coach: AdminCoachDirectoryRow) => void }) {
  const tMarketing = useTranslations("marketing");
  const t = useTranslations("adminPages.coaches");

  return (
    <ul className="grid grid-cols-1 items-stretch gap-6 overflow-x-clip md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {coaches.map((coach, index) => {
        const experienceText =
          coach.experienceYears != null && coach.experienceYears > 0
            ? tMarketing("coachesExperience", { years: coach.experienceYears })
            : null;

        return (
          <li key={coach.id} className="list-none flex min-w-0">
            <PublicCoachCard
              user={coach.user}
              specialization={coach.specialization}
              experienceText={experienceText}
              bio={coach.bio}
              imageIndex={index}
              equalHeightLayout
              className="h-full w-full"
              footer={
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-xs text-sage-500">{coach.user.email}</p>
                    <StatusBadge isActive={coach.isActive} />
                  </div>
                  <p className="text-xs text-sage-500">
                    {t("workloadSummary", {
                      classes: coach.totalClasses,
                      slots: coach.schedule.length,
                    })}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-sand-500/30 px-3 py-2 text-xs text-sage-700 transition-colors hover:bg-sand-50/70"
                      onClick={() => onSelect(coach)}
                    >
                      {t("viewCoach")}
                    </button>
                  <CoachActionsCell
                    coach={coach}
                    classTypeOptions={classTypeOptions}
                    classOptions={classOptions}
                    locale={locale}
                  />
                    <CoachStatusActionCell coach={coach} />
                  </div>
                </div>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}

export function AdminCoachesDirectory(props: AdminCoachesDirectoryProps) {
  const t = useTranslations("adminPages.coaches");
  const { viewMode } = useAdminCoachesView();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCoachId = searchParams.get("coachProfile");
  const selectedCoach = useMemo(() => {
    if (selectedCoachId === null) {
      return null;
    }
    return props.coaches.find((coach) => coach.id === selectedCoachId) ?? null;
  }, [props.coaches, selectedCoachId]);

  const updateQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openProfileDrawer = useCallback(
    (coach: AdminCoachDirectoryRow) => {
      updateQuery((params) => {
        params.set("coachProfile", coach.id);
      });
    },
    [updateQuery],
  );

  const closeProfileDrawer = useCallback(() => {
    updateQuery((params) => {
      params.delete("coachProfile");
    });
  }, [updateQuery]);

  const openEditModal = useCallback(
    (coachId: string) => {
      updateQuery((params) => {
        params.delete("coachProfile");
        params.set("editCoach", coachId);
      });
    },
    [updateQuery],
  );

  const content =
    viewMode === "board" ? (
      <AdminCoachesBoardView {...props} onSelect={openProfileDrawer} />
    ) : (
      <AdminCoachesListView {...props} onSelect={openProfileDrawer} />
    );

  return (
    <>
      {content}
      {props.coaches.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("emptyState")}
        </div>
      ) : null}
      <AdminCoachDetailsDrawer
        coach={selectedCoach}
        classOptions={props.classOptions}
        onClose={closeProfileDrawer}
        onEdit={openEditModal}
      />
    </>
  );
}
