"use client";

import { useTranslations } from "next-intl";
import { AdminPackageFormSection } from "@/components/admin/admin-package-form-section";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  type AdminPackageFormValues,
} from "@/components/admin/admin-package-form-utils";
import { OmmFormDropdown } from "@/components/ui/omm-select-dropdown";

type AdminPackageFormDetailsSectionProps = {
  values: AdminPackageFormValues;
  pending: boolean;
  classTypeOptions: readonly { id: string; name: string }[];
  onValuesChange: (patch: Partial<AdminPackageFormValues>) => void;
};

export function AdminPackageFormDetailsSection({
  values,
  pending,
  classTypeOptions,
  onValuesChange,
}: AdminPackageFormDetailsSectionProps) {
  const t = useTranslations("adminPages.packages");

  return (
    <AdminPackageFormSection
      heading={t("formSections.details.heading")}
      description={t("formSections.details.description")}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldGroupName")}</span>
          <input
            name="name"
            className="ommm-input"
            maxLength={MAX_NAME_LENGTH}
            value={values.name}
            onChange={(event) => onValuesChange({ name: event.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("fieldClassType")}
          </span>
          <OmmFormDropdown
            value={values.classTypeId}
            ariaLabel={t("fieldClassType")}
            placeholderLabel={t("fieldClassTypePlaceholder")}
            options={classTypeOptions.map((classType) => ({
              value: classType.id,
              label: classType.name,
            }))}
            onChange={(nextValue) => onValuesChange({ classTypeId: nextValue })}
            disabled={pending}
            name="classTypeId"
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldDescription")}</span>
          <textarea
            name="description"
            className="ommm-input min-h-24 resize-y"
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={values.description}
            onChange={(event) => onValuesChange({ description: event.target.value })}
            disabled={pending}
          />
        </label>
      </div>
    </AdminPackageFormSection>
  );
}
