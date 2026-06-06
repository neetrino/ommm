"use client";

import { useTranslations } from "next-intl";
import {
  CONTENT_POST_STATUSES,
  CONTENT_POST_TYPES,
  type ContentPostFormValues,
} from "@/components/shared/content/content-post-types";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type ContentPostFormFieldsProps = {
  values: ContentPostFormValues;
  disabled?: boolean;
  onChange: <K extends keyof ContentPostFormValues>(
    key: K,
    value: ContentPostFormValues[K],
  ) => void;
};

export function ContentPostFormFields({
  values,
  disabled = false,
  onChange,
}: ContentPostFormFieldsProps) {
  const t = useTranslations("contentAdminPages.content");

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.title")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.title}
          disabled={disabled}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder={t("placeholders.title")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.slug")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.slug}
          disabled={disabled}
          onChange={(event) => onChange("slug", event.target.value)}
          placeholder={t("placeholders.slug")}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
        <OmmSelectDropdown
          ariaLabel={t("labels.type")}
          label={values.type}
          value={values.type}
          disabled={disabled}
          options={CONTENT_POST_TYPES.map((value) => ({ value, label: value }))}
          onChange={(next) => onChange("type", next as ContentPostFormValues["type"])}
        />
        <OmmSelectDropdown
          ariaLabel={t("labels.status")}
          label={values.status}
          value={values.status}
          disabled={disabled}
          options={CONTENT_POST_STATUSES.map((value) => ({ value, label: value }))}
          onChange={(next) => onChange("status", next as ContentPostFormValues["status"])}
        />
      </div>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.body")}
        </span>
        <textarea
          className="ommm-input min-h-32"
          value={values.body}
          disabled={disabled}
          onChange={(event) => onChange("body", event.target.value)}
          placeholder={t("placeholders.body")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.authorName")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.authorName}
          disabled={disabled}
          onChange={(event) => onChange("authorName", event.target.value)}
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
          onChange={(event) => onChange("tagsCsv", event.target.value)}
          placeholder={t("placeholders.tagsCsv")}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.seoTitle")}
        </span>
        <input
          className="ommm-input h-10"
          value={values.seoTitle}
          disabled={disabled}
          onChange={(event) => onChange("seoTitle", event.target.value)}
          placeholder={t("placeholders.seoTitle")}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.seoDescription")}
        </span>
        <textarea
          className="ommm-input min-h-20"
          value={values.seoDescription}
          disabled={disabled}
          onChange={(event) => onChange("seoDescription", event.target.value)}
          placeholder={t("placeholders.seoDescription")}
        />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.editorialNotes")}
        </span>
        <textarea
          className="ommm-input min-h-20"
          value={values.editorialNotes}
          disabled={disabled}
          onChange={(event) => onChange("editorialNotes", event.target.value)}
          placeholder={t("placeholders.editorialNotes")}
        />
      </label>
    </div>
  );
}
