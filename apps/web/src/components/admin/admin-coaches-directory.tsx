"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import { useAdminCoachesView } from "@/components/admin/admin-coaches-view-context";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { PublicCoachCard } from "@/components/coaches/public-coach-card";

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
  user: {
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

function AdminCoachesListView({
  coaches,
  classTypeOptions,
  classOptions,
  locale = "en",
}: AdminCoachesDirectoryProps) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className={adminChrome.tableWrap}>
      <table className={`${adminChrome.table} table-fixed min-w-[34rem]`}>
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[26%]" />
          <col className="w-[18%]" />
          <col className="w-[20%]" />
          <col className="w-[12%]" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{t("colName")}</th>
            <th className={adminChrome.th}>{t("colEmail")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colPhone")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colSpecialization")}</th>
            <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {coaches.map((coach) => (
            <tr key={coach.id} className={adminChrome.tr}>
              <td className={adminChrome.tdStrong}>{coachCardDisplayName(coach.user)}</td>
              <td className={adminChrome.td}>{coach.user.email}</td>
              <td className={`${adminChrome.td} text-center`}>{coach.user.phone ?? "—"}</td>
              <td className={`${adminChrome.td} text-center`}>
                {coach.specialization ?? "—"}
              </td>
              <td className={`${adminChrome.td} text-center`}>
                <CoachActionsCell
                  coach={coach}
                  classTypeOptions={classTypeOptions}
                  classOptions={classOptions}
                  locale={locale}
                />
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
}: AdminCoachesDirectoryProps) {
  const tMarketing = useTranslations("marketing");

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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-xs text-sage-500">{coach.user.email}</p>
                  <CoachActionsCell
                    coach={coach}
                    classTypeOptions={classTypeOptions}
                    classOptions={classOptions}
                    locale={locale}
                  />
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
  const { viewMode } = useAdminCoachesView();

  if (viewMode === "board") {
    return <AdminCoachesBoardView {...props} />;
  }

  return <AdminCoachesListView {...props} />;
}
