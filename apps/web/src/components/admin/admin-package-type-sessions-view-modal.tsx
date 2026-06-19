"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  resolvePackageTypeSessionAllocations,
} from "@/components/admin/admin-package-type-sessions.util";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";

type AdminPackageTypeSessionsViewModalProps = {
  isOpen: boolean;
  packageRow: AdminPackageRow | null;
  classTypeOptions: readonly { id: string; name: string }[];
  onClose: () => void;
  onEdit: () => void;
};

export function AdminPackageTypeSessionsViewModal({
  isOpen,
  packageRow,
  classTypeOptions,
  onClose,
  onEdit,
}: AdminPackageTypeSessionsViewModalProps) {
  const t = useTranslations("adminPages.packages.typeSessionsModal");

  const classTypeNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const classType of classTypeOptions) {
      map.set(classType.id, classType.name);
    }
    return map;
  }, [classTypeOptions]);

  const rows = useMemo(() => {
    if (packageRow === null) {
      return [];
    }
    return resolvePackageTypeSessionAllocations(packageRow).map((allocation) => ({
      id: allocation.classTypeId,
      typeName: classTypeNameById.get(allocation.classTypeId) ?? allocation.classTypeId,
      sessionCount: allocation.sessionCount,
      description: allocation.description?.trim() ?? "",
    }));
  }, [classTypeNameById, packageRow]);

  if (!isOpen || packageRow === null) {
    return null;
  }

  const packageName = formatPackagePlanName(
    packageRow.name,
    packageRow.sessionsPerMonth,
  );

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("backdropClose")}
      useOverlayPortalRoot
      overlayClassName="ommm-modal-overlay z-[130]"
      panelClassName="mt-auto flex max-h-[92vh] w-full max-w-[min(560px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <h2 className={adminChrome.panelHeading}>{t("viewTitle")}</h2>
            <p className="mt-1 text-sm font-semibold text-sage-900">{packageName}</p>
            <p className="ommm-body-muted mt-1 text-sm">{t("viewDescription")}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            aria-label={t("closeAria")}
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 sm:px-7">
          {rows.length === 0 ? (
            <p className="text-sm text-sage-600">{t("viewEmpty")}</p>
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-[rgba(151,144,124,0.28)] bg-white/75">
              <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3 border-b border-[rgba(151,144,124,0.22)] bg-[rgba(151,144,124,0.12)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-sage-600 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.2fr)] sm:px-5">
                <span>{t("fieldType")}</span>
                <span className="text-right">{t("fieldSessionCount")}</span>
                <span className="hidden sm:inline">{t("fieldDescription")}</span>
              </div>
              <ul className="divide-y divide-[rgba(151,144,124,0.22)]">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3 px-4 py-3.5 text-sm text-sage-900 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.2fr)] sm:px-5"
                  >
                    <span className="font-medium">{row.typeName}</span>
                    <span className="text-right font-semibold">{row.sessionCount}</span>
                    <span className="col-span-2 whitespace-pre-wrap text-sage-600 sm:col-span-1 sm:text-left">
                      {row.description.length > 0 ? row.description : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/60 bg-white/85 px-5 py-4 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7">
          <OmmButton type="button" variant="secondary" size="md" onClick={onClose}>
            {t("closeButton")}
          </OmmButton>
          <OmmButton type="button" variant="primary" size="md" onClick={onEdit}>
            {t("editButton")}
          </OmmButton>
        </div>
      </div>
    </OmmModalPortal>
  );
}
