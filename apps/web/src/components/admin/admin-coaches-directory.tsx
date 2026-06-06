"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminCoachCompactRow } from "@/components/admin/admin-coach-compact-row";
import {
  ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL,
  ADMIN_COACHES_LIST_EMPHASIZED_HEADER,
  ADMIN_COACHES_LIST_HEADER_CLASS,
  ADMIN_COACHES_LIST_TABLE_CLASS,
} from "@/components/admin/admin-coaches-list-layout";
import { AdminCoachBoardCard } from "@/components/admin/admin-coach-board-card";
import { AdminCoachDetailsDrawer } from "@/components/admin/admin-coach-details-drawer";
import { useAdminCoachesView } from "@/components/admin/admin-coaches-view-context";
import { useEffectiveListBoardViewMode } from "@/hooks/use-effective-list-board-view-mode";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";

export type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";

type AdminCoachesDirectoryProps = {
  coaches: readonly AdminCoachDirectoryRow[];
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
};

function AdminCoachesListView({
  coaches,
  classTypeOptions,
  classOptions,
  locale = "en",
  onSelect,
}: AdminCoachesDirectoryProps & { onSelect: (coach: AdminCoachDirectoryRow) => void }) {
  const t = useTranslations("adminPages.coaches");

  return (
    <div className={ADMIN_COACHES_LIST_TABLE_CLASS}>
      <div className={ADMIN_COACHES_LIST_HEADER_CLASS}>
        <span>{t("colCoaches")}</span>
        <span className={`${ADMIN_COACHES_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colSpecialization")}
        </span>
        <span className={`${ADMIN_COACHES_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colWorkload")}
        </span>
        <span className={`${ADMIN_COACHES_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colStatus")}
        </span>
        <span aria-hidden="true" />
        <span className={ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
      </div>
      {coaches.map((coach) => (
        <AdminCoachCompactRow
          key={coach.id}
          coach={coach}
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          locale={locale}
          onSelect={onSelect}
        />
      ))}
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
  return (
    <ul className="grid grid-cols-1 items-start gap-6 overflow-x-clip sm:grid-cols-2 2xl:grid-cols-3">
      {coaches.map((coach, index) => (
        <li key={coach.id} className="flex min-w-0 list-none">
          <AdminCoachBoardCard
            coach={coach}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
            imageIndex={index}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

export function AdminCoachesDirectory(props: AdminCoachesDirectoryProps) {
  const t = useTranslations("adminPages.coaches");
  const { viewMode: preferredViewMode } = useAdminCoachesView();
  const viewMode = useEffectiveListBoardViewMode(preferredViewMode);
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
