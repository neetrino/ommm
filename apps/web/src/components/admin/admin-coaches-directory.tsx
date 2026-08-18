"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminCoachCompactRow } from "@/components/admin/admin-coach-compact-row";
import {
  ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL,
  ADMIN_COACHES_LIST_EMPHASIZED_HEADER,
  ADMIN_COACHES_LIST_HEADER_CLASS,
  ADMIN_COACHES_LIST_TABLE_CLASS,
  ADMIN_COACHES_LIST_TABLE_READONLY_CLASS,
} from "@/components/admin/admin-coaches-list-layout";
import { AdminCoachBoardCard } from "@/components/admin/admin-coach-board-card";
import { AdminCoachDetailsDrawer } from "@/components/admin/admin-coach-details-drawer";
import { COACH_PROFILE_TAB_QUERY_KEY } from "@/components/admin/admin-coach-sheet-tabs";
import { useAdminCoachesView } from "@/components/admin/admin-coaches-view-context";
import { useEffectiveListBoardViewMode } from "@/hooks/use-effective-list-board-view-mode";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import type { AdminCoachesListPayload } from "@/components/admin/admin-coaches-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
import {
  adminBackofficeCapabilities,
  type BackofficeCapabilities,
} from "@/lib/backoffice-capabilities";

export type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";

type AdminCoachesDirectoryProps = {
  initial: AdminCoachesListPayload;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: BackofficeCapabilities;
};

type AdminCoachesViewProps = {
  coaches: readonly AdminCoachDirectoryRow[];
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
  readOnly?: boolean;
};

function AdminCoachesListView({
  coaches,
  classTypeOptions,
  classOptions,
  locale = "en",
  readOnly = false,
  onSelect,
}: AdminCoachesViewProps & { onSelect: (coach: AdminCoachDirectoryRow) => void }) {
  const t = useTranslations("adminPages.coaches");
  const tableClass = readOnly
    ? ADMIN_COACHES_LIST_TABLE_READONLY_CLASS
    : ADMIN_COACHES_LIST_TABLE_CLASS;

  return (
    <div className={tableClass}>
      <div className={ADMIN_COACHES_LIST_HEADER_CLASS}>
        <span>{t("colCoaches")}</span>
        <span className={ADMIN_COACHES_LIST_EMPHASIZED_HEADER}>{t("colSpecialization")}</span>
        <span className={ADMIN_COACHES_LIST_EMPHASIZED_HEADER}>{t("colTags")}</span>
        <span className={ADMIN_COACHES_LIST_EMPHASIZED_HEADER}>{t("colWorkload")}</span>
        {readOnly ? null : (
          <span className={ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        )}
      </div>
      {coaches.map((coach) => (
        <AdminCoachCompactRow
          key={coach.id}
          coach={coach}
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          locale={locale}
          readOnly={readOnly}
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
  readOnly = false,
  onSelect,
}: AdminCoachesViewProps & { onSelect: (coach: AdminCoachDirectoryRow) => void }) {
  return (
    <ul className="grid grid-cols-1 items-stretch gap-6 overflow-x-clip sm:grid-cols-2 lg:grid-cols-3">
      {coaches.map((coach) => (
        <li key={coach.id} className="flex min-w-0 list-none">
          <AdminCoachBoardCard
            coach={coach}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
            readOnly={readOnly}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

export function AdminCoachesDirectory({
  initial,
  classTypeOptions,
  classOptions,
  locale = "en",
  readOnly = false,
  capabilities,
}: AdminCoachesDirectoryProps) {
  const caps =
    capabilities ??
    (readOnly
      ? { ...adminBackofficeCapabilities(), canCreate: false, canUpdate: false, canDelete: false }
      : adminBackofficeCapabilities());
  const hideActions = !caps.canUpdate;
  const t = useTranslations("adminPages.coaches");
  const { viewMode: preferredViewMode } = useAdminCoachesView();
  const viewMode = useEffectiveListBoardViewMode(preferredViewMode);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlCoachId = searchParams.get("coachProfile");
  const [visibleCoachId, setVisibleCoachId] = useState<string | null>(urlCoachId);
  const [prevUrlCoachId, setPrevUrlCoachId] = useState(urlCoachId);
  const [coachRows, setCoachRows] = useState(initial.items);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);
  if (urlCoachId !== prevUrlCoachId) {
    setPrevUrlCoachId(urlCoachId);
    setVisibleCoachId(urlCoachId);
  }
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setCoachRows(initial.items);
  }
  const coaches = coachRows;

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const selectedCoach = useMemo(() => {
    if (visibleCoachId === null) {
      return null;
    }
    return coaches.find((coach) => coach.id === visibleCoachId) ?? null;
  }, [coaches, visibleCoachId]);

  const setListPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
      setVisibleCoachId(coach.id);
      updateQuery((params) => {
        params.set("coachProfile", coach.id);
      });
    },
    [updateQuery],
  );

  const closeProfileDrawer = useCallback(() => {
    setVisibleCoachId(null);
    updateQuery((params) => {
      params.delete("coachProfile");
      params.delete(COACH_PROFILE_TAB_QUERY_KEY);
    });
  }, [updateQuery]);

  const viewProps: AdminCoachesViewProps = {
    coaches,
    classTypeOptions,
    classOptions,
    locale,
    readOnly: hideActions,
  };

  const content =
    viewMode === "board" ? (
      <AdminCoachesBoardView {...viewProps} onSelect={openProfileDrawer} />
    ) : (
      <AdminCoachesListView {...viewProps} onSelect={openProfileDrawer} />
    );

  return (
    <>
      {content}
      {coaches.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("emptyState")}
        </div>
      ) : null}
      {initial.total > 0 ? (
        <OmmListPagination
          total={initial.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={initial.offset}
          onPageChange={setListPage}
        />
      ) : null}
      <AdminCoachDetailsDrawer
        coach={selectedCoach}
        locale={locale}
        classOptions={classOptions}
        onClose={closeProfileDrawer}
        onCoachUpdated={(coachId, patch) => {
          setCoachRows((current) =>
            current.map((item) => (item.id === coachId ? { ...item, ...patch } : item)),
          );
        }}
        onSaveSuccess={setSaveToastMessage}
      />
      {saveToastMessage ? (
        <AdminCenterToast
          message={saveToastMessage}
          tone="ok"
          onDismiss={() => setSaveToastMessage(null)}
        />
      ) : null}
    </>
  );
}
