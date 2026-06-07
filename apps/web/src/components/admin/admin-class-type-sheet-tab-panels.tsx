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
import {
  adminSheetFieldInputClass,
  AdminSheetEditableField,
  AdminSheetReadOnlyField,
  ADMIN_SHEET_FORM_SECTION_CLASS,
} from "@/components/admin/admin-sheet-editable-field";
import { formatDateForUi } from "@/lib/date-display";

type ClassTypeFormController = ReturnType<typeof useClassTypeEditForm>;

const SECTION_CLASS = ADMIN_SHEET_FORM_SECTION_CLASS;

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
          <AdminSheetEditableField
            label={t("fieldName")}
            error={controller.errors.name}
            required
          >
            <input
              className={adminSheetFieldInputClass(controller.errors.name !== undefined)}
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
          </AdminSheetEditableField>

          <AdminSheetReadOnlyField
            label={t("fieldSlug")}
            value={buildClassTypeSlugFromName(controller.form.name) || "—"}
            hint={t("slugHint")}
          />

          <AdminSheetEditableField label={t("fieldDescription")} error={controller.errors.description}>
            <textarea
              className={adminSheetFieldInputClass(
                controller.errors.description !== undefined,
                "min-h-28",
              )}
              value={controller.form.description}
              maxLength={CLASS_TYPE_MAX_DESCRIPTION_LENGTH}
              onChange={(event) =>
                controller.updateForm({ ...controller.form, description: event.target.value })
              }
              onBlur={() => controller.validateField("description")}
              disabled={controller.busy}
            />
          </AdminSheetEditableField>
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
