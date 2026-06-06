"use client";

import { useTranslations } from "next-intl";
import type { ContentPostFormValues } from "@/components/shared/content/content-post-types";
import {
  CONTENT_POST_STATUSES,
  CONTENT_POST_TYPES,
} from "@/components/shared/content/content-post-types";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type ContentPostSharedFormFieldsProps = {
  values: ContentPostFormValues;
  disabled?: boolean;
  onChange: (next: ContentPostFormValues) => void;
};

export function ContentPostSharedFormFields({
  values,
  disabled = false,
  onChange,
}: ContentPostSharedFormFieldsProps) {
  const t = useTranslations("contentAdminPages.content");

  function updateSharedField<K extends keyof Omit<ContentPostFormValues, "locales">>(
    key: K,
    value: ContentPostFormValues[K],
  ): void {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <OmmSelectDropdown
          ariaLabel={t("labels.type")}
          label={t(`typeValues.${values.type}`)}
          value={values.type}
          disabled={disabled}
          options={CONTENT_POST_TYPES.map((value) => ({
            value,
            label: t(`typeValues.${value}`),
          }))}
          onChange={(next) => updateSharedField("type", next as ContentPostFormValues["type"])}
        />
        <OmmSelectDropdown
          ariaLabel={t("labels.status")}
          label={t(`statusValues.${values.status}`)}
          value={values.status}
          disabled={disabled}
          options={CONTENT_POST_STATUSES.map((value) => ({
            value,
            label: t(`statusValues.${value}`),
          }))}
          onChange={(next) =>
            updateSharedField("status", next as ContentPostFormValues["status"])
          }
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.authorName")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.authorName}
          disabled={disabled}
          onChange={(event) => updateSharedField("authorName", event.target.value)}
          placeholder={t("placeholders.authorName")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.tagsCsv")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.tagsCsv}
          disabled={disabled}
          onChange={(event) => updateSharedField("tagsCsv", event.target.value)}
          placeholder={t("placeholders.tagsCsv")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.editorialNotes")}
        </span>
        <textarea
          className="ommm-input min-h-20"
          value={values.editorialNotes}
          disabled={disabled}
          onChange={(event) => updateSharedField("editorialNotes", event.target.value)}
          placeholder={t("placeholders.editorialNotes")}
        />
      </label>
    </div>
  );
}
