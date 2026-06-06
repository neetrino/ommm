"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  CONTENT_POST_LOCALES,
  CONTENT_POST_STATUSES,
  CONTENT_POST_TYPES,
  hasContentPostLocaleDraft,
  type ContentPostFormValues,
  type ContentPostLocale,
} from "@/components/shared/content/content-post-types";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type ContentPostFormFieldsProps = {
  values: ContentPostFormValues;
  disabled?: boolean;
  onChange: (next: ContentPostFormValues) => void;
};

export function ContentPostFormFields({
  values,
  disabled = false,
  onChange,
}: ContentPostFormFieldsProps) {
  const t = useTranslations("contentAdminPages.content");
  const [activeLocale, setActiveLocale] = useState<ContentPostLocale>("en");

  const localeTabs = useMemo(
    () =>
      CONTENT_POST_LOCALES.map((locale) => ({
        value: locale,
        label: t(`localeTabs.${locale}`),
      })),
    [t],
  );

  const activeLocaleValues = values.locales[activeLocale];

  function updateSharedField<K extends keyof Omit<ContentPostFormValues, "locales">>(
    key: K,
    value: ContentPostFormValues[K],
  ): void {
    onChange({ ...values, [key]: value });
  }

  function updateLocaleField(
    key: keyof ContentPostFormValues["locales"][ContentPostLocale],
    value: string,
  ): void {
    onChange({
      ...values,
      locales: {
        ...values.locales,
        [activeLocale]: {
          ...values.locales[activeLocale],
          [key]: value,
        },
      },
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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

      <AdminDetailSheetTabBar
        className="!px-0"
        ariaLabel={t("localeTabs.aria")}
        tabs={localeTabs.map((tab) => ({
          ...tab,
          label: hasContentPostLocaleDraft(values.locales[tab.value as ContentPostLocale])
            ? `${tab.label} ·`
            : tab.label,
        }))}
        activeTab={activeLocale}
        onTabChange={(value) => setActiveLocale(value as ContentPostLocale)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("placeholders.title")}
          </span>
          <input
            className="ommm-input h-10"
            value={activeLocaleValues.title}
            disabled={disabled}
            onChange={(event) => updateLocaleField("title", event.target.value)}
            placeholder={t("placeholders.title")}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("placeholders.slug")}
          </span>
          <input
            className="ommm-input h-10"
            value={activeLocaleValues.slug}
            disabled={disabled}
            onChange={(event) => updateLocaleField("slug", event.target.value)}
            placeholder={t("placeholders.slug")}
          />
          {activeLocale !== "en" && activeLocaleValues.slug.trim().length === 0 ? (
            <span className="text-xs text-sage-500">{t("localeTabs.slugHint")}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("placeholders.body")}
          </span>
          <textarea
            className="ommm-input min-h-32"
            value={activeLocaleValues.body}
            disabled={disabled}
            onChange={(event) => updateLocaleField("body", event.target.value)}
            placeholder={t("placeholders.body")}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("placeholders.seoTitle")}
          </span>
          <input
            className="ommm-input h-10"
            value={activeLocaleValues.seoTitle}
            disabled={disabled}
            onChange={(event) => updateLocaleField("seoTitle", event.target.value)}
            placeholder={t("placeholders.seoTitle")}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
            {t("placeholders.seoDescription")}
          </span>
          <textarea
            className="ommm-input min-h-20"
            value={activeLocaleValues.seoDescription}
            disabled={disabled}
            onChange={(event) => updateLocaleField("seoDescription", event.target.value)}
            placeholder={t("placeholders.seoDescription")}
          />
        </label>
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
