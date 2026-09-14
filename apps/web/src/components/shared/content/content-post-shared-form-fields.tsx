"use client";

import { useTranslations } from "next-intl";
import type { ContentPostFormValues } from "@/components/shared/content/content-post-types";
import { ContentPostCoverImageField } from "@/components/shared/content/content-post-cover-image-field";
import { ContentPostTypeStatusFields } from "@/components/shared/content/content-post-type-status-fields";

type ContentPostSharedFormFieldsProps = {
  values: ContentPostFormValues;
  disabled?: boolean;
  showTypeStatus?: boolean;
  onChange: (next: ContentPostFormValues) => void;
};

export function ContentPostSharedFormFields({
  values,
  disabled = false,
  showTypeStatus = true,
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
      <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
        <div className="grid min-w-0 gap-2">
          {showTypeStatus ? (
            <ContentPostTypeStatusFields
              values={values}
              disabled={disabled}
              layout="stacked"
              onChange={onChange}
            />
          ) : null}
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
        </div>

        <ContentPostCoverImageField
          layout="compact"
          coverImageUrl={values.coverImageUrl}
          disabled={disabled}
          onChange={(coverImageUrl) => updateSharedField("coverImageUrl", coverImageUrl)}
        />
      </div>

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
