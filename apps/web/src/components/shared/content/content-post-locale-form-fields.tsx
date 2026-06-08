"use client";

import { useTranslations } from "next-intl";
import type {
  ContentPostFormValues,
  ContentPostLocale,
} from "@/components/shared/content/content-post-types";

type ContentPostLocaleFormFieldsProps = {
  values: ContentPostFormValues;
  activeLocale: ContentPostLocale;
  disabled?: boolean;
  onChange: (next: ContentPostFormValues) => void;
};

export function ContentPostLocaleFormFields({
  values,
  activeLocale,
  disabled = false,
  onChange,
}: ContentPostLocaleFormFieldsProps) {
  const t = useTranslations("contentAdminPages.content");
  const activeLocaleValues = values.locales[activeLocale];

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
    <div className="grid gap-4">
      <label className="flex flex-col gap-1.5">
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

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.excerpt")}
        </span>
        <textarea
          className="ommm-input min-h-20"
          value={activeLocaleValues.excerpt}
          disabled={disabled}
          onChange={(event) => updateLocaleField("excerpt", event.target.value)}
          placeholder={t("placeholders.excerpt")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {t("placeholders.body")}
        </span>
        <textarea
          className="ommm-input min-h-40"
          value={activeLocaleValues.body}
          disabled={disabled}
          onChange={(event) => updateLocaleField("body", event.target.value)}
          placeholder={t("placeholders.body")}
        />
      </label>

      <label className="flex flex-col gap-1.5">
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

      <label className="flex flex-col gap-1.5">
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
  );
}
