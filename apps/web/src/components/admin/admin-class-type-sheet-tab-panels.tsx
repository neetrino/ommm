"use client";

import { useTranslations } from "next-intl";
import { buildClassTypeSlugFromName } from "@/lib/class-type-slug";
import type { useClassTypeEditForm } from "@/components/admin/admin-class-type-edit-form.use";
import {
  CLASS_TYPE_MAX_DESCRIPTION_LENGTH,
  CLASS_TYPE_MAX_NAME_LENGTH,
} from "@/components/admin/admin-class-type-edit-form.validation";
import {
  CLASS_TYPE_SHEET_TAB_DETAILS,
  CLASS_TYPE_SHEET_TAB_USAGE,
} from "@/components/admin/admin-class-type-sheet-tabs";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-types";
import { formatDateForUi } from "@/lib/date-display";

type ClassTypeFormController = ReturnType<typeof useClassTypeEditForm>;

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5";

type ClassTypeSheetTabPanelsProps = {
  activeTab: string;
  mode: "create" | "edit";
  selectedType: AdminClassTypeRow | null;
  sessionCount: number;
  controller: ClassTypeFormController;
};

export function ClassTypeSheetTabPanels({
  activeTab,
  mode,
  selectedType,
  sessionCount,
  controller,
}: ClassTypeSheetTabPanelsProps) {
  const t = useTranslations("adminPages.classes.classTypes");

  if (activeTab === CLASS_TYPE_SHEET_TAB_DETAILS) {
    return (
      <section className={SECTION_CLASS}>
        {mode === "edit" && selectedType !== null ? (
          <div className="mb-4 space-y-1 text-xs text-sage-500">
            <p>{selectedType.slug}</p>
            {selectedType.createdAt !== undefined ? (
              <p>{t("createdLabel", { date: formatDateForUi(selectedType.createdAt) })}</p>
            ) : null}
            {selectedType.updatedAt !== undefined ? (
              <p>{t("updatedLabel", { date: formatDateForUi(selectedType.updatedAt) })}</p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">
              {t("fieldName")}
              <span className="text-red-600" aria-hidden>
                {" "}
                *
              </span>
            </span>
            <input
              className={`ommm-input ${controller.errors.name ? "border-red-300" : ""}`}
              value={controller.form.name}
              maxLength={CLASS_TYPE_MAX_NAME_LENGTH}
              onChange={(event) =>
                controller.updateForm({ ...controller.form, name: event.target.value })
              }
              onBlur={() => controller.validateField("name")}
              disabled={controller.busy}
              required
              aria-invalid={controller.errors.name !== undefined}
            />
            {controller.errors.name ? (
              <p className="text-xs text-red-700" role="alert">
                {controller.errors.name}
              </p>
            ) : null}
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldSlug")}</span>
            <p className="ommm-input bg-white/40 text-sage-600" aria-live="polite">
              {buildClassTypeSlugFromName(controller.form.name) || "—"}
            </p>
            <p className="text-[11px] text-sage-500">{t("slugHint")}</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
            <textarea
              className={`ommm-input min-h-28 ${controller.errors.description ? "border-red-300" : ""}`}
              value={controller.form.description}
              maxLength={CLASS_TYPE_MAX_DESCRIPTION_LENGTH}
              onChange={(event) =>
                controller.updateForm({ ...controller.form, description: event.target.value })
              }
              onBlur={() => controller.validateField("description")}
              disabled={controller.busy}
            />
            {controller.errors.description ? (
              <p className="text-xs text-red-700" role="alert">
                {controller.errors.description}
              </p>
            ) : null}
          </label>
        </div>
      </section>
    );
  }

  if (activeTab === CLASS_TYPE_SHEET_TAB_USAGE && mode === "edit") {
    return (
      <section className={SECTION_CLASS}>
        <p className="font-medium text-sage-900">{t("usageHeading")}</p>
        <p className="mt-3 text-sm text-sage-700">
          {sessionCount > 0
            ? t("sessionCount", { count: sessionCount })
            : t("sessionCountNone")}
        </p>
        {sessionCount > 0 ? (
          <p className="mt-4 rounded-xl border border-sand-300/60 bg-sand-50 px-3 py-2 text-xs text-sage-700">
            {t("linkedSessionsHint", { count: sessionCount })}
          </p>
        ) : (
          <p className="mt-4 text-sm text-sage-500">{t("usageEmpty")}</p>
        )}
      </section>
    );
  }

  return null;
}
